CREATE TABLE "dataset_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"query_count" integer DEFAULT 0 NOT NULL,
	"last_query_at" timestamp with time zone,
	"avg_query_time" integer DEFAULT 0,
	"avg_relevance_score" integer DEFAULT 0,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(50) DEFAULT 'Database',
	"color" varchar(50) DEFAULT 'blue',
	"user_id" uuid NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"document_count" integer DEFAULT 0 NOT NULL,
	"total_size" integer DEFAULT 0 NOT NULL,
	"embedding_model" varchar(100) DEFAULT 'text-embedding-ada-002',
	"chunk_size" integer DEFAULT 512 NOT NULL,
	"chunk_overlap" integer DEFAULT 50 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" jsonb,
	"embedding_model" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"name" varchar(500) NOT NULL,
	"original_name" varchar(500),
	"mime_type" varchar(100),
	"size" integer NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"file_url" text,
	"file_hash" varchar(64),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"embedding_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_pk" PRIMARY KEY("token")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"category" varchar(64) NOT NULL,
	"description" text,
	"icon" varchar(64),
	"requires_auth" boolean DEFAULT false NOT NULL,
	"auth_type" varchar(64),
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dataset_statistics" ADD CONSTRAINT "dataset_statistics_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dataset_statistics_dataset_id_idx" ON "dataset_statistics" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "dataset_statistics_date_idx" ON "dataset_statistics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "datasets_user_id_idx" ON "datasets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "datasets_name_idx" ON "datasets" USING btree ("name");--> statement-breakpoint
CREATE INDEX "datasets_created_at_idx" ON "datasets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_chunks_chunk_index_idx" ON "document_chunks" USING btree ("chunk_index");--> statement-breakpoint
CREATE INDEX "documents_dataset_id_idx" ON "documents" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_name_idx" ON "documents" USING btree ("name");--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_file_hash_idx" ON "documents" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");