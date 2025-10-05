CREATE TABLE "alert_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"alert_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"action" varchar(32) NOT NULL,
	"actor" varchar(64),
	"actor_type" varchar(16) NOT NULL,
	"changes" jsonb,
	"reason" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_escalation_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"tenant_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"escalation_rules" jsonb NOT NULL,
	"conditions" jsonb,
	"created_by" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"alert_id" text NOT NULL,
	"channel" varchar(32) NOT NULL,
	"recipient" varchar(256) NOT NULL,
	"recipient_name" varchar(128),
	"subject" varchar(256),
	"body" text NOT NULL,
	"metadata" jsonb,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"tenant_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"trigger_type" varchar(32) NOT NULL,
	"trigger_config" jsonb NOT NULL,
	"severity" varchar(16) NOT NULL,
	"channels" jsonb NOT NULL,
	"cooldown_minutes" integer DEFAULT 5 NOT NULL,
	"group_similar" boolean DEFAULT true NOT NULL,
	"group_window_minutes" integer DEFAULT 15 NOT NULL,
	"created_by" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"date" varchar(10) NOT NULL,
	"total_alerts" integer DEFAULT 0 NOT NULL,
	"critical_alerts" integer DEFAULT 0 NOT NULL,
	"high_alerts" integer DEFAULT 0 NOT NULL,
	"medium_alerts" integer DEFAULT 0 NOT NULL,
	"low_alerts" integer DEFAULT 0 NOT NULL,
	"ml_alerts" integer DEFAULT 0 NOT NULL,
	"threshold_alerts" integer DEFAULT 0 NOT NULL,
	"pattern_alerts" integer DEFAULT 0 NOT NULL,
	"manual_alerts" integer DEFAULT 0 NOT NULL,
	"resolved_alerts" integer DEFAULT 0 NOT NULL,
	"avg_resolution_time_minutes" numeric(10, 2),
	"acknowledged_alerts" integer DEFAULT 0 NOT NULL,
	"avg_acknowledgment_time_minutes" numeric(10, 2),
	"total_notifications" integer DEFAULT 0 NOT NULL,
	"successful_notifications" integer DEFAULT 0 NOT NULL,
	"failed_notifications" integer DEFAULT 0 NOT NULL,
	"avg_alert_processing_time_ms" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"tenant_id" text NOT NULL,
	"subject_template" varchar(256) NOT NULL,
	"body_template" text NOT NULL,
	"html_template" text,
	"available_variables" jsonb NOT NULL,
	"default_variables" jsonb,
	"email_template" jsonb,
	"slack_template" jsonb,
	"webhook_template" jsonb,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"title" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"severity" varchar(16) NOT NULL,
	"category" varchar(64) NOT NULL,
	"request_id" varchar(64),
	"user_id" varchar(64),
	"ip_address" varchar(45),
	"user_agent" text,
	"ml_model_id" text,
	"ml_risk_score" numeric(5, 4),
	"ml_confidence" numeric(5, 4),
	"ml_threat_type" varchar(64),
	"context" jsonb,
	"evidence" jsonb,
	"status" varchar(16) DEFAULT 'new' NOT NULL,
	"dismissed_at" timestamp with time zone,
	"dismissed_by" varchar(64),
	"dismissed_reason" text,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" varchar(64),
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewall_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"api_key_id" text,
	"user_id" text,
	"agent_id" text,
	"route_prefix" varchar(256),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewall_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" varchar(512),
	"priority" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"mode" varchar(16) DEFAULT 'enforce' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewall_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" varchar(512),
	"conditions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"action" varchar(32) NOT NULL,
	"severity" varchar(16) DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "behavioral_patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" varchar(64),
	"tenant_id" text NOT NULL,
	"pattern_type" varchar(32) NOT NULL,
	"baseline_value" numeric(20, 6) NOT NULL,
	"current_value" numeric(20, 6) NOT NULL,
	"deviation_score" numeric(5, 4) NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"is_anomaly" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_by" varchar(64),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ml_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ml_model_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"total_predictions" integer NOT NULL,
	"true_positives" integer NOT NULL,
	"false_positives" integer NOT NULL,
	"true_negatives" integer NOT NULL,
	"false_negatives" integer NOT NULL,
	"precision" numeric(5, 4),
	"recall" numeric(5, 4),
	"f1_score" numeric(5, 4),
	"accuracy" numeric(5, 4),
	"avg_processing_time_ms" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "ml_models" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"version" varchar(32) NOT NULL,
	"type" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'training' NOT NULL,
	"accuracy" numeric(5, 4),
	"precision" numeric(5, 4),
	"recall" numeric(5, 4),
	"f1_score" numeric(5, 4),
	"training_data_size" integer DEFAULT 0 NOT NULL,
	"last_trained" timestamp with time zone,
	"model_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_predictions" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" varchar(64) NOT NULL,
	"model_id" text NOT NULL,
	"risk_score" numeric(5, 4) NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"threat_type" varchar(64),
	"predicted_action" varchar(16) NOT NULL,
	"actual_action" varchar(16),
	"features" jsonb NOT NULL,
	"explanation" text,
	"processing_time_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_training_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"request_id" varchar(64) NOT NULL,
	"is_threat" boolean NOT NULL,
	"threat_category" varchar(64),
	"features" jsonb NOT NULL,
	"raw_request" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "alert_audit_log_alert_idx" ON "alert_audit_log" USING btree ("alert_id");--> statement-breakpoint
CREATE INDEX "alert_audit_log_tenant_idx" ON "alert_audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alert_audit_log_action_idx" ON "alert_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "alert_audit_log_actor_idx" ON "alert_audit_log" USING btree ("actor");--> statement-breakpoint
CREATE INDEX "alert_audit_log_timestamp_idx" ON "alert_audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "alert_escalation_policies_tenant_idx" ON "alert_escalation_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alert_escalation_policies_active_idx" ON "alert_escalation_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "alert_notifications_alert_idx" ON "alert_notifications" USING btree ("alert_id");--> statement-breakpoint
CREATE INDEX "alert_notifications_channel_idx" ON "alert_notifications" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "alert_notifications_status_idx" ON "alert_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alert_notifications_recipient_idx" ON "alert_notifications" USING btree ("recipient");--> statement-breakpoint
CREATE INDEX "alert_notifications_next_retry_idx" ON "alert_notifications" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "alert_rules_tenant_idx" ON "alert_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alert_rules_active_idx" ON "alert_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "alert_rules_severity_idx" ON "alert_rules" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "alert_rules_trigger_type_idx" ON "alert_rules" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "alert_statistics_tenant_idx" ON "alert_statistics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alert_statistics_date_idx" ON "alert_statistics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "alert_templates_tenant_idx" ON "alert_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alert_templates_default_idx" ON "alert_templates" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "alerts_tenant_idx" ON "alerts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "alerts_rule_idx" ON "alerts" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "alerts_status_idx" ON "alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alerts_severity_idx" ON "alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "alerts_category_idx" ON "alerts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "alerts_triggered_at_idx" ON "alerts" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX "alerts_request_idx" ON "alerts" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "alerts_user_idx" ON "alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "firewall_bindings_tenant_idx" ON "firewall_bindings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "firewall_bindings_policy_idx" ON "firewall_bindings" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "firewall_bindings_apikey_idx" ON "firewall_bindings" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "firewall_bindings_agent_idx" ON "firewall_bindings" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "firewall_bindings_user_idx" ON "firewall_bindings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "firewall_policies_tenant_idx" ON "firewall_policies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "firewall_policies_active_idx" ON "firewall_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "firewall_policies_priority_idx" ON "firewall_policies" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "firewall_rules_policy_idx" ON "firewall_rules" USING btree ("policy_id");--> statement-breakpoint
CREATE INDEX "firewall_rules_active_idx" ON "firewall_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "firewall_rules_action_idx" ON "firewall_rules" USING btree ("action");--> statement-breakpoint
CREATE INDEX "behavioral_patterns_user_idx" ON "behavioral_patterns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "behavioral_patterns_tenant_idx" ON "behavioral_patterns" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "behavioral_patterns_pattern_type_idx" ON "behavioral_patterns" USING btree ("pattern_type");--> statement-breakpoint
CREATE INDEX "behavioral_patterns_anomaly_idx" ON "behavioral_patterns" USING btree ("is_anomaly");--> statement-breakpoint
CREATE INDEX "behavioral_patterns_last_updated_idx" ON "behavioral_patterns" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "ml_config_key_idx" ON "ml_config" USING btree ("key");--> statement-breakpoint
CREATE INDEX "ml_config_active_idx" ON "ml_config" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "ml_model_metrics_model_idx" ON "ml_model_metrics" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ml_model_metrics_timestamp_idx" ON "ml_model_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "ml_models_type_idx" ON "ml_models" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ml_models_status_idx" ON "ml_models" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ml_models_accuracy_idx" ON "ml_models" USING btree ("accuracy");--> statement-breakpoint
CREATE INDEX "ml_predictions_request_idx" ON "ml_predictions" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "ml_predictions_model_idx" ON "ml_predictions" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ml_predictions_risk_score_idx" ON "ml_predictions" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "ml_predictions_threat_type_idx" ON "ml_predictions" USING btree ("threat_type");--> statement-breakpoint
CREATE INDEX "ml_predictions_created_at_idx" ON "ml_predictions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ml_training_data_model_idx" ON "ml_training_data" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "ml_training_data_threat_idx" ON "ml_training_data" USING btree ("is_threat");--> statement-breakpoint
CREATE INDEX "ml_training_data_category_idx" ON "ml_training_data" USING btree ("threat_category");--> statement-breakpoint
CREATE INDEX "ml_training_data_created_at_idx" ON "ml_training_data" USING btree ("created_at");