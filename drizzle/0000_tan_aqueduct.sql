CREATE TABLE "seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"isbooked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64),
	"email" varchar(322) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password" varchar(66),
	"salt" text,
	"role" varchar DEFAULT 'customer',
	"verification_token" text,
	"refresh_token" text,
	"reset_password_token" text,
	"rest_password_expires" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
