import { SearchView } from "@/components/search/SearchView";

export const metadata = { title: "Search" };

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <SearchView initialQuery={searchParams.q ?? ""} />;
}
