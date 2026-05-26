import { redirect } from "next/navigation";
import { getMyRole, isAdminRole } from "@/lib/auth/roles";
import { getLegalDoc } from "@/lib/legal/queries";
import { LEGAL_SLUGS } from "@/lib/legal/content";
import { LegalEditor, type EditableLegalDoc } from "@/components/admin/LegalEditor";

export const metadata = { title: "Legal · Admin" };

export default async function AdminLegalPage() {
  const role = await getMyRole();
  if (!isAdminRole(role)) redirect("/admin");

  const resolved = await Promise.all(LEGAL_SLUGS.map((s) => getLegalDoc(s)));
  const docs: EditableLegalDoc[] = resolved
    .filter((d): d is NonNullable<typeof d> => !!d)
    .map((d) => ({ slug: d.slug, title: d.title, content: d.content, fromDb: d.fromDb }));

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Legal documents</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Edit the Privacy Policy, Terms of Service, and Disclaimer. Changes
          publish immediately to the public pages.
        </p>
      </header>
      <LegalEditor docs={docs} />
    </div>
  );
}
