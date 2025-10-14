import { getFiltersStateParser } from "@/lib/parsers"
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  filters: getFiltersStateParser().withDefault([]),
})
