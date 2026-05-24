"use client";

import { motion } from "framer-motion";

interface Milestone {
  year: string;
  title: string;
  body: string;
}

const milestones: Milestone[] = [
  {
    year: "2021",
    title: "Launch",
    body: "$NSFW launches on Polygon. A community forms around a brand most teams were too scared to touch.",
  },
  {
    year: "2022",
    title: "Pleasurely opens",
    body: "The first creator surface ships. Subscriptions, tips, and gated content powered by the token.",
  },
  {
    year: "2023",
    title: "PleasureNifty",
    body: "The NFT layer arrives. Creators mint, fans collect, the ecosystem widens.",
  },
  {
    year: "2024",
    title: "Pleasureland",
    body: "The metaverse surface goes live. An interactive world for creators and holders.",
  },
  {
    year: "2026",
    title: "The unified platform ships",
    body: "One platform, one wallet, one home. AI-native. The bar resets.",
  },
];

export function Journey() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            The <span className="text-gradient">journey</span>
          </h2>
          <p className="mt-4 text-lg text-lilac/70">
            How we got here, and where we&apos;re going next.
          </p>
        </motion.div>

        <ol className="mt-16 relative">
          <span
            aria-hidden="true"
            className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-magenta via-orchid to-cyan opacity-40"
          />
          {milestones.map((m, i) => (
            <motion.li
              key={m.year}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative pl-20 pb-12 last:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute left-4 top-1 h-7 w-7 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center"
              >
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
              <div className="text-xs uppercase tracking-wider font-mono text-cyan">
                {m.year}
              </div>
              <h3 className="mt-1 font-display text-2xl font-semibold text-white">
                {m.title}
              </h3>
              <p className="mt-2 text-lilac/70 max-w-xl">{m.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
