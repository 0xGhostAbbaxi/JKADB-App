export type Language = "en" | "ur";

export const translations = {
  en: {
    // App
    appName: "JKADB",
    appFullName: "Jammu Kashmir Awami Dast-o-Bazo",
    appUr: "جموں کشمیر عوامی دست و بازو",
    organization: "MAJOR FORCE Narakot",
    developer: "Hozafa Mehmood",
    builtBy: "Built by",
    from: "From",

    // Nav
    home: "Home",
    submitComplaint: "Submit Complaint",
    trackComplaint: "Track Complaint",
    announcements: "Announcements",
    help: "Help / FAQ",
    language: "Language",
    theme: "Theme",
    settings: "Settings",
    about: "About JKADB",
    adminLogin: "Admin Login",

    // Home
    heroTitle: "Your Voice, Our Commitment",
    heroSubtitle: "Submit and track public complaints easily and securely",
    submitBtn: "Submit a Complaint",
    trackBtn: "Track Your Complaint",
    viewAnnouncements: "View Announcements",

    // Complaint Form
    complaintForm: "Complaint Form",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    fatherName: "Father Name",
    cnicNumber: "CNIC Number",
    cnicPlaceholder: "XXXXX-XXXXXXX-X",
    phone: "Phone Number (Optional)",
    email: "Email (Optional)",

    locationInfo: "Location",
    district: "District",
    selectDistrict: "Select District",
    tehsil: "Tehsil",
    selectTehsil: "Select Tehsil",
    tehsilOther: "Other (Type Tehsil Name)",
    unionCouncil: "Union Council",
    selectUC: "Select Union Council",
    constituency: "Constituency / Electoral Area",
    selectConstituency: "Select Constituency",
    area: "Area",
    selectArea: "Select Area",
    address: "Address (Optional)",
    mapLocation: "Map Location (Optional)",

    complaintDetails: "Complaint Details",
    category: "Category",
    selectCategory: "Select Category",
    subcategory: "Subcategory",
    selectSubcategory: "Select Subcategory",
    description: "Description",
    descriptionPlaceholder: "Describe your complaint in detail...",
    additionalInfo: "Additional Information (Optional)",
    evidence: "Upload Evidence",
    evidenceHint: "JPG, PNG, PDF - Max 5MB each",

    saveDraft: "Save Draft",
    submitComplaintBtn: "Submit Complaint",
    reviewBeforeSubmit: "Review Before Submit",
    cancel: "Cancel",
    edit: "Edit",
    deleteDraft: "Delete Draft",

    // Tracking
    trackingTitle: "Track Your Complaint",
    trackingSubtitle: "Enter your complaint reference to check status",
    complaintReference: "Complaint Reference",
    referencePlaceholder: "JKADB-2026-000001",
    verificationInfo: "Verification (Father Name or CNIC last 4 digits)",
    verificationPlaceholder: "Father name or last 4 digits of CNIC",
    trackNow: "Track Now",

    // Status
    complaintStatus: "Complaint Status",
    currentStatus: "Current Status",
    submittedOn: "Submitted On",
    department: "Department",
    assignedOfficer: "Assigned Officer",
    timeline: "Timeline",
    messages: "Messages",
    resolution: "Resolution",
    feedback: "Feedback",

    // Messages
    sendMessage: "Send Message",
    messagePlaceholder: "Type your message...",
    send: "Send",

    // Feedback
    wasResolved: "Was your complaint resolved?",
    yes: "Yes",
    partially: "Partially",
    no: "No",
    rating: "Rating",
    feedbackComment: "Comment (Optional)",
    submitFeedback: "Submit Feedback",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    close: "Close",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    apply: "Apply",
    required: "Required",
    optional: "Optional",
    noData: "No data available",
    copyComplaintId: "Copy Complaint ID",
    copied: "Copied!",
    print: "Print",
    share: "Share",
    download: "Download",

    // Validation
    fieldRequired: "This field is required",
    invalidCnic: "Invalid CNIC format (XXXXX-XXXXXXX-X)",
    invalidPhone: "Invalid phone number",
    invalidEmail: "Invalid email address",
    minLength: "Minimum {{n}} characters required",

    // Success
    complaintSubmitted: "Complaint Submitted Successfully!",
    complaintId: "Complaint ID",
    trackingInstructions: "Save this ID to track your complaint",
    draftSaved: "Draft saved successfully",

    // Errors
    somethingWentWrong: "Something went wrong. Please try again.",
    complaintNotFound: "Complaint not found or verification failed",
    unauthorized: "Unauthorized access",

    // About
    aboutTitle: "About JKADB",
    aboutDescription:
      "JKADB (Jammu Kashmir Awami Dast-o-Bazo) is a professional public complaint and grievance management platform serving the citizens of Jammu Kashmir. Our mission is to bridge the gap between citizens and government departments, ensuring every complaint reaches the right authority and receives a timely response.",
    missionTitle: "Our Mission",
    mission:
      "To empower citizens of Jammu Kashmir with a transparent, accessible and accountable system for registering and tracking public complaints.",

    // Admin
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    complaints: "Complaints",
    officers: "Officers",
    departments: "Departments",
    categories: "Categories",
    locations: "Locations",
    analytics: "Analytics",
    reports: "Reports",
    auditLogs: "Audit Logs",
    systemSettings: "System Settings",
    logout: "Logout",

    // Theme
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    systemDefault: "System Default",
  },
  ur: {
    // App
    appName: "JKADB",
    appFullName: "جموں کشمیر عوامی دست و بازو",
    appUr: "جموں کشمیر عوامی دست و بازو",
    organization: "میجر فورس مارکوٹ",
    developer: "حوذفہ محمود",
    builtBy: "تخلیق کار",
    from: "از",

    // Nav
    home: "ہوم",
    submitComplaint: "شکایت درج کریں",
    trackComplaint: "شکایت ٹریک کریں",
    announcements: "اعلانات",
    help: "مدد / سوالات",
    language: "زبان",
    theme: "تھیم",
    settings: "ترتیبات",
    about: "JKADB کے بارے میں",
    adminLogin: "ایڈمن لاگ ان",

    // Home
    heroTitle: "آپ کی آواز، ہماری ذمہ داری",
    heroSubtitle: "آسانی اور محفوظ طریقے سے عوامی شکایات درج اور ٹریک کریں",
    submitBtn: "شکایت درج کریں",
    trackBtn: "اپنی شکایت ٹریک کریں",
    viewAnnouncements: "اعلانات دیکھیں",

    // Complaint Form
    complaintForm: "شکایت فارم",
    personalInfo: "ذاتی معلومات",
    fullName: "پورا نام",
    fatherName: "والد کا نام",
    cnicNumber: "شناختی کارڈ نمبر",
    cnicPlaceholder: "XXXXX-XXXXXXX-X",
    phone: "فون نمبر (اختیاری)",
    email: "ای میل (اختیاری)",

    locationInfo: "مقام",
    district: "ضلع",
    selectDistrict: "ضلع منتخب کریں",
    tehsil: "تحصیل",
    selectTehsil: "تحصیل منتخب کریں",
    tehsilOther: "دیگر (تحصیل کا نام لکھیں)",
    unionCouncil: "یونین کونسل",
    selectUC: "یونین کونسل منتخب کریں",
    constituency: "حلقہ / انتخابی علاقہ",
    selectConstituency: "حلقہ منتخب کریں",
    area: "علاقہ",
    selectArea: "علاقہ منتخب کریں",
    address: "پتہ (اختیاری)",
    mapLocation: "نقشہ مقام (اختیاری)",

    complaintDetails: "شکایت کی تفصیل",
    category: "زمرہ",
    selectCategory: "زمرہ منتخب کریں",
    subcategory: "ذیلی زمرہ",
    selectSubcategory: "ذیلی زمرہ منتخب کریں",
    description: "تفصیل",
    descriptionPlaceholder: "اپنی شکایت تفصیل سے بیان کریں...",
    additionalInfo: "اضافی معلومات (اختیاری)",
    evidence: "شواہد اپلوڈ کریں",
    evidenceHint: "JPG، PNG، PDF - زیادہ سے زیادہ 5MB فی فائل",

    saveDraft: "مسودہ محفوظ کریں",
    submitComplaintBtn: "شکایت جمع کروائیں",
    reviewBeforeSubmit: "جمع کرانے سے پہلے جائزہ لیں",
    cancel: "منسوخ کریں",
    edit: "ترمیم کریں",
    deleteDraft: "مسودہ حذف کریں",

    // Tracking
    trackingTitle: "اپنی شکایت ٹریک کریں",
    trackingSubtitle: "حالت معلوم کرنے کے لیے اپنا شکایت حوالہ درج کریں",
    complaintReference: "شکایت حوالہ",
    referencePlaceholder: "JKADB-2026-000001",
    verificationInfo: "تصدیق (والد کا نام یا شناختی کارڈ کے آخری 4 ہندسے)",
    verificationPlaceholder: "والد کا نام یا شناختی کارڈ کے آخری 4 ہندسے",
    trackNow: "ابھی ٹریک کریں",

    // Status
    complaintStatus: "شکایت کی حالت",
    currentStatus: "موجودہ حالت",
    submittedOn: "جمع کرانے کی تاریخ",
    department: "محکمہ",
    assignedOfficer: "تفویض افسر",
    timeline: "ٹائم لائن",
    messages: "پیغامات",
    resolution: "حل",
    feedback: "رائے",

    // Messages
    sendMessage: "پیغام بھیجیں",
    messagePlaceholder: "اپنا پیغام لکھیں...",
    send: "بھیجیں",

    // Feedback
    wasResolved: "کیا آپ کی شکایت حل ہوئی؟",
    yes: "ہاں",
    partially: "جزوی طور پر",
    no: "نہیں",
    rating: "درجہ بندی",
    feedbackComment: "تبصرہ (اختیاری)",
    submitFeedback: "رائے جمع کروائیں",

    // Common
    loading: "لوڈ ہو رہا ہے...",
    error: "خرابی",
    success: "کامیابی",
    warning: "خبردار",
    info: "معلومات",
    close: "بند کریں",
    save: "محفوظ کریں",
    delete: "حذف کریں",
    confirm: "تصدیق کریں",
    back: "واپس",
    next: "اگلا",
    previous: "پچھلا",
    search: "تلاش",
    filter: "فلٹر",
    clear: "صاف کریں",
    apply: "لاگو کریں",
    required: "لازمی",
    optional: "اختیاری",
    noData: "کوئی ڈیٹا دستیاب نہیں",
    copyComplaintId: "شکایت نمبر کاپی کریں",
    copied: "کاپی ہوگیا!",
    print: "پرنٹ کریں",
    share: "شیئر کریں",
    download: "ڈاؤن لوڈ",

    // Validation
    fieldRequired: "یہ فیلڈ لازمی ہے",
    invalidCnic: "غلط شناختی کارڈ فارمیٹ (XXXXX-XXXXXXX-X)",
    invalidPhone: "غلط فون نمبر",
    invalidEmail: "غلط ای میل پتہ",
    minLength: "کم از کم {{n}} حروف درکار ہیں",

    // Success
    complaintSubmitted: "شکایت کامیابی سے جمع ہو گئی!",
    complaintId: "شکایت نمبر",
    trackingInstructions: "اپنی شکایت ٹریک کرنے کے لیے یہ نمبر محفوظ کریں",
    draftSaved: "مسودہ کامیابی سے محفوظ ہوگیا",

    // Errors
    somethingWentWrong: "کچھ غلط ہوگیا۔ براہ کرم دوبارہ کوشش کریں۔",
    complaintNotFound: "شکایت نہیں ملی یا تصدیق ناکام ہوئی",
    unauthorized: "غیر مجاز رسائی",

    // About
    aboutTitle: "JKADB کے بارے میں",
    aboutDescription:
      "JKADB (جموں کشمیر عوامی دست و بازو) جموں کشمیر کے شہریوں کی خدمت میں ایک پیشہ ورانہ عوامی شکایت اور ازالہ انتظام پلیٹ فارم ہے۔ ہمارا مشن شہریوں اور سرکاری محکموں کے درمیان فاصلہ ختم کرنا ہے۔",
    missionTitle: "ہمارا مشن",
    mission:
      "جموں کشمیر کے شہریوں کو عوامی شکایات درج کرنے اور ٹریک کرنے کے لیے ایک شفاف، قابل رسائی اور جوابدہ نظام فراہم کرنا۔",

    // Admin
    adminPanel: "ایڈمن پینل",
    dashboard: "ڈیش بورڈ",
    complaints: "شکایات",
    officers: "افسران",
    departments: "محکمہ جات",
    categories: "زمرے",
    locations: "مقامات",
    analytics: "تجزیات",
    reports: "رپورٹس",
    auditLogs: "آڈٹ لاگ",
    systemSettings: "نظام کی ترتیبات",
    logout: "لاگ آؤٹ",

    // Theme
    lightMode: "روشن موڈ",
    darkMode: "تاریک موڈ",
    systemDefault: "سسٹم ڈیفالٹ",
  },
};

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language = "en", params?: Record<string, string | number>): string {
  let text = translations[lang][key] || translations.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, String(v));
    });
  }
  return text;
}
