import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
  varchar,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "district_admin",
  "reviewer",
  "complaint_officer",
  "citizen",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "submitted",
  "verified",
  "assigned",
  "under_review",
  "investigation",
  "awaiting_response",
  "resolved",
  "citizen_confirmation",
  "closed",
  "rejected",
  "reopened",
  "duplicate",
  "invalid",
  "escalated",
  "withdrawn",
  "awaiting_citizen_response",
]);

export const priorityEnum = pgEnum("priority", ["normal", "urgent", "critical"]);

export const slaStatusEnum = pgEnum("sla_status", [
  "on_time",
  "approaching",
  "overdue",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "citizen",
  "officer",
  "admin",
  "internal_note",
  "system",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "complaint_submitted",
  "complaint_assigned",
  "status_changed",
  "officer_replied",
  "info_requested",
  "resolved",
  "rejected",
  "reopened",
  "announcement",
  "sla_approaching",
  "sla_overdue",
  "critical_complaint",
  "escalation",
  "new_complaint",
  "citizen_response",
  "assignment",
]);

export const announcementStatusEnum = pgEnum("announcement_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
]);

export const feedbackRatingEnum = pgEnum("feedback_rating", [
  "resolved",
  "partially",
  "not_resolved",
]);

// ─── Locations ────────────────────────────────────────────────────────────────

export const districts = pgTable(
  "districts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    code: varchar("code", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("districts_name_en_idx").on(t.nameEn)]
);

export const tehsils = pgTable(
  "tehsils",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => districts.id),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    code: varchar("code", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("tehsils_district_idx").on(t.districtId)]
);

export const unionCouncils = pgTable(
  "union_councils",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tehsilId: uuid("tehsil_id")
      .notNull()
      .references(() => tehsils.id),
    districtId: uuid("district_id")
      .notNull()
      .references(() => districts.id),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    code: varchar("code", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("uc_tehsil_idx").on(t.tehsilId),
    index("uc_district_idx").on(t.districtId),
  ]
);

export const constituencies = pgTable(
  "constituencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    code: varchar("code", { length: 50 }),
    constituencyType: varchar("constituency_type", { length: 50 }).default("LA"),
    districtId: uuid("district_id").references(() => districts.id),
    tehsilId: uuid("tehsil_id").references(() => tehsils.id),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("constituencies_district_idx").on(t.districtId)]
);

export const areas = pgTable(
  "areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unionCouncilId: uuid("union_council_id").references(() => unionCouncils.id),
    tehsilId: uuid("tehsil_id").references(() => tehsils.id),
    districtId: uuid("district_id").references(() => districts.id),
    constituencyId: uuid("constituency_id").references(() => constituencies.id),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("areas_district_idx").on(t.districtId)]
);

// ─── Post Offices ──────────────────────────────────────────────────────────────

export const postOffices = pgTable(
  "post_offices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    districtId: uuid("district_id").notNull().references(() => districts.id),
    tehsilId: uuid("tehsil_id").notNull().references(() => tehsils.id),
    unionCouncilId: uuid("union_council_id").references(() => unionCouncils.id),
    nameEn: varchar("name_en", { length: 200 }).notNull(),
    nameUr: varchar("name_ur", { length: 200 }),
    code: varchar("code", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("post_offices_district_idx").on(t.districtId),
    index("post_offices_tehsil_idx").on(t.tehsilId),
    index("post_offices_uc_idx").on(t.unionCouncilId),
  ]
);

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameUr: varchar("name_ur", { length: 200 }),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subcategories = pgTable("subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameUr: varchar("name_ur", { length: 200 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Departments ──────────────────────────────────────────────────────────────

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameUr: varchar("name_ur", { length: 200 }),
  description: text("description"),
  responsibleArea: text("responsible_area"),
  isActive: boolean("is_active").default(true).notNull(),
  slaHours: integer("sla_hours").default(72),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Users / Admin ────────────────────────────────────────────────────────────

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 100 }).unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    role: userRoleEnum("role").notNull().default("complaint_officer"),
    departmentId: uuid("department_id").references(() => departments.id),
    districtId: uuid("district_id").references(() => districts.id),
    officerId: varchar("officer_id", { length: 100 }),
    designation: varchar("designation", { length: 200 }),
    phone: varchar("phone", { length: 30 }),
    isActive: boolean("is_active").default(true).notNull(),
    mustChangePassword: boolean("must_change_password").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    lockedUntil: timestamp("locked_until"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email), index("admin_users_username_idx").on(t.username)]
);

// ─── Complaints ───────────────────────────────────────────────────────────────

export const complaints = pgTable(
  "complaints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
    sequenceNumber: serial("sequence_number"),

    // Citizen info
    fullName: varchar("full_name", { length: 200 }).notNull(),
    fatherName: varchar("father_name", { length: 200 }).notNull(),
    cnicHash: varchar("cnic_hash", { length: 255 }).notNull(),
    cnicMasked: varchar("cnic_masked", { length: 20 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),

    // Location
    districtId: uuid("district_id").references(() => districts.id),
    tehsilId: uuid("tehsil_id").references(() => tehsils.id),
    tehsilCustom: varchar("tehsil_custom", { length: 200 }),
    unionCouncilId: uuid("union_council_id").references(() => unionCouncils.id),
    unionCouncilCustom: varchar("union_council_custom", { length: 200 }),
    postOfficeId: uuid("post_office_id").references(() => postOffices.id),
    postOfficeCustom: varchar("post_office_custom", { length: 200 }),
    constituencyId: uuid("constituency_id").references(() => constituencies.id),
    areaId: uuid("area_id").references(() => areas.id),
    areaCustom: varchar("area_custom", { length: 200 }),
    address: text("address"),
    latitude: varchar("latitude", { length: 30 }),
    longitude: varchar("longitude", { length: 30 }),

    // Complaint
    categoryId: uuid("category_id").references(() => categories.id),
    subcategoryId: uuid("subcategory_id").references(() => subcategories.id),
    description: text("description").notNull(),
    additionalInfo: text("additional_info"),
    language: varchar("language", { length: 10 }).default("en"),

    // Status
    status: complaintStatusEnum("status").notNull().default("submitted"),
    priority: priorityEnum("priority").notNull().default("normal"),
    isDraft: boolean("is_draft").default(false).notNull(),

    // Assignment
    departmentId: uuid("department_id").references(() => departments.id),
    assignedOfficerId: uuid("assigned_officer_id").references(() => adminUsers.id),
    assignedAt: timestamp("assigned_at"),

    // SLA
    slaDeadline: timestamp("sla_deadline"),
    slaStatus: slaStatusEnum("sla_status").default("on_time"),
    slaExtendedAt: timestamp("sla_extended_at"),
    slaExtendedBy: uuid("sla_extended_by").references(() => adminUsers.id),
    slaExtensionReason: text("sla_extension_reason"),

    // Resolution
    resolvedAt: timestamp("resolved_at"),
    resolvedBy: uuid("resolved_by").references(() => adminUsers.id),
    resolutionDescription: text("resolution_description"),
    officialResponse: text("official_response"),

    // Tracking secret
    trackingSecret: varchar("tracking_secret", { length: 255 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 100 }),

    // Duplicate
    duplicateOfId: uuid("duplicate_of_id"),

    // Soft delete
    deletedAt: timestamp("deleted_at"),

    // Read status
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    readBy: uuid("read_by").references(() => adminUsers.id),

    // Submission metadata
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),

    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("complaints_tracking_number_idx").on(t.trackingNumber),
    uniqueIndex("complaints_idempotency_key_idx").on(t.idempotencyKey),
    index("complaints_status_idx").on(t.status),
    index("complaints_district_idx").on(t.districtId),
    index("complaints_category_idx").on(t.categoryId),
    index("complaints_created_at_idx").on(t.createdAt),
    index("complaints_assigned_officer_idx").on(t.assignedOfficerId),
  ]
);

// ─── Attachments ──────────────────────────────────────────────────────────────

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  storageName: varchar("storage_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => adminUsers.id),
  isPublic: boolean("is_public").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    complaintId: uuid("complaint_id")
      .notNull()
      .references(() => complaints.id),
    messageType: messageTypeEnum("message_type").notNull(),
    content: text("content").notNull(),
    senderName: varchar("sender_name", { length: 200 }),
    senderAdminId: uuid("sender_admin_id").references(() => adminUsers.id),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("messages_complaint_idx").on(t.complaintId)]
);

// ─── Status History ───────────────────────────────────────────────────────────

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    complaintId: uuid("complaint_id")
      .notNull()
      .references(() => complaints.id),
    previousStatus: complaintStatusEnum("previous_status"),
    newStatus: complaintStatusEnum("new_status").notNull(),
    changedBy: uuid("changed_by").references(() => adminUsers.id),
    changedByName: varchar("changed_by_name", { length: 200 }),
    reason: text("reason"),
    internalNote: text("internal_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("status_history_complaint_idx").on(t.complaintId)]
);

// ─── Escalations ──────────────────────────────────────────────────────────────

export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id),
  escalatedBy: uuid("escalated_by").references(() => adminUsers.id),
  escalatedTo: uuid("escalated_to").references(() => adminUsers.id),
  reason: text("reason"),
  level: integer("level").default(1),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── SLA Configurations ───────────────────────────────────────────────────────

export const slaConfigurations = pgTable("sla_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  departmentId: uuid("department_id").references(() => departments.id),
  priority: priorityEnum("priority").default("normal"),
  hoursToResolve: integer("hours_to_resolve").notNull().default(72),
  hoursToAssign: integer("hours_to_assign").default(24),
  escalationLevel1Hours: integer("escalation_level1_hours").default(48),
  escalationLevel2Hours: integer("escalation_level2_hours").default(96),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientAdminId: uuid("recipient_admin_id").references(() => adminUsers.id),
    recipientTrackingNumber: varchar("recipient_tracking_number", { length: 50 }),
    complaintId: uuid("complaint_id").references(() => complaints.id),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body"),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("notifications_admin_idx").on(t.recipientAdminId),
    index("notifications_tracking_idx").on(t.recipientTrackingNumber),
  ]
);

// ─── Announcements ────────────────────────────────────────────────────────────

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleEn: varchar("title_en", { length: 500 }).notNull(),
  titleUr: varchar("title_ur", { length: 500 }),
  descriptionEn: text("description_en").notNull(),
  descriptionUr: text("description_ur"),
  bannerUrl: varchar("banner_url", { length: 500 }),
  status: announcementStatusEnum("status").notNull().default("draft"),
  priority: integer("priority").default(0),
  publishAt: timestamp("publish_at"),
  expiresAt: timestamp("expires_at"),
  isPersistent: boolean("is_persistent").default(false),
  isPopup: boolean("is_popup").default(false).notNull(),
  createdBy: uuid("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id),
  rating: feedbackRatingEnum("rating").notNull(),
  comment: text("comment"),
  requestReopen: boolean("request_reopen").default(false),
  reopenReason: text("reopen_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => adminUsers.id),
    actorName: varchar("actor_name", { length: 200 }),
    actorRole: varchar("actor_role", { length: 50 }),
    action: varchar("action", { length: 200 }).notNull(),
    targetType: varchar("target_type", { length: 100 }),
    targetId: varchar("target_id", { length: 200 }),
    targetDescription: varchar("target_description", { length: 500 }),
    previousValue: jsonb("previous_value"),
    newValue: jsonb("new_value"),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorId),
    index("audit_logs_created_at_idx").on(t.createdAt),
    index("audit_logs_action_idx").on(t.action),
  ]
);

// ─── System Settings ──────────────────────────────────────────────────────────

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedBy: uuid("updated_by").references(() => adminUsers.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const faqItems = pgTable("faq_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionEn: text("question_en").notNull(),
  questionUr: text("question_ur"),
  answerEn: text("answer_en").notNull(),
  answerUr: text("answer_ur"),
  category: varchar("category", { length: 100 }).default("general"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Complaint Drafts ─────────────────────────────────────────────────────────

export const complaintDrafts = pgTable("complaint_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: varchar("session_token", { length: 255 }).notNull(),
  formData: jsonb("form_data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



// ─── Control Center / Security / Communication / AI ─────────────────────────

export const notificationDeliveryStatusEnum = pgEnum("notification_delivery_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
]);

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 150 }).notNull().unique(),
  label: varchar("label", { length: 200 }).notNull(),
  groupName: varchar("group_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role: userRoleEnum("role").notNull(),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("role_permissions_role_permission_idx").on(t.role, t.permissionId),
    index("role_permissions_permission_idx").on(t.permissionId),
  ]
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id").notNull().references(() => adminUsers.id),
    tokenId: varchar("token_id", { length: 100 }).notNull().unique(),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("admin_sessions_user_idx").on(t.adminUserId),
    index("admin_sessions_expires_idx").on(t.expiresAt),
  ]
);

export const publicContactInformation = pgTable("public_contact_information", {
  id: uuid("id").primaryKey().defaultRandom(),
  labelEn: varchar("label_en", { length: 200 }).notNull(),
  labelUr: varchar("label_ur", { length: 200 }),
  value: text("value").notNull(),
  kind: varchar("kind", { length: 50 }).notNull().default("general"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  linkUrl: varchar("link_url", { length: 500 }),
  ctaLabel: varchar("cta_label", { length: 100 }),
  isActive: boolean("is_active").default(false).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdBy: uuid("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quickAlerts = pgTable("quick_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleEn: varchar("title_en", { length: 300 }).notNull(),
  titleUr: varchar("title_ur", { length: 300 }),
  messageEn: text("message_en").notNull(),
  messageUr: text("message_ur"),
  priority: priorityEnum("priority").default("urgent").notNull(),
  displayMode: varchar("display_mode", { length: 30 }).default("banner").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(false).notNull(),
  createdBy: uuid("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const responseTemplates = pgTable("response_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  bodyEn: text("body_en").notNull(),
  bodyUr: text("body_ur"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMetrics = pgTable(
  "ai_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: varchar("provider", { length: 50 }).notNull(),
    model: varchar("model", { length: 100 }),
    success: boolean("success").notNull(),
    latencyMs: integer("latency_ms"),
    errorType: varchar("error_type", { length: 100 }),
    rateLimited: boolean("rate_limited").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("ai_metrics_created_at_idx").on(t.createdAt)]
);

// Additive delivery metadata for notification reliability.
export const notificationDelivery = pgTable(
  "notification_delivery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id").notNull().references(() => notifications.id),
    channel: varchar("channel", { length: 30 }).notNull(),
    status: notificationDeliveryStatusEnum("status").default("pending").notNull(),
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notification_delivery_notification_idx").on(t.notificationId)]
);

export const systemJobs = pgTable("system_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobType: varchar("job_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  attempts: integer("attempts").default(0).notNull(),
  lastError: text("last_error"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const districtsRelations = relations(districts, ({ many }) => ({
  tehsils: many(tehsils),
  postOffices: many(postOffices),
  complaints: many(complaints),
  constituencies: many(constituencies),
}));

export const tehsilsRelations = relations(tehsils, ({ one, many }) => ({
  district: one(districts, {
    fields: [tehsils.districtId],
    references: [districts.id],
  }),
  unionCouncils: many(unionCouncils),
  constituencies: many(constituencies),
}));

export const unionCouncilsRelations = relations(unionCouncils, ({ one, many }) => ({
  tehsil: one(tehsils, {
    fields: [unionCouncils.tehsilId],
    references: [tehsils.id],
  }),
  district: one(districts, {
    fields: [unionCouncils.districtId],
    references: [districts.id],
  }),
  areas: many(areas),
}));

export const constituenciesRelations = relations(constituencies, ({ one, many }) => ({
  district: one(districts, {
    fields: [constituencies.districtId],
    references: [districts.id],
  }),
  tehsil: one(tehsils, {
    fields: [constituencies.tehsilId],
    references: [tehsils.id],
  }),
  complaints: many(complaints),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  complaints: many(complaints),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  district: one(districts, {
    fields: [complaints.districtId],
    references: [districts.id],
  }),
  tehsil: one(tehsils, {
    fields: [complaints.tehsilId],
    references: [tehsils.id],
  }),
  unionCouncil: one(unionCouncils, {
    fields: [complaints.unionCouncilId],
    references: [unionCouncils.id],
  }),
  postOffice: one(postOffices, {
    fields: [complaints.postOfficeId],
    references: [postOffices.id],
  }),
  constituency: one(constituencies, {
    fields: [complaints.constituencyId],
    references: [constituencies.id],
  }),
  category: one(categories, {
    fields: [complaints.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [complaints.subcategoryId],
    references: [subcategories.id],
  }),
  department: one(departments, {
    fields: [complaints.departmentId],
    references: [departments.id],
  }),
  assignedOfficer: one(adminUsers, {
    fields: [complaints.assignedOfficerId],
    references: [adminUsers.id],
  }),
  attachments: many(attachments),
  messages: many(messages),
  statusHistory: many(statusHistory),
  escalations: many(escalations),
  notifications: many(notifications),
  feedback: many(feedback),
}));

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  department: one(departments, {
    fields: [adminUsers.departmentId],
    references: [departments.id],
  }),
  district: one(districts, {
    fields: [adminUsers.districtId],
    references: [districts.id],
  }),
}));
