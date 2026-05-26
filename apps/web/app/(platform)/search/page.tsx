import { SearchView } from "@/components/search/SearchView";

export const metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div>
      <header className="mb-5 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-white">
          <span className="text-gradient">Search</span>
        </h1>
        <p className="mt-2 text-lilac/70">Find people, posts, and Pveels.</p>
      </header>
      <SearchView />
    </div>
  );
}
