"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { redeemInviteCode } from "@/app/invite/actions"
import { RedeemInviteCodeStatus } from "@/app/invite/types"
import { useToast } from "@/hooks/use-toast"

import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"

const formSchema = z.object({
	code: z.string().trim().min(3, { message: "Invite codes are at least 3 characters" }),
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
					form.setError("code", {
						message: `"${res.code}" has already been used. Ask for a new code.`,
					})
				} else if (res.status === RedeemInviteCodeStatus.INVALID) {
					form.setError("code", {
						message: `"${res.code}" isn't a valid code. Check it and try again.`,
					})
				} else if (
					res.status === RedeemInviteCodeStatus.OK ||
					res.status === RedeemInviteCodeStatus.UNNECESSARY
				) {
					// full reload so the session picks up the new role
					window.location.href = "/"
				} else {
					toast({
						title: "Couldn't redeem invite code",
						description: "Try again.",
						variant: "destructive",
					})
				}
			} catch (error) {
				toast({
					title: "Couldn't redeem invite code",
					description: "Check your connection and try again.",
					variant: "destructive",
				})
				console.error(error)
			}
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Invite code</FormLabel>
							<FormControl>
								<Input
									autoComplete="off"
									autoCapitalize="none"
									spellCheck={false}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="mx-auto w-full" disabled={isPending}>
					{isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
					{isPending ? "Redeeming…" : "Redeem"}
				</Button>
			</form>
		</Form>
	)
}
