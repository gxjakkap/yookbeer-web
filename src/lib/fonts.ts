import { Noto_Sans_Thai_Looped } from "next/font/google"

// Looped Thai is easier to read for names than the loopless UI face (Anuphan); use it wherever a Thai name/nickname shows.
export const thaiNameFont = Noto_Sans_Thai_Looped({
	subsets: ["latin", "thai"],
	weight: "400",
})
