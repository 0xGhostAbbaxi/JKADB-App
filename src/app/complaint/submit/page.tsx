"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import CitizenNav from "@/components/CitizenNav";
import { CheckCircle, Copy, Loader2, AlertCircle, Upload, X } from "lucide-react";
import Link from "next/link";

interface District { id: string; nameEn: string; nameUr?: string | null; }
interface Category { id: string; nameEn: string; nameUr?: string | null; icon?: string | null; subcategories: SubCat[]; }
interface SubCat { id: string; nameEn: string; nameUr?: string | null; }

interface SubmitResult {
  trackingNumber: string;
  submittedAt: string;
  complaintId: string;
  trackingSecret: string;
}

export default function SubmitComplaintPage() {
  const { lang, t } = useApp();
  const isUrdu = lang === "ur";

  // Form data
  const [form, setForm] = useState({
    fullName: "",
    fatherName: "",
    cnicNumber: "",
    phone: "",
    email: "",
    districtId: "",
    tehsilCustom: "",
    unionCouncilCustom: "",
    postOfficeCustom: "",
    address: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Location data
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories, and auto-set the fixed district (LA-14 Bagh 1) — no dropdown, no selection.
  useEffect(() => {
    fetch("/api/locations/districts")
      .then((r) => r.json())
      .then((d) => {
        const bagh = (d.districts || []).find((x: District) => /bagh/i.test(x.nameEn)) || (d.districts || [])[0];
        if (bagh) setForm((f) => ({ ...f, districtId: bagh.id }));
      });
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const validate = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!form.fullName.trim()) newErrors.fullName = t("fieldRequired");
      if (!form.phone.trim()) newErrors.phone = t("fieldRequired");
      if (!form.fatherName.trim()) newErrors.fatherName = t("fieldRequired");
      const cnicClean = form.cnicNumber.replace(/-/g, "");
      if (!cnicClean || !/^\d{13}$/.test(cnicClean)) {
        newErrors.cnicNumber = t("invalidCnic");
      }
    }

    // Step 2 (location): District is fixed, Tehsil/Union Council/Post Office are all optional free-text fields.

    if (stepNum === 3) {
      if (!form.description.trim() || form.description.trim().length < 10) {
        newErrors.description = isUrdu ? "کم از کم 10 حروف درکار ہیں" : "Minimum 10 characters required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validate(3)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          fatherName: form.fatherName.trim(),
          cnicNumber: form.cnicNumber,
          phone: form.phone.trim(),
          email: form.email || undefined,
          districtId: form.districtId || undefined,
          tehsilCustom: form.tehsilCustom.trim() || undefined,
          unionCouncilCustom: form.unionCouncilCustom.trim() || undefined,
          postOfficeCustom: form.postOfficeCustom.trim() || undefined,
          address: form.address || undefined,
          categoryId: form.categoryId || undefined,
          subcategoryId: form.subcategoryId || undefined,
          description: form.description.trim(),
          additionalInfo: form.additionalInfo || undefined,
          language: lang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ trackingNumber: data.trackingNumber, submittedAt: data.submittedAt, complaintId: data.complaintId, trackingSecret: data.trackingSecret });
        setStep(4);
      } else {
        setErrors({ submit: data.error || t("somethingWentWrong") });
      }
    } catch {
      setErrors({ submit: t("somethingWentWrong") });
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    if (result) {
      navigator.clipboard.writeText(result.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fontStyle = {
    fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "Inter, sans-serif",
  };

  const inputClass = `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
    isUrdu ? "text-right" : ""
  }`;

  const labelClass = `block text-sm font-semibold mb-1 text-gray-700`;

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  // Step 4: Success
  if (step === 4 && result) {
    return (
      <div className="min-h-screen bg-gray-50" style={fontStyle}>
        <CitizenNav currentPage="submit" />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              {isUrdu ? "شکایت کامیابی سے جمع ہو گئی!" : "Complaint Submitted Successfully!"}
            </h1>
            <p className="text-gray-500 mb-8 text-sm">
              {isUrdu
                ? "آپ کی شکایت موصول ہو گئی ہے۔ نیچے دیا گیا نمبر محفوظ کریں۔"
                : "Your complaint has been received. Save the reference number below."}
            </p>

            <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl p-6 mb-6">
              <p className="text-red-200 text-sm mb-2">
                {isUrdu ? "شکایت نمبر" : "Complaint Reference ID"}
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-white font-black text-2xl tracking-wider" style={{ fontFamily: "monospace" }}>
                  {result.trackingNumber}
                </code>
                <button
                  onClick={copyId}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 text-white min-h-0"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
              {copied && <p className="text-green-300 text-xs mt-1">✓ Copied!</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{isUrdu ? "جمع کرانے کی تاریخ" : "Submitted At"}</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {new Date(result.submittedAt).toLocaleString(isUrdu ? "ur-PK" : "en-PK")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{isUrdu ? "موجودہ حالت" : "Status"}</p>
                <p className="font-semibold text-green-600 text-sm">
                  {isUrdu ? "جمع کرایا" : "Submitted"}
                </p>
              </div>
            </div>

            <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-left">
              <p className="font-bold text-green-900">{isUrdu ? "ثبوت / Evidence" : "Evidence (optional)"}</p>
              <p className="mt-1 text-sm text-green-800/80">{isUrdu ? "JPG، PNG یا PDF، زیادہ سے زیادہ 5MB فی فائل۔" : "JPG, PNG or PDF, maximum 5MB per file."}</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="mt-3 w-full rounded-xl border bg-white p-3"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !result) return;
                  setUploading(true);
                  const fd = new FormData();
                  fd.append("complaintId", result.complaintId);
                  fd.append("trackingSecret", result.trackingSecret);
                  fd.append("file", file);
                  try {
                    const r = await fetch("/api/complaints/attachments", { method: "POST", body: fd });
                    const d = await r.json();
                    if (r.ok) setUploadedFiles((v) => [...v, d.attachment.name]);
                    else setErrors({ submit: d.error || "Upload failed" });
                  } catch { setErrors({ submit: "Upload failed" }); }
                  finally { setUploading(false); e.currentTarget.value = ""; }
                }}
              />
              {uploading && <p className="mt-2 text-sm text-slate-500">Uploading securely…</p>}
              {uploadedFiles.length > 0 && <ul className="mt-3 space-y-1 text-sm text-green-800">{uploadedFiles.map((f) => <li key={f}>✓ {f}</li>)}</ul>}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
              <p className="text-amber-800 text-sm font-medium mb-1">
                ⚠️ {isUrdu ? "اہم ہدایت" : "Important"}
              </p>
              <p className="text-amber-700 text-sm">
                {isUrdu
                  ? "یہ نمبر محفوظ کریں۔ آپ اس نمبر سے اپنی شکایت کی حالت ٹریک کر سکتے ہیں۔"
                  : "Save this reference number. Use it to track your complaint status anytime."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/complaint/track`}
                className="flex-1 py-3 font-bold rounded-xl text-white text-center"
                style={{ background: "#146B3A" }}
              >
                {isUrdu ? "شکایت ٹریک کریں" : "Track Complaint"}
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 font-bold rounded-xl border-2 text-gray-700 text-center"
                style={{ borderColor: "#146B3A" }}
              >
                {isUrdu ? "ہوم پر جائیں" : "Go to Home"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={fontStyle}>
      <CitizenNav currentPage="submit" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[
              { n: 1, label: isUrdu ? "ذاتی معلومات" : "Personal Info" },
              { n: 2, label: isUrdu ? "مقام" : "Location" },
              { n: 3, label: isUrdu ? "شکایت" : "Complaint" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > s.n
                      ? "bg-green-500 text-white"
                      : step === s.n
                      ? "text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  style={step === s.n ? { background: "#146B3A" } : {}}
                >
                  {step > s.n ? "✓" : s.n}
                </div>
                <span className="text-sm font-medium text-gray-600 hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%`, background: "#146B3A" }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">👤</span>
                {isUrdu ? "ذاتی معلومات" : "Personal Information"}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>{isUrdu ? "پورا نام *" : "Full Name *"}</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`${inputClass} ${errors.fullName ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:border-red-800 focus:ring-red-100"}`}
                    placeholder={isUrdu ? "پورا نام لکھیں" : "Enter full name"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className={labelClass}>{isUrdu ? "والد کا نام *" : "Father Name *"}</label>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className={`${inputClass} ${errors.fatherName ? "border-red-400" : "border-gray-300 focus:border-red-800 focus:ring-red-100"}`}
                    placeholder={isUrdu ? "والد کا نام لکھیں" : "Enter father's name"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                  {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                </div>

                <div>
                  <label className={labelClass}>{isUrdu ? "شناختی کارڈ نمبر *" : "CNIC Number *"}</label>
                  <input
                    type="text"
                    value={form.cnicNumber}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g, "");
                      if (v.length > 5 && v.length <= 12) v = `${v.slice(0, 5)}-${v.slice(5)}`;
                      if (v.length > 13) v = `${v.slice(0, 13)}-${v.slice(13)}`;
                      if (v.length > 15) v = v.slice(0, 15);
                      setForm({ ...form, cnicNumber: v });
                    }}
                    className={`${inputClass} ${errors.cnicNumber ? "border-red-400" : "border-gray-300 focus:border-red-800 focus:ring-red-100"}`}
                    placeholder="XXXXX-XXXXXXX-X"
                    maxLength={15}
                    dir="ltr"
                  />
                  {errors.cnicNumber && <p className="text-red-500 text-sm mt-1">{errors.cnicNumber}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {isUrdu ? "آپ کا CNIC نمبر محفوظ اور خفیہ رہے گا" : "Your CNIC is stored securely and never shared"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{isUrdu ? "فون نمبر *" : "Phone *"}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                      placeholder="03XX-XXXXXXX"
                      dir="ltr"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{isUrdu ? "ای میل (اختیاری)" : "Email (Optional)"}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                      placeholder="email@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📍</span>
                {isUrdu ? "مقام کی معلومات" : "Location Information"}
              </h2>
              <div className="space-y-5">
                {/* District (fixed, not selectable) */}
                <div>
                  <label className={labelClass}>{isUrdu ? "ضلع" : "District"}</label>
                  <div className={`${inputClass} border-gray-300 bg-gray-50 text-gray-700 font-semibold flex items-center`}>
                    LA-14 Bagh 1
                  </div>
                </div>

                {/* Tehsil (free text, optional) */}
                <div>
                  <label className={labelClass}>{isUrdu ? "تحصیل (اختیاری)" : "Tehsil (Optional)"}</label>
                  <input
                    type="text"
                    value={form.tehsilCustom}
                    onChange={(e) => setForm({ ...form, tehsilCustom: e.target.value })}
                    className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                    placeholder={isUrdu ? "اپنی تحصیل کا نام لکھیں" : "Enter your Tehsil"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                </div>

                {/* Union Council (free text, optional) */}
                <div>
                  <label className={labelClass}>{isUrdu ? "یونین کونسل (اختیاری)" : "Union Council (Optional)"}</label>
                  <input
                    type="text"
                    value={form.unionCouncilCustom}
                    onChange={(e) => setForm({ ...form, unionCouncilCustom: e.target.value })}
                    className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                    placeholder={isUrdu ? "اپنی یونین کونسل لکھیں" : "Enter your Union Council"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                </div>

                {/* Post Office (free text, optional) */}
                <div>
                  <label className={labelClass}>{isUrdu ? "پوسٹ آفس (اختیاری)" : "Post Office (Optional)"}</label>
                  <input
                    type="text"
                    value={form.postOfficeCustom}
                    onChange={(e) => setForm({ ...form, postOfficeCustom: e.target.value })}
                    className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                    placeholder={isUrdu ? "اپنا پوسٹ آفس لکھیں" : "Enter your Post Office"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                </div>

                {/* Enter more details (optional) */}
                <div>
                  <label className={labelClass}>{isUrdu ? "مزید تفصیل درج کریں (اختیاری)" : "Enter more details (Optional)"}</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={2}
                    className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100 resize-none`}
                    placeholder={isUrdu ? "کوئی اضافی تفصیل لکھیں" : "Enter any additional details"}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </div>
          )}


          {/* Step 3: Complaint Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📋</span>
                {isUrdu ? "شکایت کی تفصیل" : "Complaint Details"}
              </h2>
              <div className="space-y-5">
                {/* Category */}
                <div>
                  <label className={labelClass}>{isUrdu ? "زمرہ" : "Category"}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, categoryId: cat.id, subcategoryId: "" })}
                        className={`p-3 rounded-xl border-2 text-center text-xs font-medium transition-all min-h-0 ${
                          form.categoryId === cat.id
                            ? "border-red-800 bg-red-50 text-red-800"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-xl mb-1">{cat.icon}</div>
                        <div className="leading-tight">
                          {isUrdu && cat.nameUr ? cat.nameUr : cat.nameEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory */}
                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label className={labelClass}>{isUrdu ? "ذیلی زمرہ" : "Subcategory"}</label>
                    <select
                      value={form.subcategoryId}
                      onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
                      className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100`}
                      dir={isUrdu ? "rtl" : "ltr"}
                    >
                      <option value="">{isUrdu ? "ذیلی زمرہ منتخب کریں" : "Select subcategory"}</option>
                      {selectedCategory.subcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {isUrdu && s.nameUr ? s.nameUr : s.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className={labelClass}>{isUrdu ? "شکایت کی تفصیل *" : "Description *"}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    className={`${inputClass} ${errors.description ? "border-red-400" : "border-gray-300 focus:border-red-800 focus:ring-red-100"} resize-none`}
                    placeholder={isUrdu ? "اپنی شکایت تفصیل سے بیان کریں..." : "Describe your complaint in detail..."}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    <p className="text-xs text-gray-400 ml-auto">{form.description.length}/5000</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <label className={labelClass}>{isUrdu ? "اضافی معلومات (اختیاری)" : "Additional Information (Optional)"}</label>
                  <textarea
                    value={form.additionalInfo}
                    onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                    rows={3}
                    className={`${inputClass} border-gray-300 focus:border-red-800 focus:ring-red-100 resize-none`}
                    placeholder={isUrdu ? "کوئی اضافی معلومات..." : "Any additional details..."}
                    dir={isUrdu ? "rtl" : "ltr"}
                  />
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {isUrdu ? "← پچھلا" : "← Back"}
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                  style={{ background: "#146B3A" }}
                >
                  {isUrdu ? "اگلا ←" : "Next →"}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
                  style={{ background: "#146B3A" }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {isUrdu ? "شکایت جمع کروائیں" : "Submit Complaint"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
