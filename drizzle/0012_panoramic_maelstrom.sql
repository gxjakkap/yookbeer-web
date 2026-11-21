CREATE TABLE IF NOT EXISTS "report" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stdid" varchar(20) NOT NULL,
	"reporter" text,
	"reasons" text[] NOT NULL,
	"dead_socials" text[] DEFAULT '{}' NOT NULL,
	"wrong_fields" text[] DEFAULT '{}' NOT NULL,
	"new_stdid" varchar(20),
	"note" text,
	"status" text DEFAULT 'unresolved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status_changed_by" text,
	"status_changed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report" ADD CONSTRAINT "report_stdid_students_stdid_fk" FOREIGN KEY ("stdid") REFERENCES "public"."students"("stdid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report" ADD CONSTRAINT "report_reporter_user_id_fk" FOREIGN KEY ("reporter") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "report" ADD CONSTRAINT "report_status_changed_by_user_id_fk" FOREIGN KEY ("status_changed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
