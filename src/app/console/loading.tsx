import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrbsBackground } from "@/components/OrbsBackground";
import Link from "next/link";

export default function ConsoleLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        <OrbsBackground />
        <div className="relative z-10 px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-40 bg-[var(--card)] rounded animate-pulse font-mono" aria-hidden />
              <div className="h-4 w-36 bg-[var(--bg-muted)] rounded animate-pulse" aria-hidden />
            </div>

            {/* Agent Console table scaffold */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden font-mono text-sm">
              <div className="max-h-[60vh] overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[220px]">agent_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">handle</th>
                      <th className="px-4 py-2 font-normal w-[80px]">verified</th>
                      <th className="px-4 py-2 font-normal w-[180px]">timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-2"><span className="block h-4 w-32 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-24 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-20 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-8 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-28 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="mt-10 mb-2 text-lg font-semibold text-[var(--fg)] font-mono">
              _Acknowledgements_Console
            </h2>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden font-mono text-sm">
              <div className="max-h-[40vh] overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
                    <tr className="text-[var(--fg-subtle)] text-left">
                      <th className="px-4 py-2 font-normal w-[50%]">ship_id</th>
                      <th className="px-4 py-2 font-normal w-[140px]">from</th>
                      <th className="px-4 py-2 font-normal w-[140px]">to</th>
                      <th className="px-4 py-2 font-normal w-[60px]">emoji</th>
                      <th className="px-4 py-2 font-normal w-[180px]">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-2"><span className="block h-4 w-28 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-16 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-16 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-6 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                        <td className="px-4 py-2"><span className="block h-4 w-24 bg-[var(--bg-muted)] rounded" aria-hidden /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-xs text-[var(--fg-subtle)]">
              <Link href="/docs#for-agents" className="text-[var(--teal)] hover:underline">
                For agents
              </Link>
              {" · "}
              <Link href="/ships" className="text-[var(--teal)] hover:underline">
                Ships
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
