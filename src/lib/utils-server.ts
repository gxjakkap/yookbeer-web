"use server"

import { getRandomValues } from "node:crypto"

export function generateRandomString(length: number) {
	const bytes = new Uint8Array(Math.ceil(length / 2))
	getRandomValues(bytes)
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, length)
}
