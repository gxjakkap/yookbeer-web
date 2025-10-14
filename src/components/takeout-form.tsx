"use client"

import { takeoutAction } from "@/app/(authorized)/admin/actions"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { TAKEOUT_EXPORTABLE } from "@/lib/const"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "./ui/button"
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
    label: "Personal Email",
  },
  {
    id: "emailuni",
    label: "University Email",
  },
  {
    id: "facebook",
    label: "Facebook",
  },
  {
    id: "lineid",
    label: "Line ID",
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
  onlyAttending: z.enum(["true", "false"], {
    required_error: "This field is required",
    invalid_type_error: "This field must be true or false",
  }),
  including: z
    .array(z.enum(INCLUDABLE.map((i) => i.id) as [(typeof INCLUDABLE)[number]["id"], ...string[]]))
    .min(1, "Select at least one field"),
  format: z.enum(["csv", "json"]),
  includedCourse: z
    .array(z.enum(AVAILABLE_COURSES.map((c) => String(c.id)) as [string, ...string[]]))
    .min(1, "Select at least one course"),
})

export default function TakeoutForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      onlyAttending: "true",
      including: ["stdid", "course", "nameth", "nameen", "nickth", "nicken"],
      format: "csv",
      includedCourse: ["0", "1", "2", "3"],
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const prData = {
      onlyAttending: data.onlyAttending === "true",
      including: data.including.map((field) => {
        if (!TAKEOUT_EXPORTABLE.includes(field as (typeof TAKEOUT_EXPORTABLE)[number])) {
          throw new Error(`Invalid field included in export: ${field}`)
        }
        return field as (typeof TAKEOUT_EXPORTABLE)[number]
      }) as (typeof TAKEOUT_EXPORTABLE)[number][],
      format: data.format,
      includedCourse: data.includedCourse.map(Number),
    }
    const [url, err] = await takeoutAction(prData)

    if (err) {
      console.error("Export error:", err)
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data. Please try again later.",
        variant: "destructive",
      })
      return
    }

    window.open(url, "_blank")

    toast({
      title: "Data exported successfully!",
      description: `Your data has been exported as a ${data.format.toUpperCase()} file.`,
    })
  }

  return (
    <Card className="mx-10 my-5">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="my-5 flex flex-col gap-4">
            <div className="flex flex-col gap-x-60 gap-y-4 lg:flex-row lg:justify-center">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="onlyAttending"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="text-lg">Only include attending students</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value={"true"} />
                            </FormControl>
                            <FormLabel className="text-sm">True</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value={"false"} />
                            </FormControl>
                            <FormLabel className="text-sm">False</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Data Format</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="csv" />
                            </FormControl>
                            <FormLabel className="text-sm">CSV</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="json" />
                            </FormControl>
                            <FormLabel className="text-sm">JSON</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="including"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Include Column</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          {INCLUDABLE.map((item) => (
                            <label key={item.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={item.id}
                                checked={field.value.includes(item.id)}
                                onChange={(e) => {
                                  const value = e.target.checked
                                    ? [...field.value, item.id]
                                    : field.value.filter((v) => v !== item.id)
                                  field.onChange(value)
                                }}
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="includedCourse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Included Courses</FormLabel>
                      <FormControl>
                        <div className="flex flex-col space-y-2">
                          {AVAILABLE_COURSES.map((course) => (
                            <label key={course.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={String(course.id)}
                                checked={field.value.includes(String(course.id))}
                                onChange={(e) => {
                                  const value = e.target.checked
                                    ? [...field.value, String(course.id)]
                                    : field.value.filter((v) => v !== String(course.id))
                                  field.onChange(value)
                                }}
                              />
                              <span>{course.label}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" className="mt-4 w-full">
              Export Data
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
