"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Plus, Gavel, Tag, BadgeCheck } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn, formatNumber } from "@/lib/utils";
import {
  DEMO_LISTINGS,
  CATEGORIES,
  COLLECTIONS,
  MARKETPLACE_IS_MOCK,
  artGradient,
  type Listing,
  type ListingStatus,
} from "@/lib/marketplace/mock";

type Sort = "popular" | "newest" | "price-asc" | "price-desc";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function NftArt({ seed, title, className }: { seed: number; title: string; className?: string }) {
  return (
    <div
      className={cn("relative w-full aspect-square overflow-hidden", className)}
      style={{ background: artGradient(seed) }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #fff 0%, transparent 40%)" }} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="font-display font-bold text-white/90 text-center leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ fontSize: "clamp(1rem,3vw,1.6rem)" }}>
          {title}
        </span>
      </div>
    </div>
  );
}

export function MarketplaceBrowser() {
  const { push } = useToast();
  const [listings, setListings] = useState<Listing[]>(DEMO_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [collection, setCollection] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Listing | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let r = listings.filter((x) => {
      if (query && !`${x.title} ${x.creatorName} ${x.collection}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (cats.size > 0 && !cats.has(x.category)) return false;
      if (status !== "all" && x.status !== status) return false;
      if (collection !== "all" && x.collection !== collection) return false;
      // 5000 is the slider ceiling = "no cap"; only filter below it.
      if (maxPrice < 5000 && x.priceNsfw > maxPrice) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === "price-asc") return a.priceNsfw - b.priceNsfw;
      if (sort === "price-desc") return b.priceNsfw - a.priceNsfw;
      if (sort === "newest") return b.createdOrder - a.createdOrder;
      return b.popularity - a.popularity;
    });
    return r;
  }, [listings, query, cats, status, collection, maxPrice, sort]);

  const toggleCat = (c: string) =>
    setCats((s) => {
      const n = new Set(s);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });
  const toggleFav = (id: string) =>
    setFavs((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="flex flex-col gap-6">
      {MARKETPLACE_IS_MOCK && (
        <div className="flex items-center gap-2 text-xs text-cyan border border-cyan/30 rounded-xl px-3 py-2">
          <span className="uppercase tracking-wider font-medium">Demo</span>
          <span className="text-lilac/60">
            Sample listings with generated art until NFT contracts are wired
            (<span className="font-mono">PENDING_CONTRACT_ADDRESS</span>). They
            clear on first real signup.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search art, creators, collections"
            className="h-11 w-full rounded-xl bg-plum/60 border border-white/10 pl-9 pr-4 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:border-magenta/50 focus:outline-none"
        >
          <option value="popular">Most popular</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <Button onClick={() => setListOpen(true)} leftIcon={<Plus size={16} />}>
          List your NFT
        </Button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Filters */}
        <aside className="glass edge-light rounded-2xl p-5 flex flex-col gap-5 lg:sticky lg:top-20">
          <FilterGroup label="Category">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-lilac/80 cursor-pointer">
                <input type="checkbox" checked={cats.has(c)} onChange={() => toggleCat(c)} className="h-4 w-4 rounded border-white/20 bg-plum/60 accent-magenta" />
                {c}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup label="Status">
            {(["all", "buy-now", "auction"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm text-lilac/80 cursor-pointer">
                <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} className="h-4 w-4 accent-magenta" />
                {s === "all" ? "All" : s === "buy-now" ? "Buy now" : "Auction"}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup label="Collection">
            <select value={collection} onChange={(e) => setCollection(e.target.value)} className="h-9 w-full rounded-lg bg-plum/60 border border-white/10 px-2 text-sm text-white focus:outline-none">
              <option value="all">All collections</option>
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label={`Max price: ${formatNumber(maxPrice)} $NSFW`}>
            <input type="range" min={100} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-magenta" />
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <Skeleton className="w-full aspect-square" />
                  <div className="p-4 flex flex-col gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass edge-light rounded-2xl text-center py-16">
              <p className="text-lilac/70">No NFTs match these filters.</p>
              <button
                type="button"
                onClick={() => { setQuery(""); setCats(new Set()); setStatus("all"); setCollection("all"); setMaxPrice(5000); }}
                className="mt-3 text-sm text-magenta hover:text-magenta-light"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((x, i) => (
                <ScrollReveal key={x.id} delay={Math.min(i * 0.04, 0.25)}>
                  <article className="group relative glass edge-light rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-[var(--glow-magenta)]">
                    <button type="button" onClick={() => setSelected(x)} className="block w-full text-left">
                      <div className="relative">
                        <NftArt seed={x.seed} title={x.title} />
                        <span className="absolute top-2 left-2 text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-plum/70 text-lilac/90 flex items-center gap-1">
                          {x.status === "auction" ? <Gavel size={10} /> : <Tag size={10} />}
                          {x.status === "auction" ? "Auction" : "Buy now"}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFav(x.id)}
                      aria-label={favs.has(x.id) ? "Remove favorite" : "Add favorite"}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-plum/70 flex items-center justify-center text-lilac/80 hover:text-white"
                    >
                      <Heart size={15} fill={favs.has(x.id) ? "#FF1F8F" : "none"} className={favs.has(x.id) ? "text-magenta" : ""} />
                    </button>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-white truncate">{x.title}</h3>
                      </div>
                      <p className="text-xs text-lilac/50 mt-0.5">@{x.creatorHandle}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-display font-semibold text-white">{formatNumber(x.priceNsfw)} <span className="text-gradient">$NSFW</span></span>
                        <Button size="sm" variant="glass" onClick={() => setSelected(x)}>
                          {x.status === "auction" ? "Bid" : "Buy"}
                        </Button>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <DetailModal listing={selected} onClose={() => setSelected(null)} fav={favs.has(selected.id)} onFav={() => toggleFav(selected.id)} />
      )}
      <ListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        onCreate={(l) => {
          setListings((p) => [l, ...p]);
          push({ tone: "success", title: "Listed", description: `${l.title} is now on the marketplace.` });
        }}
      />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-lilac/50">{label}</span>
      {children}
    </div>
  );
}

function DetailModal({ listing, onClose, fav, onFav }: { listing: Listing; onClose: () => void; fav: boolean; onFav: () => void }) {
  const { push } = useToast();
  const [stage, setStage] = useState<"idle" | "awaiting" | "pending">("idle");
  const busy = stage !== "idle";

  async function buy() {
    setStage("awaiting");
    await wait(700);
    setStage("pending");
    await wait(1400);
    setStage("idle");
    push({ tone: "success", title: listing.status === "auction" ? "Bid placed" : "Purchased", description: `${listing.title} for ${formatNumber(listing.priceNsfw)} $NSFW.` });
    onClose();
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={listing.title} className="w-[calc(100vw-2rem)] max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-5">
          <NftArt seed={listing.seed} title={listing.title} className="rounded-xl" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-lilac/70">
              <span className="h-7 w-7 rounded-full bg-imperial grid place-items-center text-xs font-display text-white">
                {listing.creatorName[0]}
              </span>
              @{listing.creatorHandle}
              <BadgeCheck size={14} className="text-cyan" />
            </div>
            <p className="text-sm text-lilac/70">
              A {listing.category.toLowerCase()} piece from the {listing.collection} collection. Generated preview art shown until on-chain media is wired.
            </p>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-lilac/50">{listing.status === "auction" ? "Current bid" : "Price"}</div>
              <div className="font-display text-2xl font-semibold text-white">{formatNumber(listing.priceNsfw)} <span className="text-gradient">$NSFW</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.traits.map((t) => (
                <span key={t.trait_type} className="text-xs rounded-lg bg-white/5 px-2.5 py-1.5 text-lilac/80">
                  <span className="text-lilac/40">{t.trait_type}: </span>{t.value}
                </span>
              ))}
            </div>
            <div className="text-xs text-lilac/50">
              <div className="uppercase tracking-wider mb-1">History</div>
              <div className="flex flex-col gap-1">
                <span>Minted by @{listing.creatorHandle}</span>
                <span>Listed for {formatNumber(listing.priceNsfw)} $NSFW</span>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <Button onClick={buy} loading={busy} className="flex-1">
                {stage === "awaiting" ? "Confirm in wallet…" : stage === "pending" ? "Processing…" : listing.status === "auction" ? "Place bid" : "Buy now"}
              </Button>
              <button type="button" onClick={onFav} aria-label="Favorite" className="h-11 w-11 rounded-xl glass flex items-center justify-center text-lilac/80 hover:text-white">
                <Heart size={18} fill={fav ? "#FF1F8F" : "none"} className={fav ? "text-magenta" : ""} />
              </button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

function ListModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (l: Listing) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [collection, setCollection] = useState<string>(COLLECTIONS[0]);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ListingStatus>("buy-now");
  const [seed] = useState(() => Math.floor(Math.random() * 999));
  const [busy, setBusy] = useState(false);

  const priceNum = Number(price) || 0;
  const valid = title.trim().length > 0 && priceNum > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    await wait(700);
    await wait(1200);
    onCreate({
      id: `user-nft-${Date.now()}`,
      title: title.trim(),
      creatorHandle: "you",
      creatorName: "You",
      priceNsfw: priceNum,
      category,
      collection,
      status,
      seed,
      popularity: 50,
      createdOrder: 9000 + Date.now() % 100000,
      traits: [
        { trait_type: "Collection", value: collection },
        { trait_type: "Category", value: category },
        { trait_type: "Edition", value: status === "auction" ? "1 of 1" : "Open" },
      ],
      isDemo: true,
    });
    setBusy(false);
    setTitle("");
    setPrice("");
    onClose();
  }

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalContent title="List your NFT" className="w-[calc(100vw-2rem)] max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your piece" />
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-lilac/80">
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-lilac/80">
                Collection
                <select value={collection} onChange={(e) => setCollection(e.target.value)} className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:outline-none">
                  {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <Input label="Price ($NSFW)" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.0" />
            <label className="flex flex-col gap-1.5 text-sm font-medium text-lilac/80">
              Listing type
              <select value={status} onChange={(e) => setStatus(e.target.value as ListingStatus)} className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:outline-none">
                <option value="buy-now">Buy now</option>
                <option value="auction">Auction</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-lilac/50">Preview</span>
            <div className="rounded-xl overflow-hidden glass edge-light">
              <NftArt seed={seed} title={title || "Untitled"} />
              <div className="p-3">
                <div className="font-medium text-white truncate">{title || "Untitled"}</div>
                <div className="text-sm text-white mt-1">{priceNum > 0 ? `${formatNumber(priceNum)} $NSFW` : "Set a price"}</div>
              </div>
            </div>
            <Button onClick={submit} loading={busy} disabled={!valid || busy}>
              {busy ? "Listing…" : "Confirm listing"}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
