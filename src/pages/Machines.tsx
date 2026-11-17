import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { Machine } from "../lib/types";
import { Empty, Loading, TypeBadge, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

export default function Machines() {
  const { data } = useData<Machine[]>("machines");
  const [kind, setKind] = useState<"全部" | "TM" | "HM">("全部");
  const [q, setQ] = useState("");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.filter((m) => {
      if (kind !== "全部" && m.kind !== kind) return false;
      if (!query) return true;
      return `${m.name.toLowerCase()}|${m.moveName.toLowerCase()}|${m.label.toLowerCase()}|${m.py ?? ""}|${m.pyi ?? ""}`.includes(query);
    });
  }, [data, kind, query]);

  return (
    <div className="page">
      <PageHeader title="技能机 / 秘传机" subtitle={data ? `共 ${data.length} 个技能机` : "加载中…"} />
      <div className="card p-3">
        <input className="input" placeholder="搜索招式或编号：十万伏特 / TM24" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["全部", "TM", "HM"] as const).map((k) => (
            <button key={k} className="chip !py-1 !px-2.5 !text-xs" data-active={kind === k} onClick={() => setKind(k)}>
              {k === "全部" ? "全部" : k === "TM" ? "技能机（TM）" : "秘传机（HM）"}
            </button>
          ))}
          <span className="ml-auto self-center text-xs faint">{rows.length} 条</span>
        </div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <div key={m.slug} className="card p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold" style={{ color: "var(--accent)" }}>{m.label}</span>
                <span className="text-[11px] faint">{m.kind}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Link to={`/moves/${m.moveSlug}`} className="font-medium hover:underline">{m.moveName}</Link>
                <TypeBadge type={m.type} />
              </div>
              <div className="mt-1 text-[11px] faint">
                {m.category} · 威力 {m.power || "—"} · 命中 {m.accuracy || "—"} · PP {m.pp}
              </div>
              {m.locations.length > 0 && (
                <div className="mt-1 line-clamp-1 text-[11px] muted">
                  获取：{m.locations.map((l) => l.mapZh || l.map).join("、")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
