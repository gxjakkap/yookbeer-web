import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth, { type DefaultSession } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

import { db } from "./db"
import { accounts, sessions, users, verificationTokens } from "./db/schema"
import { actionLog, LogAction } from "./lib/log"

//import { user } from "../drizzle/schema"

declare module "next-auth" {
	interface Session {
		user: {
			role?: string
		} & DefaultSession["user"]
	}
	interface User {
		role?: string
	}
}

const Entra = MicrosoftEntraID({
	clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
	clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
	issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
	profile(profile) {
		return {
			id: profile.oid,
			name: profile.name,
			email: profile.upn || profile.unique_name, // Using UPN (User Principal Name) as email
			emailVerified: null,
			image: null,
		}
	},
})

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: DrizzleAdapter(
		db as never,
		{
			usersTable: users,
			accountsTable: accounts,
			sessionsTable: sessions,
			verificationTokensTable: verificationTokens,
		} as never
	),
	providers: [Entra],
	callbacks: {
		signIn: async ({ user }) => {
			// If it's a new user, set default role
			if (!user.role) {
				user.role = "unauthorized"
			}
			actionLog({
				action: LogAction.LOGIN,
				actor: user.email || "",
			})
			return true
		},
		session: async ({ session, user }) => {
			return {
				...session,
				user: {
					...session.user,
					role: user.role,
				},
			}
		},
	},
	pages: {
		signIn: "/login",
	},
	debug: process.env.NODE_ENV === "development",
})
