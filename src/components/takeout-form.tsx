"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { takeoutAction } from "@/app/(authorized)/admin/actions"
import { Card, CardContent } from "@/components/ui/card"
import { AVAILABLE } from "@/config/available-yearbook"
import { toast } from "@/hooks/use-toast"
import { TAKEOUT_EXPORTABLE } from "@/lib/const"

import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const INCLUDABLE = [
	{
		id: "stdid",
		label: "Student ID",
	},
	{
		id: "course",
		label: "Course",
	},
	{
		id: "nameth",
		label: "Name (TH)",
	},
	{
		id: "nameen",
		label: "Name (EN)",
	},
	{
		id: "nickth",
		label: "Nickname (TH)",
	},
	{
		id: "nicken",
		label: "Nickname (EN)",
	},
	{
		id: "phone",
		label: "Phone",
	},
	{
		id: "emailper",
		label: "Personal email",
	},
	{
		id: "emailuni",
		label: "University email",
	},
	{
		id: "facebook",
		label: "Facebook",
	},
	{
		id: "lineid",
		label: "LINE ID",
	},
	{
		id: "instagram",
		label: "Instagram",
	},
	{
		id: "discord",
		label: "Discord",
	},
	{
		id: "status",
		label: "Status",
	},
] as const

export const AVAILABLE_COURSES = [
	{ id: 0, label: "Regular" },
	{ id: 1, label: "International" },
	{ id: 2, label: "HDS" },
	{ id: 3, label: "RC" },
] as const

const formSchema = z.object({
	onlyAttending: z.boolean(),
	including: z
		.array(z.enum(INCLUDABLE.map((i) => i.id) as [(typeof INCLUDABLE)[number]["id"], ...string[]]))
		.min(1, "Select at least one column"),
	format: z.enum(["csv", "json"]),
	includedCourse: z
		.array(z.enum(AVAILABLE_COURSES.map((c) => String(c.id)) as [string, ...string[]]))
		.min(1, "Select at least one course"),
	includedGen: z.array(z.number()).min(1, "Select at least one generation"),
})

function CheckboxGroup<T extends string | number>({
	options,
	value,
	onChange,
}: {
	options: readonly { value: T; label: string }[]
	value: T[]
	onChange: (value: T[]) => void
}) {
	return (
		<div className="flex flex-col gap-y-2">
			{options.map((opt) => (
				<FormItem key={opt.value} className="flex flex-row items-center gap-x-2 space-y-0">
					<FormControl>
						<Checkbox
							checked={value.includes(opt.value)}
							onCheckedChange={(checked) =>
								onChange(
									checked ? [...value, opt.value] : value.filter((v) => v !== opt.value)
								)
							}
						/>
					</FormControl>
					<FormLabel className="font-normal">{opt.label}</FormLabel>
				</FormItem>
			))}
		</div>
	)
}

export default function TakeoutForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			onlyAttending: true,
			including: ["stdid", "course", "nameth", "nameen", "nickth", "nicken"],
			format: "csv",
			includedCourse: ["0", "1", "2", "3"],
			includedGen: [38],
		},
	})

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const prData = {
			onlyAttending: data.onlyAttending,
			including: data.including.map((field) => {
				if (!TAKEOUT_EXPORTABLE.includes(field as (typeof TAKEOUT_EXPORTABLE)[number])) {
					throw new Error(`Invalid field included in export: ${field}`)
				}
				return field as (typeof TAKEOUT_EXPORTABLE)[number]
			}) as (typeof TAKEOUT_EXPORTABLE)[number][],
			format: data.format,
			includedCourse: data.includedCourse.map(Number),
			includedGen: data.includedGen,
		}
		const [url, err] = await takeoutAction(prData)

		if (err) {
			console.error("Export error:", err)
			toast({
				title: "Couldn't export data",
				description: err.message,
				variant: "destructive",
			})
			return
		}

		window.open(url, "_blank")

		toast({
			title: "Export ready",
			description: `Your ${data.format.toUpperCase()} file opened in a new tab.`,
		})
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
							<div className="flex flex-col gap-6">
								<FormField
									control={form.control}
									name="onlyAttending"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center gap-x-2 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={(checked) =>
														field.onChange(checked === true)
													}
												/>
											</FormControl>
											<FormLabel className="font-normal">
												Only attending students
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="format"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Format</FormLabel>
											<FormControl>
												<RadioGroup
													onValueChange={field.onChange}
													defaultValue={field.value}
													className="flex flex-row gap-x-4"
												>
													<FormItem className="flex items-center gap-x-2 space-y-0">
														<FormControl>
															<RadioGroupItem value="csv" />
														</FormControl>
														<FormLabel className="font-normal">CSV</FormLabel>
													</FormItem>
													<FormItem className="flex items-center gap-x-2 space-y-0">
														<FormControl>
															<RadioGroupItem value="json" />
														</FormControl>
														<FormLabel className="font-normal">JSON</FormLabel>
													</FormItem>
												</RadioGroup>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="includedGen"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">Generations</FormLabel>
										<CheckboxGroup
											options={AVAILABLE.map((g) => ({ value: g.gen, label: g.label }))}
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="includedCourse"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">Courses</FormLabel>
										<CheckboxGroup
											options={AVAILABLE_COURSES.map((c) => ({
												value: String(c.id),
												label: c.label,
											}))}
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="including"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">Columns</FormLabel>
										<CheckboxGroup
											options={INCLUDABLE.map((i) => ({ value: i.id, label: i.label }))}
											value={field.value}
											onChange={field.onChange}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Exporting…" : "Export data"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
