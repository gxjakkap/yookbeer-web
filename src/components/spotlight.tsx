"use client"
import { redirect, RedirectType } from "next/navigation"
import { isMacOs } from "react-device-detect"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDebounce } from "use-debounce"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "./ui/command"
import { nSearch } from "@/app/(authorized)/actions"
import { CommandLoading } from "cmdk"
import { thirtyeight } from "@/db/schema"
import { courseName } from "@/lib/const"

type SearchResult = typeof thirtyeight.$inferSelect

export function Spotlight() {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [focusIndex, setFocusIndex] = useState<number | null>(null)

    const resultRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.code === "KeyK") && (isMacOs ? e.metaKey : e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const performSearch = useCallback(async (term: string) => {
        if (term.trim() === '') {
            setResults([])
            return
        }
        setIsLoading(true)
        try {
            const data = await nSearch(term)
            setResults(data)
        } 
        catch (error) {
            console.error('Search error:', error)
            setResults([])
        } 
        finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        performSearch(debouncedSearchTerm)
    }, [debouncedSearchTerm, performSearch])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return

        if (e.key === "Tab") {
            e.preventDefault()
            setFocusIndex((prevIndex) => {
                if (prevIndex === null) return 0
                const nextIndex = e.shiftKey
                    ? (prevIndex - 1 + results.length) % results.length
                    : (prevIndex + 1) % results.length

                setTimeout(() => {
                    resultRefs.current[nextIndex]?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    })
                }, 0)
                return nextIndex
            })
        }

        if (e.key === "Enter" && focusIndex !== null) {
            const selectedResult = results[focusIndex]
            if (selectedResult) {
                setOpen(false)
                redirect(`/std/${selectedResult.stdid}`, RedirectType.push)
            }
        }

        if (e.key === "ArrowDown" && focusIndex !== null){
            e.preventDefault()
            setFocusIndex((prevIndex) => {
                if (prevIndex === null) return 0
                const nextIndex = (prevIndex + 1) % results.length
                setTimeout(() => {
                    resultRefs.current[nextIndex]?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    })
                }, 0)
                return nextIndex
            })
        }

        if (e.key === "ArrowUp" && focusIndex !== null){
            e.preventDefault()
            setFocusIndex((prevIndex) => {
                if (prevIndex === null) return 0
                const nextIndex = (prevIndex - 1 + results.length) % results.length
                setTimeout(() => {
                    resultRefs.current[nextIndex]?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                    })
                }, 0)
                return nextIndex
            })
        }
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search students..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                onKeyDown={handleKeyDown}
            />
            <CommandList>
                {isLoading && <CommandLoading>Searching...</CommandLoading>}
                {!isLoading && results.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                {results.map((r, i) => (
                    <div
                        key={r.stdid}
                        className={`flex flex-col pl-10 p-2 rounded ${
                            focusIndex === i ? "bg-gray-200" : ""
                        }`}
                        ref={(el) => {
                            resultRefs.current[i] = el
                        }}
                        onClick={() => {
                            setOpen(false)
                            redirect(`/std/${r.stdid}`, RedirectType.push)
                        }}
                        tabIndex={-1}
                    >
                        <span className="font-medium">{r.nameen}</span>
                        <span className="text-sm text-muted-foreground">{r.nicken}: {courseName[r.course]}</span>
                    </div>
                ))}
            </CommandList>
        </CommandDialog>
    )
}