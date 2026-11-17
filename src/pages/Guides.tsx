import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { Guide } from "../lib/types";
import { Empty, Loading } from "../components/ui";
import { PageHeader } from "../components/Layout";

export default function Guides() {
  const { data } = useData<Guide[]>("guides");
  const groups = new Map<string, Guide[]>();
  for (const g of data ?? []) {
    if (!groups.has(g.category)) groups.set(g.category, []);
    groups.get(g.category)!.push(g);
  }

  return (
    <div className="page">
      <PageHeader title="指南" subtitle="攻略、机制说明与实用资料" />
      {!data && <Loading lines={5} />}
      {data && data.length === 0 && <Empty />}
      <div className="space-y-6">
        {[...groups.entries()].map(([cat, list]) => {
          const catZh = cat === "Information" ? "信息" : cat === "Guide" ? "攻略" : cat === "Unlocks" ? "解锁内容" : cat;
          return (
            <section key={cat}>
              <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>{catZh}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.sort((a, b) => a.order - b.order).map((g) => (
                  <Link key={g.slug} to={`/guides/${g.slug}`} className="card p-4 transition-transform hover:-translate-y-0.5">
                    <div className="font-semibold">{g.title}</div>
                    <p className="mt-1 line-clamp-2 text-xs muted">{g.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
