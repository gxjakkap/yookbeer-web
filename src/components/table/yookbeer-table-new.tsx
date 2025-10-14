"use client"

import { COURSE_SHORTHAND, Courses } from "@/lib/const"
import { DataTableFilterField, InitialStateTablePage, TableProps } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

import { ActionCell } from "../actioncell"
import { DataTable } from "./tablecomponents"

export interface YookbeerColumn {
  stdid: string
  course: number
  nameth: string | null
  nameen: string
  nickth: string | null
  nicken: string
  phone: string
  emailper: string | null
  emailuni: string | null
  emerphone: string | null
  facebook: string | null
  lineid: string | null
  instagram: string | null
  discord: string | null
  img: string | null
}

interface YookbeerTableProps {
  data: YookbeerColumn[]
  isAdmin: boolean
  initialState?: InitialStateTablePage
}

const filterKeys: Array<keyof YookbeerColumn> = [
  "stdid",
  "nameth",
  "nameen",
  "nickth",
  "nicken",
  "phone",
  "instagram",
  "discord",
]

export function YookbeerTable(props: YookbeerTableProps) {
  const filterFields: DataTableFilterField<YookbeerColumn>[] = useMemo(
    () => [
      {
        id: "course",
        label: "หลักสูตร",
        options: [
          {
            label: "ปกติ",
            value: Courses.REG.toString(),
            count: props.data.filter((x) => x.course === Courses.REG).length,
          },
          {
            label: "นานาชาติ",
            value: Courses.INT.toString(),
            count: props.data.filter((x) => x.course === Courses.INT).length,
          },
          {
            label: "วิทยาศาสตร์ข้อมูลสุขภาพ",
            value: Courses.HDS.toString(),
            count: props.data.filter((x) => x.course === Courses.HDS).length,
          },
          {
            label: "พื้นที่การศึกษาราชบุรี",
            value: Courses.RC.toString(),
            count: props.data.filter((x) => x.course === Courses.RC).length,
          },
        ],
      },
    ],
    [props.data]
  )

  const columns: (ColumnDef<YookbeerColumn> & { accessorKey: string })[] = [
    {
      accessorKey: "stdid",
      header: "ID",
      cell: ({ row }) => {
        const shrt = (row.getValue("stdid") as string).substring(7)
        return <div>{shrt}</div>
      },
    },
    {
      accessorKey: "course",
      header: "Course",
      cell: ({ row }) => <div>{COURSE_SHORTHAND[row.getValue("course") as number]}</div>,
    },
    {
      accessorKey: "nameth",
      header: "Name (TH)",
      cell: ({ row }) => {
        const x = (row.getValue("nameth") || "-") as string
        return <div>{x}</div>
      },
    },
    {
      accessorKey: "nameen",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("nameen")}</div>,
    },
    {
      accessorKey: "nickth",
      header: "Nick (TH)",
      cell: ({ row }) => {
        const x = (row.getValue("nickth") || "-") as string
        return <div>{x}</div>
      },
    },
    {
      accessorKey: "nicken",
      header: "Nick",
      cell: ({ row }) => <div>{row.getValue("nicken")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    /* {
              accessorKey: "emailper",
              header: "Email (per)",
              cell: ({ row }) => <div className="lowercase">{row.getValue("emailper")}</div>,
          }, */
    {
      accessorKey: "emailuni",
      header: "Email (uni)",
      cell: ({ row }) => <div className="lowercase">{row.getValue("emailuni")}</div>,
    },
    /* {
              accessorKey: "facebook",
              header: "FB",
              cell: ({ row }) => {
                  const x = (row.getValue("facebook") || "-") as string
                  return (
                      <div>{x}</div>
                  )
              },
          }, */
    /* {
              accessorKey: "lineid",
              header: "LINE",
              cell: ({ row }) => {
                  const x = (row.getValue("lineid") || "-") as string
                  return (
                      <div>{x}</div>
                  )
              },
          }, */
    {
      accessorKey: "instagram",
      header: "IG",
      cell: ({ row }) => {
        const x = (row.getValue("instagram") || "-") as string
        return <div>{x}</div>
      },
    },
    /* {
              accessorKey: "discord",
              header: "Discord",
              cell: ({ row }) => {
                  const x = (row.getValue("discord") || "-") as string
                  return (
                      <div>{x}</div>
                  )
              },
          }, */
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => ActionCell(row, props.isAdmin),
    },
  ]
  return (
    <DataTable
      columns={columns}
      data={props.data}
      filterFields={filterFields}
      initialState={props.initialState}
      rowClickable={true}
      hrefPrefix="std/"
      hrefColumn={
        columns.find(
          (c): c is ColumnDef<YookbeerColumn> & { accessorKey: keyof YookbeerColumn } =>
            c.accessorKey === "stdid"
        ) ?? undefined
      }
      isLoading={false}
    />
  )
}
