const { config } = require("dotenv");
config();
config({ path: ".env.local", override: true });
const { Pool } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not found. Make sure .env.local has it set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("Connecting to database...");
    await pool.query(
      `ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "union_council_custom" varchar(200);`
    );
    console.log('✅ Ensured column "union_council_custom" exists on "complaints"');

    await pool.query(
      `ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "post_office_custom" varchar(200);`
    );
    console.log('✅ Ensured column "post_office_custom" exists on "complaints"');

    console.log("🎉 Done. Try submitting a complaint again.");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
