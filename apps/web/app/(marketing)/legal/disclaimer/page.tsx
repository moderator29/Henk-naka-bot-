import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalShell } from "../LegalShell";
import { LegalContent } from "@/components/legal/LegalContent";
import { getLegalDoc } from "@/lib/legal/queries";

export const metadata: Metadata = { title: "Disclaimer" };

export default async function DisclaimerPage() {
  const doc = await getLegalDoc("disclaimer");
  if (!doc) notFound();
  const updated = doc.updatedAt
    ? new Date(doc.updatedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "May 2026";
  return (
    <LegalShell title={doc.title} updated={updated}>
      <LegalContent content={doc.content} />
    </LegalShell>
  );
}
