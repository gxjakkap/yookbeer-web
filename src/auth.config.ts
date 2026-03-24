import type { NextAuthConfig } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const authConfig = {
	session: { strategy: "jwt" },
	providers: [
		MicrosoftEntraID({
			clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
			clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
			issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
		}),
	],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth }) {
			return !!auth?.user
		},
	},
} satisfies NextAuthConfig
