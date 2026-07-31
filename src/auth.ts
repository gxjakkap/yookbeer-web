import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import NextAuth, { type DefaultSession } from "next-auth"
// biome-ignore lint/correctness/noUnusedImports: <used in delcare module below>
import type { DefaultJWT } from "next-auth/jwt"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

import { authConfig } from "./auth.config"
import { db } from "./db"
import { accounts, sessions, users, verificationTokens } from "./db/schema"
import { actionLog, LogAction } from "./lib/log"

// Entra ID returns the photo as raw bytes, not a URL - fetch and inline it as a data URI.
// ponytail: no refresh_token stored (no offline_access scope), so this only runs on active login
async function fetchEntraPhoto(accessToken: string) {
	try {
		const res = await fetch("https://graph.microsoft.com/v1.0/me/photos/96x96/$value", {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		if (!res.ok) {
			console.error("[auth] Entra photo fetch failed", res.status, await res.text())
			return null
		}
		const buf = await res.arrayBuffer()
		return `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`
	} catch (e) {
		console.error("[auth] Entra photo fetch error", e)
		return null
	}
}

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
			authorization: {
				params: { scope: "openid profile email https://graph.microsoft.com/User.Read" },
			},
			async profile(profile, tokens) {
				return {
					id: profile.oid,
					name: profile.name,
					email: profile.upn || profile.unique_name,
					emailVerified: null,
					image: tokens.access_token ? await fetchEntraPhoto(tokens.access_token) : null,
				}
			},
		}),
	],
	callbacks: {
		signIn: async ({ user, account }) => {
			if (!user.role) {
				user.role = "unauthorized"
			}
			if (user.id && account?.access_token) {
				const image = await fetchEntraPhoto(account.access_token)
				if (image) {
					await db.update(users).set({ image }).where(eq(users.id, user.id))
				}
			}
			actionLog({
				action: LogAction.LOGIN,
				actor: user.id || "",
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
					id: user?.id ?? token?.sub,
				},
			}
		},
	},
	debug: process.env.NODE_ENV === "development",
})
