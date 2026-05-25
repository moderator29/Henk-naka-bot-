import type { Metadata } from "next";
import { LegalShell } from "../LegalShell";

export const metadata: Metadata = { title: "DMCA & Content Policy" };

export default function DmcaPage() {
  return (
    <LegalShell title="DMCA & Content Policy" updated="May 2026">
      <p>
        We respect intellectual property and take content integrity seriously.
        This page explains how to report infringing or prohibited content and
        how we respond.
      </p>
      <h2>Prohibited content</h2>
      <p>
        Absolutely no content involving minors, non-consensual acts, or anything
        illegal in applicable jurisdictions. Creators must depict only consenting
        adults and must hold the rights to everything they post. We remove
        violations and terminate offending accounts.
      </p>
      <h2>Reporting infringement</h2>
      <p>
        If you believe content infringes your copyright, send a notice including:
        your contact details, identification of the copyrighted work, the URL or
        location of the material, a statement of good-faith belief that the use
        is unauthorized, a statement under penalty of perjury that your notice is
        accurate and you are authorized to act, and your signature.
      </p>
      <h2>How we respond</h2>
      <p>
        Valid notices are actioned promptly: we remove or disable access to the
        material and notify the creator. Repeat infringers are terminated. The
        creator may submit a counter-notice if they believe removal was a
        mistake.
      </p>
      <h2>Reporting other violations</h2>
      <p>
        To report content that violates our policies (not copyright), use the
        in-app report controls or contact support. Reports are reviewed by our
        moderation team.
      </p>
    </LegalShell>
  );
}
