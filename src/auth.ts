import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth, { type DefaultSession } from "next-auth"
import { type DefaultJWT } from "next-auth/jwt"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

import { authConfig } from "./auth.config"
import { db } from "./db"
import { accounts, sessions, users, verificationTokens } from "./db/schema"
import { actionLog, LogAction } from "./lib/log"

declare module "next-auth/jwt" {
	interface JWT {
		role?: string
	}
}

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

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	adapter: DrizzleAdapter(
		db as never,
		{
			usersTable: users,
			accountsTable: accounts,
			sessionsTable: sessions,
			verificationTokensTable: verificationTokens,
		} as never
	),
	providers: [
		MicrosoftEntraID({
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
			issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
			profile(profile) {
				return {
					id: profile.oid,
					name: profile.name,
					email: profile.upn || profile.unique_name,
					emailVerified: null,
					image: null,
				}
			},
		}),
	],
	callbacks: {
		signIn: async ({ user }) => {
			if (!user.role) {
				user.role = "unauthorized"
			}
			actionLog({
				action: LogAction.LOGIN,
				actor: user.email || "",
			})
			return true
		},
		jwt: async ({ token, user }) => {
			if (user) {
				token.role = user.role
			}
			return token
		},
		session: async ({ session, user, token }) => {
			return {
				...session,
				user: {
					...session.user,
					role: user?.role ?? (token?.role as string | undefined),
				},
			}
		},
	},
	debug: process.env.NODE_ENV === "development",
})
