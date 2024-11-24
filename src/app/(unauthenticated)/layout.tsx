import type { Metadata } from "next"
import "../globals.css"
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "yookbeer",
}

export default async function UnauthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  if (session){
    redirect("/")
  }
  return (
    <>{children}</>
  )
}
