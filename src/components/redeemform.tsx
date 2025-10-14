"use client"

import { redeemInviteCode } from "@/app/invite/actions"
import { RedeemInviteCodeStatus } from "@/app/invite/types"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"

const formSchema = z.object({
  code: z
    .string({ message: "Invite code must be a string" })
    .min(3, { message: "Invite code must be longer that 3 letters" }),
})

export function RedeemForm() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = (val: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const res = await redeemInviteCode(val.code)

        if (res.status === RedeemInviteCodeStatus.USED) {
          toast({
            title: `Invite code "${res.code}" is already used!`,
            variant: "destructive",
          })
        } else if (res.status === RedeemInviteCodeStatus.INVALID) {
          toast({
            title: `Invite code "${res.code}" is invalid!`,
            variant: "destructive",
          })
        } else if (res.status === RedeemInviteCodeStatus.UNNECESSARY) {
          toast({
            title: `You already have access to yookbeer!`,
            variant: "destructive",
          })
          window.location.href = "/"
        } else if (res.status === RedeemInviteCodeStatus.OK) {
          toast({
            title: "Invite code redeemed successfully",
          })
          window.location.href = "/"
        } else {
          toast({
            title: `Unknown error occurred!`,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: `Unknown error occurred!`,
          variant: "destructive",
        })
        console.error(error)
      }
    })
  }

  return (
    <>
      {isPending ? (
        <LoaderCircle className="mx-auto h-16 w-16 animate-spin" />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter it here." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mx-auto w-full">
              Redeem
            </Button>
          </form>
        </Form>
      )}
    </>
  )
}
