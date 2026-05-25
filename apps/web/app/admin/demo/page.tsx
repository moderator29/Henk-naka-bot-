import { getDemoCounts } from "@/lib/admin/queries";
import { DemoControl } from "@/components/admin/DemoControl";

export const metadata = { title: "Demo data · Admin" };

export default async function AdminDemoPage() {
  const counts = await getDemoCounts();
  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Demo data</h1>
        <p className="text-sm text-lilac/60 mt-1">
          The platform ships with no demo content and auto-purges on first real
          signup. Use this to verify nothing is seeded, or to purge on demand.
        </p>
      </header>
      <DemoControl counts={counts} />
    </div>
  );
}
