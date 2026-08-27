import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiMetrics } from "@/db/schema";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are JKADB Assistant, the official help assistant for Jammu Kashmir Awami Dast-o-Bazo (JKADB).
You help citizens understand how to use the JKADB public complaint platform.
Approved facts:
- Submit Complaint is the official route for creating a complaint.
- Track Complaint uses the complaint reference and verification details.
- Complaint categories include Roads, Electricity, Water, Sanitation, Health, Education, Security, Municipal Services, Infrastructure, Public Transport, Environment, Government Services, Street Lights, Drainage, Garbage, Public Safety and Other.
- Complaint status is controlled by the JKADB workflow and must not be invented.
- LA-14 Bagh (1) is an available constituency.
- Phone is required; email is optional.
- Evidence supports JPG/JPEG/PNG/PDF subject to platform limits.
- Help / FAQ and official contact information are the appropriate channels when the assistant lacks an answer.
- The assistant was built for JKADB by Hozafa Mehmood.
Never invent government policies, contacts, permissions, case details, or decisions.
Never claim to be an administrator.
Never perform admin/database actions.
Keep answers concise, practical, and friendly. Use short steps when useful.`;

export async function POST(req: NextRequest) {
  const started = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = rateLimit(`ai_${ip}`, 20, 10 * 60 * 1000);
  if (!limit.success) {
    await db.insert(aiMetrics).values({
      provider: "groq",
      model: process.env.GROQ_MODEL || null,
      success: false,
      rateLimited: true,
      latencyMs: Date.now() - started,
      errorType: "rate_limited",
    }).catch(() => {});
    return NextResponse.json({ error: "AI rate limit reached. Please try again shortly." }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    await db.insert(aiMetrics).values({
      provider: "groq",
      model: process.env.GROQ_MODEL || null,
      success: false,
      latencyMs: Date.now() - started,
      errorType: "missing_api_key",
    }).catch(() => {});
    return NextResponse.json({ error: "AI assistance is temporarily unavailable." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const language = body.language === "ur" ? "ur" : "en";
    const history = Array.isArray(body.history)
      ? body.history.slice(-8).filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      : [];

    if (!message || message.length > 2000) {
      return NextResponse.json({ error: "Message is required and must be 2000 characters or fewer." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 700,
        stream: true,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\nReply in ${language === "ur" ? "Urdu (RTL-friendly)" : "English"} unless the user clearly asks for another language.` },
          ...history,
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timeout);
      const upstreamErrorText = await upstream.text().catch(() => "");
      console.error("[AI chat] Groq upstream error", upstream.status, upstreamErrorText);
      await db.insert(aiMetrics).values({
        provider: "groq",
        model: process.env.GROQ_MODEL || null,
        success: false,
        latencyMs: Date.now() - started,
        errorType: upstream.status === 429 ? "provider_rate_limited" : `provider_${upstream.status}`,
        rateLimited: upstream.status === 429,
      }).catch(() => {});
      return NextResponse.json({ error: "AI assistance is temporarily unavailable." }, { status: 503 });
    }

    // Re-stream the provider's SSE tokens to the browser as plain text chunks,
    // so the assistant's reply appears live, word by word, instead of all at once.
    let fullAnswer = "";
    const encoder = new TextEncoder();
    const upstreamReader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = "";

    const stream = new ReadableStream({
      async pull(streamController) {
        const { done, value } = await upstreamReader.read();
        if (done) {
          clearTimeout(timeout);
          streamController.close();
          if (fullAnswer.trim()) {
            await db.insert(aiMetrics).values({
              provider: "groq",
              model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
              success: true,
              latencyMs: Date.now() - started,
              rateLimited: false,
            }).catch(() => {});
          } else {
            await db.insert(aiMetrics).values({
              provider: "groq",
              model: process.env.GROQ_MODEL || null,
              success: false,
              latencyMs: Date.now() - started,
              errorType: "empty_stream",
            }).catch(() => {});
          }
          return;
        }
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const token = json?.choices?.[0]?.delta?.content;
            if (typeof token === "string" && token.length) {
              fullAnswer += token;
              streamController.enqueue(encoder.encode(token));
            }
          } catch {
            // ignore malformed SSE fragments
          }
        }
      },
      cancel() {
        clearTimeout(timeout);
        upstreamReader.cancel().catch(() => {});
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[AI chat] Unhandled error", error);
    await db.insert(aiMetrics).values({
      provider: "groq",
      model: process.env.GROQ_MODEL || null,
      success: false,
      latencyMs: Date.now() - started,
      errorType: error instanceof Error && error.name === "AbortError" ? "timeout" : "server_error",
    }).catch(() => {});
    return NextResponse.json({ error: "AI assistance is temporarily unavailable." }, { status: 503 });
  }
}
