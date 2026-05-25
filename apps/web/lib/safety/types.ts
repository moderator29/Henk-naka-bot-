/** Shared safety types + report reasons. Plain module (no "use server"). */

export type ReportTargetType = "post" | "comment" | "user" | "message" | "profile";

export interface ReportReason {
  value: string;
  label: string;
}

/** 18+-platform-appropriate reasons. The first two are zero-tolerance. */
export const REPORT_REASONS: ReportReason[] = [
  { value: "minor", label: "Involves a minor" },
  { value: "nonconsensual", label: "Non-consensual or leaked content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "impersonation", label: "Impersonation" },
  { value: "spam", label: "Spam or scam" },
  { value: "illegal", label: "Illegal content" },
  { value: "other", label: "Something else" },
];
