import { pgTable, varchar, integer, text, timestamp, primaryKey, boolean } from "drizzle-orm/pg-core"

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import type { AdapterAccountType } from "next-auth/adapters"
 
const connectionString = process.env.DATABASE_URL || ""
const pool = postgres(connectionString, { max: 1 })

export const db = drizzle(pool)

export const thirtyeight = pgTable("thirtyeight", {
	stdid: varchar({ length: 20 }).primaryKey().notNull(),
	course: integer().notNull(),
	nameth: varchar({ length: 255 }),
	nameen: varchar({ length: 255 }).notNull(),
	nickth: varchar({ length: 255 }),
	nicken: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	emailper: varchar({ length: 100 }),
	emailuni: varchar({ length: 100 }),
	emerphone: varchar({ length: 20 }),
	emerrelation: varchar({ length: 50 }),
	facebook: varchar({ length: 255 }),
	lineid: varchar({ length: 100 }),
	instagram: varchar({ length: 100 }),
	discord: varchar({ length: 100 }),
	img: varchar({ length: 20 }),
})

export const users = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique().notNull(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
	role: varchar("role", { length: 100 })
})
   
export const accounts = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccountType>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	})
)
   
export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
})
   
export const verificationTokens = pgTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	})
)
   
export const authenticators = pgTable(
	"authenticator",
	{
		credentialID: text("credentialID").notNull().unique(),
		userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
		providerAccountId: text("providerAccountId").notNull(),
		credentialPublicKey: text("credentialPublicKey").notNull(),
		counter: integer("counter").notNull(),
		credentialDeviceType: text("credentialDeviceType").notNull(),
		credentialBackedUp: boolean("credentialBackedUp").notNull(),
		transports: text("transports"),
	},
	(authenticator) => ({
		compositePK: primaryKey({
		columns: [authenticator.userId, authenticator.credentialID],
		}),
	})
)
