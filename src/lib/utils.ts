import Crypto from "node:crypto"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function generateRandomString(length: number) {
	return Crypto.randomBytes(Math.ceil(length / 2))
		.toString("hex")
		.slice(0, length)
}
