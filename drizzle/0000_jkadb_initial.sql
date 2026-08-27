CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'district_admin', 'reviewer', 'complaint_officer', 'citizen');
CREATE TYPE "public"."complaint_status" AS ENUM('submitted', 'verified', 'assigned', 'under_review', 'investigation', 'awaiting_response', 'resolved', 'citizen_confirmation', 'closed', 'rejected', 'reopened', 'duplicate', 'invalid', 'escalated', 'withdrawn', 'awaiting_citizen_response');
CREATE TYPE "public"."priority" AS ENUM('normal', 'urgent', 'critical');
CREATE TYPE "public"."sla_status" AS ENUM('on_time', 'approaching', 'overdue');
CREATE TYPE "public"."message_type" AS ENUM('citizen', 'officer', 'admin', 'internal_note', 'system');
CREATE TYPE "public"."notification_type" AS ENUM('complaint_submitted', 'complaint_assigned', 'status_changed', 'officer_replied', 'info_requested', 'resolved', 'rejected', 'reopened', 'announcement', 'sla_approaching', 'sla_overdue', 'critical_complaint', 'escalation', 'new_complaint', 'citizen_response', 'assignment');
CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'scheduled', 'published', 'archived');
CREATE TYPE "public"."feedback_rating" AS ENUM('resolved', 'partially', 'not_resolved');
CREATE TYPE "public"."notification_delivery_status" AS ENUM('pending', 'sent', 'delivered', 'failed');
CREATE TABLE "districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"code" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "tehsils" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" uuid NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"code" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "union_councils" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tehsil_id" uuid NOT NULL,
	"district_id" uuid NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"code" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "constituencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"code" varchar(50),
	"constituency_type" varchar(50) DEFAULT 'LA',
	"district_id" uuid,
	"tehsil_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"union_council_id" uuid,
	"tehsil_id" uuid,
	"district_id" uuid,
	"constituency_id" uuid,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "post_offices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" uuid NOT NULL,
	"tehsil_id" uuid NOT NULL,
	"union_council_id" uuid,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"code" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"description" text,
	"icon" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"description" text,
	"responsible_area" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sla_hours" integer DEFAULT 72,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100),
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"role" "user_role" DEFAULT 'complaint_officer' NOT NULL,
	"department_id" uuid,
	"district_id" uuid,
	"officer_id" varchar(100),
	"designation" varchar(200),
	"phone" varchar(30),
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);

CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_number" varchar(50) NOT NULL,
	"sequence_number" serial NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"father_name" varchar(200) NOT NULL,
	"cnic_hash" varchar(255) NOT NULL,
	"cnic_masked" varchar(20) NOT NULL,
	"phone" varchar(30),
	"email" varchar(255),
	"district_id" uuid,
	"tehsil_id" uuid,
	"tehsil_custom" varchar(200),
	"union_council_id" uuid,
	"post_office_id" uuid,
	"constituency_id" uuid,
	"area_id" uuid,
	"area_custom" varchar(200),
	"address" text,
	"latitude" varchar(30),
	"longitude" varchar(30),
	"category_id" uuid,
	"subcategory_id" uuid,
	"description" text NOT NULL,
	"additional_info" text,
	"language" varchar(10) DEFAULT 'en',
	"status" "complaint_status" DEFAULT 'submitted' NOT NULL,
	"priority" "priority" DEFAULT 'normal' NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"department_id" uuid,
	"assigned_officer_id" uuid,
	"assigned_at" timestamp,
	"sla_deadline" timestamp,
	"sla_status" "sla_status" DEFAULT 'on_time',
	"sla_extended_at" timestamp,
	"sla_extended_by" uuid,
	"sla_extension_reason" text,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"resolution_description" text,
	"official_response" text,
	"tracking_secret" varchar(255) NOT NULL,
	"idempotency_key" varchar(100),
	"duplicate_of_id" uuid,
	"deleted_at" timestamp,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"read_by" uuid,
	"ip_address" varchar(50),
	"user_agent" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "complaints_tracking_number_unique" UNIQUE("tracking_number")
);

CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"storage_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" uuid,
	"is_public" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"message_type" "message_type" NOT NULL,
	"content" text NOT NULL,
	"sender_name" varchar(200),
	"sender_admin_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"previous_status" "complaint_status",
	"new_status" "complaint_status" NOT NULL,
	"changed_by" uuid,
	"changed_by_name" varchar(200),
	"reason" text,
	"internal_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"escalated_by" uuid,
	"escalated_to" uuid,
	"reason" text,
	"level" integer DEFAULT 1,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "sla_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category_id" uuid,
	"department_id" uuid,
	"priority" "priority" DEFAULT 'normal',
	"hours_to_resolve" integer DEFAULT 72 NOT NULL,
	"hours_to_assign" integer DEFAULT 24,
	"escalation_level1_hours" integer DEFAULT 48,
	"escalation_level2_hours" integer DEFAULT 96,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_admin_id" uuid,
	"recipient_tracking_number" varchar(50),
	"complaint_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(500) NOT NULL,
	"title_ur" varchar(500),
	"description_en" text NOT NULL,
	"description_ur" text,
	"banner_url" varchar(500),
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"priority" integer DEFAULT 0,
	"publish_at" timestamp,
	"expires_at" timestamp,
	"is_persistent" boolean DEFAULT false,
	"is_popup" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"rating" "feedback_rating" NOT NULL,
	"comment" text,
	"request_reopen" boolean DEFAULT false,
	"reopen_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_name" varchar(200),
	"actor_role" varchar(50),
	"action" varchar(200) NOT NULL,
	"target_type" varchar(100),
	"target_id" varchar(200),
	"target_description" varchar(500),
	"previous_value" jsonb,
	"new_value" jsonb,
	"metadata" jsonb,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(200) NOT NULL,
	"value" text,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);

CREATE TABLE "faq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_en" text NOT NULL,
	"question_ur" text,
	"answer_en" text NOT NULL,
	"answer_ur" text,
	"category" varchar(100) DEFAULT 'general',
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "complaint_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"form_data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(150) NOT NULL,
	"label" varchar(200) NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);

CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token_id" varchar(100) NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_id_unique" UNIQUE("token_id")
);

CREATE TABLE "public_contact_information" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label_en" varchar(200) NOT NULL,
	"label_ur" varchar(200),
	"value" text NOT NULL,
	"kind" varchar(50) DEFAULT 'general' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "quick_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"title_ur" varchar(300),
	"message_en" text NOT NULL,
	"message_ur" text,
	"priority" "priority" DEFAULT 'urgent' NOT NULL,
	"display_mode" varchar(30) DEFAULT 'banner' NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "response_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(100),
	"body_en" text NOT NULL,
	"body_ur" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "ai_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) NOT NULL,
	"model" varchar(100),
	"success" boolean NOT NULL,
	"latency_ms" integer,
	"error_type" varchar(100),
	"rate_limited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notification_delivery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"channel" varchar(30) NOT NULL,
	"status" "notification_delivery_status" DEFAULT 'pending' NOT NULL,
	"provider_message_id" varchar(255),
	"error_message" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "system_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "tehsils" ADD CONSTRAINT "tehsils_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "union_councils" ADD CONSTRAINT "union_councils_tehsil_id_tehsils_id_fk" FOREIGN KEY ("tehsil_id") REFERENCES "public"."tehsils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "union_councils" ADD CONSTRAINT "union_councils_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_tehsil_id_tehsils_id_fk" FOREIGN KEY ("tehsil_id") REFERENCES "public"."tehsils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "areas" ADD CONSTRAINT "areas_union_council_id_union_councils_id_fk" FOREIGN KEY ("union_council_id") REFERENCES "public"."union_councils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "areas" ADD CONSTRAINT "areas_tehsil_id_tehsils_id_fk" FOREIGN KEY ("tehsil_id") REFERENCES "public"."tehsils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "areas" ADD CONSTRAINT "areas_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "areas" ADD CONSTRAINT "areas_constituency_id_constituencies_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituencies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_tehsil_id_tehsils_id_fk" FOREIGN KEY ("tehsil_id") REFERENCES "public"."tehsils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_union_council_id_union_councils_id_fk" FOREIGN KEY ("union_council_id") REFERENCES "public"."union_councils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_tehsil_id_tehsils_id_fk" FOREIGN KEY ("tehsil_id") REFERENCES "public"."tehsils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_union_council_id_union_councils_id_fk" FOREIGN KEY ("union_council_id") REFERENCES "public"."union_councils"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_post_office_id_post_offices_id_fk" FOREIGN KEY ("post_office_id") REFERENCES "public"."post_offices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_constituency_id_constituencies_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituencies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_officer_id_admin_users_id_fk" FOREIGN KEY ("assigned_officer_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_sla_extended_by_admin_users_id_fk" FOREIGN KEY ("sla_extended_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolved_by_admin_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_read_by_admin_users_id_fk" FOREIGN KEY ("read_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_admin_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_admin_id_admin_users_id_fk" FOREIGN KEY ("sender_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_changed_by_admin_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_escalated_by_admin_users_id_fk" FOREIGN KEY ("escalated_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_escalated_to_admin_users_id_fk" FOREIGN KEY ("escalated_to") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sla_configurations" ADD CONSTRAINT "sla_configurations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sla_configurations" ADD CONSTRAINT "sla_configurations_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_admin_id_admin_users_id_fk" FOREIGN KEY ("recipient_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_admin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quick_alerts" ADD CONSTRAINT "quick_alerts_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "districts_name_en_idx" ON "districts" USING btree ("name_en");
CREATE INDEX "tehsils_district_idx" ON "tehsils" USING btree ("district_id");
CREATE INDEX "uc_tehsil_idx" ON "union_councils" USING btree ("tehsil_id");
CREATE INDEX "uc_district_idx" ON "union_councils" USING btree ("district_id");
CREATE INDEX "constituencies_district_idx" ON "constituencies" USING btree ("district_id");
CREATE INDEX "areas_district_idx" ON "areas" USING btree ("district_id");
CREATE INDEX "post_offices_district_idx" ON "post_offices" USING btree ("district_id");
CREATE INDEX "post_offices_tehsil_idx" ON "post_offices" USING btree ("tehsil_id");
CREATE INDEX "post_offices_uc_idx" ON "post_offices" USING btree ("union_council_id");
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");
CREATE INDEX "admin_users_username_idx" ON "admin_users" USING btree ("username");
CREATE UNIQUE INDEX "complaints_tracking_number_idx" ON "complaints" USING btree ("tracking_number");
CREATE UNIQUE INDEX "complaints_idempotency_key_idx" ON "complaints" USING btree ("idempotency_key");
CREATE INDEX "complaints_status_idx" ON "complaints" USING btree ("status");
CREATE INDEX "complaints_district_idx" ON "complaints" USING btree ("district_id");
CREATE INDEX "complaints_category_idx" ON "complaints" USING btree ("category_id");
CREATE INDEX "complaints_created_at_idx" ON "complaints" USING btree ("created_at");
CREATE INDEX "complaints_assigned_officer_idx" ON "complaints" USING btree ("assigned_officer_id");
CREATE INDEX "messages_complaint_idx" ON "messages" USING btree ("complaint_id");
CREATE INDEX "status_history_complaint_idx" ON "status_history" USING btree ("complaint_id");
CREATE INDEX "notifications_admin_idx" ON "notifications" USING btree ("recipient_admin_id");
CREATE INDEX "notifications_tracking_idx" ON "notifications" USING btree ("recipient_tracking_number");
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
CREATE UNIQUE INDEX "role_permissions_role_permission_idx" ON "role_permissions" USING btree ("role","permission_id");
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("admin_user_id");
CREATE INDEX "admin_sessions_expires_idx" ON "admin_sessions" USING btree ("expires_at");
CREATE INDEX "ai_metrics_created_at_idx" ON "ai_metrics" USING btree ("created_at");
CREATE INDEX "notification_delivery_notification_idx" ON "notification_delivery" USING btree ("notification_id");
