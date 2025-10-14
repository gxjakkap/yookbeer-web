import { signOut } from "next-auth/react"

import { Button } from "./ui/button"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function SignOutButton(props: SignOutButtonProps) {
  const v = props.variant || "default"
  return (
    <Button onClick={() => signOut()} variant={v}>
      ออกจากระบบ
    </Button>
  )
}
