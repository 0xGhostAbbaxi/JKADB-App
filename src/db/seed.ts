import "./load-env";
import { db } from "./index";
import {
  districts,
  tehsils,
  unionCouncils,
  postOffices,
  constituencies,
  areas,
  categories,
  subcategories,
  departments,
  adminUsers,
  slaConfigurations,
  faqItems,
  systemSettings,
  permissions,
  rolePermissions,
  publicContactInformation,
  quickAlerts,
  responseTemplates,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding JKADB database...");

  // ─── Districts of AJK ─────────────────────────────────────────────────────
  const districtData = [
    { nameEn: "Muzaffarabad", nameUr: "مظفرآباد", code: "MZB" },
    { nameEn: "Mirpur", nameUr: "میرپور", code: "MRP" },
    { nameEn: "Bhimber", nameUr: "بھمبر", code: "BHM" },
    { nameEn: "Kotli", nameUr: "کوٹلی", code: "KTL" },
    { nameEn: "Bagh", nameUr: "باغ", code: "BGH" },
    { nameEn: "Poonch (Rawalakot)", nameUr: "پونچھ (راولاکوٹ)", code: "PNC" },
    { nameEn: "Haveli", nameUr: "حویلی", code: "HVL" },
    { nameEn: "Neelum", nameUr: "نیلم", code: "NLM" },
    { nameEn: "Hattian Bala", nameUr: "ہٹیاں بالا", code: "HTB" },
    { nameEn: "Sudhnoti", nameUr: "سدھنوتی", code: "SDH" },
  ];

  const insertedDistricts: Record<string, string> = {};
  for (let i = 0; i < districtData.length; i++) {
    const d = districtData[i];
    const existing = await db
      .select()
      .from(districts)
      .where(eq(districts.code, d.code))
      .limit(1);
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(districts)
        .values({ ...d, sortOrder: i })
        .returning();
      insertedDistricts[d.code] = inserted.id;
    } else {
      insertedDistricts[d.code] = existing[0].id;
    }
  }

  console.log("✅ Districts seeded");

  // ─── Tehsils ───────────────────────────────────────────────────────────────
  const tehsilData = [
    // Muzaffarabad
    { nameEn: "Muzaffarabad", nameUr: "مظفرآباد", districtCode: "MZB" },
    { nameEn: "Hattian", nameUr: "ہٹیاں", districtCode: "MZB" },
    { nameEn: "Chakothi", nameUr: "چکوٹھی", districtCode: "MZB" },
    // Mirpur
    { nameEn: "Mirpur", nameUr: "میرپور", districtCode: "MRP" },
    { nameEn: "Dadyal", nameUr: "دادیال", districtCode: "MRP" },
    { nameEn: "Chakswari", nameUr: "چکسواری", districtCode: "MRP" },
    // Bhimber
    { nameEn: "Bhimber", nameUr: "بھمبر", districtCode: "BHM" },
    { nameEn: "Samahni", nameUr: "سماہنی", districtCode: "BHM" },
    // Kotli
    { nameEn: "Kotli", nameUr: "کوٹلی", districtCode: "KTL" },
    { nameEn: "Sehnsa", nameUr: "سہنسہ", districtCode: "KTL" },
    { nameEn: "Charhoi", nameUr: "چڑھوئی", districtCode: "KTL" },
    // Bagh
    { nameEn: "Bagh", nameUr: "باغ", districtCode: "BGH" },
    { nameEn: "Dhirkot", nameUr: "ڈھیرکوٹ", districtCode: "BGH" },
    { nameEn: "Banjosa", nameUr: "بنجوسہ", districtCode: "BGH" },
    // Poonch
    { nameEn: "Rawalakot", nameUr: "راولاکوٹ", districtCode: "PNC" },
    { nameEn: "Abbaspur", nameUr: "عباس پور", districtCode: "PNC" },
    { nameEn: "Mong", nameUr: "مونگ", districtCode: "PNC" },
    // Haveli
    { nameEn: "Forward Kahuta", nameUr: "فارورڈ کہوٹہ", districtCode: "HVL" },
    // Neelum
    { nameEn: "Athmuqam", nameUr: "آٹھ مقام", districtCode: "NLM" },
    { nameEn: "Sharda", nameUr: "شاردا", districtCode: "NLM" },
    // Hattian Bala
    { nameEn: "Hattian Bala", nameUr: "ہٹیاں بالا", districtCode: "HTB" },
    // Sudhnoti
    { nameEn: "Pallandri", nameUr: "پلندری", districtCode: "SDH" },
    { nameEn: "Trar Khal", nameUr: "ترار کھل", districtCode: "SDH" },
  ];

  const insertedTehsils: Record<string, string> = {};
  for (let i = 0; i < tehsilData.length; i++) {
    const t = tehsilData[i];
    const distId = insertedDistricts[t.districtCode];
    const existing = await db
      .select()
      .from(tehsils)
      .where(eq(tehsils.nameEn, t.nameEn))
      .limit(1);
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(tehsils)
        .values({ nameEn: t.nameEn, nameUr: t.nameUr, districtId: distId, sortOrder: i })
        .returning();
      insertedTehsils[`${t.districtCode}_${t.nameEn}`] = inserted.id;
    } else {
      insertedTehsils[`${t.districtCode}_${t.nameEn}`] = existing[0].id;
    }
  }

  console.log("✅ Tehsils seeded");

  // ─── Constituencies ────────────────────────────────────────────────────────
  const constituencyData = [
    // Bagh District
    {
      nameEn: "LA-14 Bagh (1)",
      nameUr: "ایل اے-14 باغ (1)",
      code: "LA-14",
      constituencyType: "LA",
      districtCode: "BGH",
      tehsilKey: "BGH_Bagh",
    },
    {
      nameEn: "LA-15 Bagh (2)",
      nameUr: "ایل اے-15 باغ (2)",
      code: "LA-15",
      constituencyType: "LA",
      districtCode: "BGH",
      tehsilKey: "BGH_Dhirkot",
    },
    // Muzaffarabad
    {
      nameEn: "LA-1 Muzaffarabad (1)",
      nameUr: "ایل اے-1 مظفرآباد (1)",
      code: "LA-1",
      constituencyType: "LA",
      districtCode: "MZB",
      tehsilKey: "MZB_Muzaffarabad",
    },
    {
      nameEn: "LA-2 Muzaffarabad (2)",
      nameUr: "ایل اے-2 مظفرآباد (2)",
      code: "LA-2",
      constituencyType: "LA",
      districtCode: "MZB",
      tehsilKey: "MZB_Muzaffarabad",
    },
    // Mirpur
    {
      nameEn: "LA-20 Mirpur (1)",
      nameUr: "ایل اے-20 میرپور (1)",
      code: "LA-20",
      constituencyType: "LA",
      districtCode: "MRP",
      tehsilKey: "MRP_Mirpur",
    },
    {
      nameEn: "LA-21 Mirpur (2)",
      nameUr: "ایل اے-21 میرپور (2)",
      code: "LA-21",
      constituencyType: "LA",
      districtCode: "MRP",
      tehsilKey: "MRP_Mirpur",
    },
    // Kotli
    {
      nameEn: "LA-28 Kotli (1)",
      nameUr: "ایل اے-28 کوٹلی (1)",
      code: "LA-28",
      constituencyType: "LA",
      districtCode: "KTL",
      tehsilKey: "KTL_Kotli",
    },
    // Poonch
    {
      nameEn: "LA-10 Poonch (1)",
      nameUr: "ایل اے-10 پونچھ (1)",
      code: "LA-10",
      constituencyType: "LA",
      districtCode: "PNC",
      tehsilKey: "PNC_Rawalakot",
    },
  ];

  const insertedConstituencies: Record<string, string> = {};
  for (let i = 0; i < constituencyData.length; i++) {
    const c = constituencyData[i];
    const distId = insertedDistricts[c.districtCode];
    const tehsilId = insertedTehsils[c.tehsilKey];
    const existing = await db
      .select()
      .from(constituencies)
      .where(eq(constituencies.code, c.code))
      .limit(1);
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(constituencies)
        .values({
          nameEn: c.nameEn,
          nameUr: c.nameUr,
          code: c.code,
          constituencyType: c.constituencyType,
          districtId: distId,
          tehsilId: tehsilId,
          sortOrder: i,
        })
        .returning();
      insertedConstituencies[c.code] = inserted.id;
    } else {
      insertedConstituencies[c.code] = existing[0].id;
    }
  }

  console.log("✅ Constituencies seeded (including LA-14 Bagh (1))");

  // ─── Union Councils ────────────────────────────────────────────────────────
  const ucData = [
    {
      nameEn: "UC Bagh-1",
      nameUr: "یوسی باغ-1",
      tehsilKey: "BGH_Bagh",
      districtCode: "BGH",
    },
    {
      nameEn: "UC Bagh-2",
      nameUr: "یوسی باغ-2",
      tehsilKey: "BGH_Bagh",
      districtCode: "BGH",
    },
    {
      nameEn: "UC Dhirkot",
      nameUr: "یوسی ڈھیرکوٹ",
      tehsilKey: "BGH_Dhirkot",
      districtCode: "BGH",
    },
    {
      nameEn: "UC Muzaffarabad-1",
      nameUr: "یوسی مظفرآباد-1",
      tehsilKey: "MZB_Muzaffarabad",
      districtCode: "MZB",
    },
    {
      nameEn: "UC Mirpur-1",
      nameUr: "یوسی میرپور-1",
      tehsilKey: "MRP_Mirpur",
      districtCode: "MRP",
    },
    {
      nameEn: "UC Rawalakot",
      nameUr: "یوسی راولاکوٹ",
      tehsilKey: "PNC_Rawalakot",
      districtCode: "PNC",
    },
    {
      nameEn: "UC Kotli",
      nameUr: "یوسی کوٹلی",
      tehsilKey: "KTL_Kotli",
      districtCode: "KTL",
    },
    {
      nameEn: "UC Pallandri",
      nameUr: "یوسی پلندری",
      tehsilKey: "SDH_Pallandri",
      districtCode: "SDH",
    },
  ];

  const insertedUCs: Record<string, string> = {};
  for (let i = 0; i < ucData.length; i++) {
    const uc = ucData[i];
    const tehsilId = insertedTehsils[uc.tehsilKey];
    const distId = insertedDistricts[uc.districtCode];
    if (!tehsilId) continue;
    const existing = await db
      .select()
      .from(unionCouncils)
      .where(eq(unionCouncils.nameEn, uc.nameEn))
      .limit(1);
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(unionCouncils)
        .values({ nameEn: uc.nameEn, nameUr: uc.nameUr, tehsilId, districtId: distId, sortOrder: i })
        .returning();
      insertedUCs[uc.nameEn] = inserted.id;
    } else {
      insertedUCs[uc.nameEn] = existing[0].id;
    }
  }

  console.log("✅ Union Councils seeded");

  // ─── Post Offices ───────────────────────────────────────────────────────────
  const postOfficeData = [
    { nameEn: "Bagh GPO", nameUr: "باغ جی پی او", districtCode: "BGH", tehsilKey: "BGH_Bagh", ucName: "UC Bagh-1", code: "BGH-GPO" },
    { nameEn: "Bagh City Post Office", nameUr: "باغ سٹی پوسٹ آفس", districtCode: "BGH", tehsilKey: "BGH_Bagh", ucName: "UC Bagh-2", code: "BGH-CITY" },
    { nameEn: "Dhirkot Post Office", nameUr: "ڈھیرکوٹ پوسٹ آفس", districtCode: "BGH", tehsilKey: "BGH_Dhirkot", ucName: "UC Dhirkot", code: "DHK-PO" },
  ];
  for (const po of postOfficeData) {
    const existing = await db.select().from(postOffices).where(eq(postOffices.code, po.code)).limit(1);
    if (!existing.length) {
      await db.insert(postOffices).values({
        nameEn: po.nameEn,
        nameUr: po.nameUr,
        code: po.code,
        districtId: insertedDistricts[po.districtCode],
        tehsilId: insertedTehsils[po.tehsilKey],
        unionCouncilId: insertedUCs[po.ucName],
      });
    }
  }
  console.log("✅ Post offices seeded");

  // ─── Areas ─────────────────────────────────────────────────────────────────
  const areaData = [
    { nameEn: "Bagh City", nameUr: "باغ شہر", districtCode: "BGH" },
    { nameEn: "Banjosa Road", nameUr: "بنجوسہ روڈ", districtCode: "BGH" },
    { nameEn: "Dhirkot Town", nameUr: "ڈھیرکوٹ قصبہ", districtCode: "BGH" },
    { nameEn: "Muzaffarabad City", nameUr: "مظفرآباد شہر", districtCode: "MZB" },
    { nameEn: "Mirpur City", nameUr: "میرپور شہر", districtCode: "MRP" },
    { nameEn: "Rawalakot City", nameUr: "راولاکوٹ شہر", districtCode: "PNC" },
    { nameEn: "Kotli City", nameUr: "کوٹلی شہر", districtCode: "KTL" },
    { nameEn: "Pallandri City", nameUr: "پلندری شہر", districtCode: "SDH" },
  ];

  for (let i = 0; i < areaData.length; i++) {
    const a = areaData[i];
    const distId = insertedDistricts[a.districtCode];
    const existing = await db
      .select()
      .from(areas)
      .where(eq(areas.nameEn, a.nameEn))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(areas).values({ nameEn: a.nameEn, nameUr: a.nameUr, districtId: distId, sortOrder: i });
    }
  }

  console.log("✅ Areas seeded");

  // ─── Categories ────────────────────────────────────────────────────────────
  const categoryData = [
    {
      nameEn: "Roads",
      nameUr: "سڑکیں",
      icon: "🛣️",
      subcats: [
        { en: "Road Damage", ur: "سڑک کا نقصان" },
        { en: "Pothole", ur: "گڑھا" },
        { en: "Bridge Issue", ur: "پل کا مسئلہ" },
        { en: "Street Light", ur: "سٹریٹ لائٹ" },
      ],
    },
    {
      nameEn: "Electricity",
      nameUr: "بجلی",
      icon: "⚡",
      subcats: [
        { en: "Power Outage", ur: "بجلی کی بندش" },
        { en: "Voltage Issue", ur: "وولٹیج کا مسئلہ" },
        { en: "Billing Issue", ur: "بل کا مسئلہ" },
        { en: "Transformer Fault", ur: "ٹرانسفارمر خرابی" },
      ],
    },
    {
      nameEn: "Water",
      nameUr: "پانی",
      icon: "💧",
      subcats: [
        { en: "Water Supply", ur: "پانی کی فراہمی" },
        { en: "Contamination", ur: "آلودگی" },
        { en: "Pipeline Leakage", ur: "پائپ لائن رساؤ" },
        { en: "Water Shortage", ur: "پانی کی قلت" },
      ],
    },
    {
      nameEn: "Sanitation",
      nameUr: "صفائی",
      icon: "🗑️",
      subcats: [
        { en: "Garbage Collection", ur: "کوڑا جمع کرنا" },
        { en: "Sewage", ur: "نالیاں" },
        { en: "Open Drain", ur: "کھلی نالی" },
        { en: "Public Toilet", ur: "عوامی بیت الخلا" },
      ],
    },
    {
      nameEn: "Health",
      nameUr: "صحت",
      icon: "🏥",
      subcats: [
        { en: "Hospital Services", ur: "ہسپتال خدمات" },
        { en: "Medicine Shortage", ur: "دوائی کی کمی" },
        { en: "Quack Doctor", ur: "جھولا چھاپ ڈاکٹر" },
        { en: "Ambulance", ur: "ایمبولینس" },
      ],
    },
    {
      nameEn: "Education",
      nameUr: "تعلیم",
      icon: "🏫",
      subcats: [
        { en: "School Building", ur: "سکول عمارت" },
        { en: "Teacher Absence", ur: "استاد غیر حاضری" },
        { en: "Enrollment Issues", ur: "داخلہ مسائل" },
        { en: "Examination", ur: "امتحان" },
      ],
    },
    {
      nameEn: "Security",
      nameUr: "سیکیورٹی",
      icon: "🛡️",
      subcats: [
        { en: "Law & Order", ur: "امن و امان" },
        { en: "Theft/Robbery", ur: "چوری/ڈکیتی" },
        { en: "Street Crime", ur: "سڑک جرائم" },
        { en: "Harassment", ur: "ہراسانی" },
      ],
    },
    {
      nameEn: "Municipal Services",
      nameUr: "بلدیاتی خدمات",
      icon: "🏛️",
      subcats: [
        { en: "License/Permit", ur: "لائسنس/اجازت نامہ" },
        { en: "Property Tax", ur: "پراپرٹی ٹیکس" },
        { en: "Parks & Recreation", ur: "پارک اور تفریح" },
        { en: "Birth/Death Certificate", ur: "پیدائش/موت سرٹیفکیٹ" },
      ],
    },
    {
      nameEn: "Infrastructure",
      nameUr: "بنیادی ڈھانچہ",
      icon: "🏗️",
      subcats: [
        { en: "Building Collapse Risk", ur: "عمارت گرنے کا خطرہ" },
        { en: "Public Building", ur: "سرکاری عمارت" },
        { en: "Footpath", ur: "فٹ پاتھ" },
        { en: "Drainage", ur: "نکاسی آب" },
      ],
    },
    {
      nameEn: "Public Transport",
      nameUr: "پبلک ٹرانسپورٹ",
      icon: "🚌",
      subcats: [
        { en: "Bus Service", ur: "بس سروس" },
        { en: "Overcharging", ur: "زیادہ کرایہ" },
        { en: "Route Issue", ur: "روٹ مسئلہ" },
        { en: "Reckless Driving", ur: "لاپرواہ ڈرائیونگ" },
      ],
    },
    {
      nameEn: "Environment",
      nameUr: "ماحول",
      icon: "🌿",
      subcats: [
        { en: "Air Pollution", ur: "فضائی آلودگی" },
        { en: "Water Pollution", ur: "آبی آلودگی" },
        { en: "Deforestation", ur: "جنگل کٹائی" },
        { en: "Noise Pollution", ur: "آواز کی آلودگی" },
      ],
    },
    {
      nameEn: "Government Services",
      nameUr: "سرکاری خدمات",
      icon: "🏢",
      subcats: [
        { en: "Document Issuance", ur: "دستاویزات اجرا" },
        { en: "CNIC", ur: "شناختی کارڈ" },
        { en: "Land Record", ur: "زمین ریکارڈ" },
        { en: "Court/Legal", ur: "عدالت/قانونی" },
      ],
    },
    {
      nameEn: "Other",
      nameUr: "دیگر",
      icon: "📋",
      subcats: [
        { en: "General Complaint", ur: "عمومی شکایت" },
        { en: "Suggestion", ur: "تجویز" },
        { en: "Appreciation", ur: "تعریف" },
      ],
    },
  ];

  const insertedCats: Record<string, string> = {};
  for (let i = 0; i < categoryData.length; i++) {
    const cat = categoryData[i];
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.nameEn, cat.nameEn))
      .limit(1);
    let catId: string;
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(categories)
        .values({ nameEn: cat.nameEn, nameUr: cat.nameUr, icon: cat.icon, sortOrder: i })
        .returning();
      catId = inserted.id;
    } else {
      catId = existing[0].id;
    }
    insertedCats[cat.nameEn] = catId;

    for (let j = 0; j < cat.subcats.length; j++) {
      const sub = cat.subcats[j];
      const existingSub = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.nameEn, sub.en))
        .limit(1);
      if (existingSub.length === 0) {
        await db
          .insert(subcategories)
          .values({ categoryId: catId, nameEn: sub.en, nameUr: sub.ur, sortOrder: j });
      }
    }
  }

  console.log("✅ Categories & subcategories seeded");

  // ─── Departments ───────────────────────────────────────────────────────────
  const deptData = [
    { nameEn: "Roads & Infrastructure", nameUr: "سڑکیں اور بنیادی ڈھانچہ", slaHours: 72 },
    { nameEn: "Water & Sanitation", nameUr: "پانی اور صفائی", slaHours: 48 },
    { nameEn: "Electricity Department", nameUr: "بجلی محکمہ", slaHours: 24 },
    { nameEn: "Health Department", nameUr: "صحت محکمہ", slaHours: 48 },
    { nameEn: "Education Department", nameUr: "تعلیم محکمہ", slaHours: 72 },
    { nameEn: "Security & Police", nameUr: "سیکیورٹی اور پولیس", slaHours: 24 },
    { nameEn: "Municipal Corporation", nameUr: "میونسپل کارپوریشن", slaHours: 72 },
    { nameEn: "Environment Department", nameUr: "ماحول محکمہ", slaHours: 96 },
    { nameEn: "Transport Department", nameUr: "ٹرانسپورٹ محکمہ", slaHours: 48 },
    { nameEn: "General Administration", nameUr: "عمومی انتظامیہ", slaHours: 72 },
  ];

  const insertedDepts: Record<string, string> = {};
  for (let i = 0; i < deptData.length; i++) {
    const d = deptData[i];
    const existing = await db
      .select()
      .from(departments)
      .where(eq(departments.nameEn, d.nameEn))
      .limit(1);
    if (existing.length === 0) {
      const [inserted] = await db
        .insert(departments)
        .values({ nameEn: d.nameEn, nameUr: d.nameUr, slaHours: d.slaHours })
        .returning();
      insertedDepts[d.nameEn] = inserted.id;
    } else {
      insertedDepts[d.nameEn] = existing[0].id;
    }
  }

  console.log("✅ Departments seeded");

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
  const adminUsername = process.env.ADMIN_INITIAL_USERNAME?.trim().toLowerCase() || "abbasi";
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD must be configured before seeding the initial Super Admin.");
  }
  const existingAdmin = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await db.insert(adminUsers).values({
      email: adminEmail,
      username: adminUsername,
      passwordHash: hash,
      name: "Hozafa Mehmood",
      role: "super_admin",
      designation: "System Administrator",
      isActive: true,
      mustChangePassword: false,
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log("✅ Admin user already exists");
  }

  // ─── SLA Configurations ────────────────────────────────────────────────────
  const slaData = [
    { name: "Normal Priority Default", priority: "normal" as const, hoursToResolve: 72, hoursToAssign: 24 },
    { name: "Urgent Priority", priority: "urgent" as const, hoursToResolve: 24, hoursToAssign: 4 },
    { name: "Critical Priority", priority: "critical" as const, hoursToResolve: 8, hoursToAssign: 1 },
  ];

  for (const s of slaData) {
    const existing = await db
      .select()
      .from(slaConfigurations)
      .where(eq(slaConfigurations.name, s.name))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(slaConfigurations).values({
        name: s.name,
        priority: s.priority,
        hoursToResolve: s.hoursToResolve,
        hoursToAssign: s.hoursToAssign,
        escalationLevel1Hours: Math.floor(s.hoursToResolve * 0.5),
        escalationLevel2Hours: Math.floor(s.hoursToResolve * 0.8),
      });
    }
  }

  console.log("✅ SLA configurations seeded");

  // ─── FAQ Items ─────────────────────────────────────────────────────────────
  const faqData = [
    {
      questionEn: "How do I submit a complaint?",
      questionUr: "شکایت کیسے درج کروں؟",
      answerEn:
        "Click 'Submit Complaint' on the home screen. Fill in your personal details, select your location, choose a category, and describe your complaint. Click Submit to receive your complaint ID.",
      answerUr:
        "ہوم اسکرین پر 'شکایت درج کروائیں' پر کلک کریں۔ اپنی ذاتی تفصیلات بھریں، اپنا مقام منتخب کریں، زمرہ چنیں اور اپنی شکایت بیان کریں۔ جمع کروائیں پر کلک کریں تاکہ آپ کو شکایت نمبر ملے۔",
      category: "submission",
    },
    {
      questionEn: "How do I track my complaint?",
      questionUr: "اپنی شکایت کو کیسے ٹریک کروں؟",
      answerEn:
        "Click 'Track Complaint' and enter your complaint reference number (e.g. JKADB-2026-000001) along with your verification details.",
      answerUr:
        "ٹریک شکایت پر کلک کریں اور اپنا شکایت حوالہ نمبر (مثلاً JKADB-2026-000001) اور تصدیقی تفصیلات درج کریں۔",
      category: "tracking",
    },
    {
      questionEn: "What is a Complaint ID?",
      questionUr: "شکایت نمبر کیا ہے؟",
      answerEn:
        "A unique reference number generated when you submit a complaint. Format: JKADB-YYYY-NNNNNN. Keep it safe to track your complaint.",
      answerUr:
        "شکایت جمع کرانے پر ملنے والا منفرد حوالہ نمبر۔ فارمیٹ: JKADB-YYYY-NNNNNN۔ اسے محفوظ رکھیں تاکہ آپ اپنی شکایت ٹریک کر سکیں۔",
      category: "tracking",
    },
    {
      questionEn: "Is registration required?",
      questionUr: "کیا رجسٹریشن ضروری ہے؟",
      answerEn:
        "No. You can submit complaints without creating an account. A secure tracking reference will be provided instead.",
      answerUr:
        "نہیں۔ آپ اکاؤنٹ بنائے بغیر شکایت درج کر سکتے ہیں۔ اس کی بجائے محفوظ ٹریکنگ حوالہ فراہم کیا جائے گا۔",
      category: "general",
    },
    {
      questionEn: "How long will it take to resolve my complaint?",
      questionUr: "شکایت حل ہونے میں کتنا وقت لگے گا؟",
      answerEn:
        "Normal complaints: up to 72 hours. Urgent: up to 24 hours. Critical: up to 8 hours. Complex issues may take longer.",
      answerUr:
        "عام شکایات: 72 گھنٹے تک۔ فوری: 24 گھنٹے تک۔ اہم: 8 گھنٹے تک۔ پیچیدہ معاملات زیادہ وقت لے سکتے ہیں۔",
      category: "resolution",
    },
    {
      questionEn: "How do I upload evidence?",
      questionUr: "شواہد کیسے اپلوڈ کروں؟",
      answerEn:
        "In the complaint form, use the 'Upload Evidence' section to attach photos (JPG, PNG) or documents (PDF). Maximum file size: 5MB per file.",
      answerUr:
        "شکایت فارم میں 'شواہد اپلوڈ کریں' سیکشن استعمال کریں۔ تصاویر (JPG, PNG) یا دستاویزات (PDF) منسلک کریں۔ زیادہ سے زیادہ فائل سائز: 5MB فی فائل۔",
      category: "submission",
    },
    {
      questionEn: "Can I reopen a resolved complaint?",
      questionUr: "کیا میں حل شدہ شکایت دوبارہ کھول سکتا ہوں؟",
      answerEn:
        "Yes. If your complaint is marked resolved but the issue persists, you can request reopening through the tracking page.",
      answerUr:
        "ہاں۔ اگر آپ کی شکایت حل شدہ کے طور پر نشان زد ہو لیکن مسئلہ باقی ہو تو آپ ٹریکنگ صفحے سے دوبارہ کھولنے کی درخواست کر سکتے ہیں۔",
      category: "resolution",
    },
    {
      questionEn: "Is my personal information safe?",
      questionUr: "کیا میری ذاتی معلومات محفوظ ہیں؟",
      answerEn:
        "Yes. Your CNIC and personal data are securely stored and never shared with other citizens. CNIC is stored encrypted and masked in displays.",
      answerUr:
        "ہاں۔ آپ کا شناختی کارڈ نمبر اور ذاتی ڈیٹا محفوظ طریقے سے ذخیرہ کیا جاتا ہے اور کبھی دوسرے شہریوں کے ساتھ شیئر نہیں کیا جاتا۔",
      category: "privacy",
    },
  ];

  for (let i = 0; i < faqData.length; i++) {
    const f = faqData[i];
    const existing = await db
      .select()
      .from(faqItems)
      .where(eq(faqItems.questionEn, f.questionEn))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(faqItems).values({ ...f, sortOrder: i });
    }
  }

  console.log("✅ FAQ items seeded");

  // ─── System Settings ───────────────────────────────────────────────────────
  const settingsData = [
    { key: "app_name", value: "JKADB", description: "Application name" },
    { key: "app_name_full", value: "Jammu Kashmir Awami Dast-o-Bazo", description: "Full application name" },
    { key: "app_name_ur", value: "جموں کشمیر عوامی دست و بازو", description: "Application name in Urdu" },
    { key: "organization", value: "MAJOR FORCE Narakot", description: "Organization name" },
    { key: "developer", value: "Hozafa Mehmood", description: "Developer name" },
    { key: "max_attachment_size_mb", value: "5", description: "Maximum attachment size in MB" },
    { key: "max_attachments_per_complaint", value: "5", description: "Maximum number of attachments" },
    { key: "rate_limit_submissions_per_ip_per_hour", value: "5", description: "Rate limit for submissions" },
    { key: "default_sla_hours", value: "72", description: "Default SLA hours" },
    { key: "complaint_id_prefix", value: "JKADB", description: "Complaint ID prefix" },
    { key: "public_stats_enabled", value: "true", description: "Show public statistics" },
  ];

  for (const s of settingsData) {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, s.key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(systemSettings).values(s);
    }
  }

  console.log("✅ System settings seeded");

  // ─── RBAC Permissions ───────────────────────────────────────────────────────
  const permissionData = [
    ["requests.view", "View Requests", "Requests"],
    ["requests.search", "Search Requests", "Requests"],
    ["requests.assign", "Assign Requests", "Requests"],
    ["requests.reply", "Reply to Requests", "Requests"],
    ["requests.resolve", "Resolve Requests", "Requests"],
    ["requests.reopen", "Reopen Requests", "Requests"],
    ["requests.export", "Export Requests", "Requests"],
    ["citizens.sensitive", "View Sensitive Citizen Data", "Citizens"],
    ["users.manage", "Manage Administrators", "Management"],
    ["roles.manage", "Manage Roles and Permissions", "Management"],
    ["departments.manage", "Manage Departments", "Organization"],
    ["officers.manage", "Manage Officers", "Organization"],
    ["categories.manage", "Manage Categories", "Organization"],
    ["locations.manage", "Manage Locations", "Organization"],
    ["announcements.manage", "Manage Announcements", "Communication"],
    ["alerts.manage", "Manage Quick Alerts", "Communication"],
    ["contacts.manage", "Manage Public Contact", "Communication"],
    ["notifications.view", "View Notifications", "Communication"],
    ["analytics.view", "View Analytics", "Insights"],
    ["reports.view", "View Reports", "Insights"],
    ["reports.export", "Export Reports", "Insights"],
    ["audit.view", "View Audit Logs", "Security"],
    ["system.manage", "Manage System Settings", "System"],
    ["ai.monitor", "Monitor AI Service", "AI"],
  ] as const;

  const permissionIds: Record<string, string> = {};
  for (const [key, label, groupName] of permissionData) {
    const existing = await db.select().from(permissions).where(eq(permissions.key, key)).limit(1);
    if (existing.length) permissionIds[key] = existing[0].id;
    else {
      const [p] = await db.insert(permissions).values({ key, label, groupName }).returning();
      permissionIds[key] = p.id;
    }
  }

  const nonSuperRoles = ["district_admin", "reviewer", "complaint_officer"] as const;
  for (const role of nonSuperRoles) {
    const keys = role === "complaint_officer"
      ? permissionData.filter(([key]) => key.startsWith("requests.") && !key.endsWith("export")).map(([key]) => key)
      : role === "reviewer"
        ? permissionData.filter(([key]) => !["users.manage", "roles.manage", "system.manage"].includes(key)).map(([key]) => key)
        : permissionData.map(([key]) => key).filter((key) => key !== "roles.manage");
    for (const key of keys) {
      const permissionId = permissionIds[key];
      if (!permissionId) continue;
      const existing = await db.select().from(rolePermissions)
        .where(and(eq(rolePermissions.role, role), eq(rolePermissions.permissionId, permissionId)))
        .limit(1);
      if (existing.length === 0) await db.insert(rolePermissions).values({ role, permissionId });
    }
  }
  console.log("✅ RBAC permissions seeded");

  // ─── Public Contact Information ─────────────────────────────────────────────
  const contacts = [
    { labelEn: "JKADB Main Contact", labelUr: "جے کے اے ڈی بی مرکزی رابطہ", value: process.env.PUBLIC_CONTACT_PHONE || "", kind: "phone", sortOrder: 0 },
    { labelEn: "Support Email", labelUr: "سپورٹ ای میل", value: process.env.PUBLIC_SUPPORT_EMAIL || "", kind: "email", sortOrder: 1 },
    { labelEn: "Office Address", labelUr: "دفتر کا پتہ", value: process.env.PUBLIC_OFFICE_ADDRESS || "", kind: "address", sortOrder: 2 },
  ].filter((c) => c.value);
  for (const c of contacts) {
    const existing = await db.select().from(publicContactInformation)
      .where(eq(publicContactInformation.labelEn, c.labelEn)).limit(1);
    if (!existing.length) await db.insert(publicContactInformation).values(c);
  }
  console.log("✅ Public contact configuration seeded");

  const templateData = [
    { name: "Complaint Received", category: "submission", bodyEn: "Your complaint has been received and is now being reviewed.", bodyUr: "آپ کی شکایت موصول ہو گئی ہے اور اب اس کا جائزہ لیا جا رہا ہے۔" },
    { name: "More Information Required", category: "information", bodyEn: "Please provide the additional information requested by the JKADB team.", bodyUr: "براہ کرم جے کے اے ڈی بی ٹیم کی مطلوبہ اضافی معلومات فراہم کریں۔" },
    { name: "Complaint Resolved", category: "resolution", bodyEn: "Your complaint has been marked as resolved. Please review the resolution and provide feedback.", bodyUr: "آپ کی شکایت حل شدہ قرار دی گئی ہے۔ براہ کرم حل کا جائزہ لیں اور اپنی رائے دیں۔" },
  ];
  for (const t of templateData) {
    const existing = await db.select().from(responseTemplates).where(eq(responseTemplates.name, t.name)).limit(1);
    if (!existing.length) await db.insert(responseTemplates).values(t);
  }
  console.log("✅ Response templates seeded");

  console.log("🎉 JKADB database seeded successfully!");
}

seed().catch(console.error);
