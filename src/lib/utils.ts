import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Crypto from "node:crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateRandomString(length: number) {
  return Crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}