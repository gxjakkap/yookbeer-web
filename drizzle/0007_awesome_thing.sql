CREATE TABLE IF NOT EXISTS "log" (
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"target" text,
	"details" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "log" ADD CONSTRAINT "log_actor_user_id_fk" FOREIGN KEY ("actor") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
