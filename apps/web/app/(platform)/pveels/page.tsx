import { PveelsFeed, type Pveel } from "@/components/pveels/PveelsFeed";
import { demoEnabled } from "@/lib/demo/data";

export const metadata = { title: "Pveels" };

/**
 * Pveels, the vertical short-video surface. Real video clips wire to Supabase
 * Storage / Mux later (post-MVP per RPD §8). For now it renders a labeled demo
 * reel set so the experience is fully navigable.
 */
const DEMO_PVEELS: Pveel[] = [
  {
    id: "pv-1",
    creatorUsername: "spiral",
    creatorName: "Spiral",
    verified: true,
    caption: "Light bending in real time. Full piece drops Friday for subscribers.",
    track: "Spiral, Original Sound",
    likes: 18400,
    comments: 932,
    tips: 1240,
    accent: ["#FF1F8F", "#B847FF"],
  },
  {
    id: "pv-2",
    creatorUsername: "nova",
    creatorName: "Nova",
    verified: false,
    caption: "3am soundscape. Headphones on, lights off.",
    track: "Nova, Midnight Loop",
    likes: 9120,
    comments: 410,
    tips: 560,
    accent: ["#5DD6FF", "#B847FF"],
  },
  {
    id: "pv-3",
    creatorUsername: "aurora",
    creatorName: "Aurora",
    verified: true,
    caption: "Six creators you should know this week. Tap my profile for the list.",
    track: "Aurora, Curated",
    likes: 24500,
    comments: 1320,
    tips: 2100,
    accent: ["#B847FF", "#E9D5FF"],
  },
  {
    id: "pv-4",
    creatorUsername: "tim",
    creatorName: "Tim",
    verified: true,
    caption: "Behind the scenes: wiring the Concierge live. It builds a feed from one sentence.",
    track: "Tim, Build Log",
    likes: 7300,
    comments: 288,
    tips: 430,
    accent: ["#FF1F8F", "#5DD6FF"],
  },
];

export default function PveelsPage() {
  const pveels = demoEnabled() ? DEMO_PVEELS : [];

  if (pveels.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          <span className="text-gradient">Pveels</span>
        </h1>
        <p className="text-lilac/60">
          Short videos from creators land here. Check back soon.
        </p>
      </div>
    );
  }

  return <PveelsFeed pveels={pveels} />;
}
