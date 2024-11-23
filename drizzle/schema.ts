import { pgTable, unique, text, timestamp, varchar, foreignKey, integer, primaryKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	role: varchar({ length: 100 }),
}, (table) => {
	return {
		userEmailUnique: unique("user_email_unique").on(table.email),
	}
});

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => {
	return {
		sessionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	}
});

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
});

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => {
	return {
		verificationTokenIdentifierTokenPk: primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
	}
});

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => {
	return {
		authenticatorUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "authenticator_userId_user_id_fk"
		}).onDelete("cascade"),
		authenticatorUserIdCredentialIdPk: primaryKey({ columns: [table.credentialId, table.userId], name: "authenticator_userId_credentialID_pk"}),
		authenticatorCredentialIdUnique: unique("authenticator_credentialID_unique").on(table.credentialId),
	}
});

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => {
	return {
		accountUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
		accountProviderProviderAccountIdPk: primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
	}
});
