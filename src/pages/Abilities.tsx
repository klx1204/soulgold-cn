import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { Ability } from "../lib/types";
import { Empty, Loading, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

export default function Abilities() {
  const { data } = useData<Ability[]>("abilities");
  const [q, setQ] = useState("");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter((a) =>
      `${a.name.toLowerCase()}|${a.nameEn.toLowerCase()}|${a.py ?? ""}|${a.pyi ?? ""}`.includes(query)
    );
  }, [data, query]);

  return (
    <div className="page">
      <PageHeader title="特性" subtitle={data ? `共 ${data.length} 个特性` : "加载中…"} />
      <div className="card p-3">
        <input className="input" placeholder="搜索特性：茂盛 / overgrow / ms" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-2 text-right text-xs faint">显示 {rows.length} 条</div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <Link key={a.slug} to={`/abilities/${a.slug}`} className="card p-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{a.name}</span>
                <span className="text-[11px] faint">{a.nameEn}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs muted leading-relaxed">{a.description || "—"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
