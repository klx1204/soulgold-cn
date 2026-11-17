import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { Item } from "../lib/types";
import { Empty, Loading, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

const POCKETS = ["精灵球", "药品", "道具", "树果", "技能机", "战斗道具", "重要物品", "邮件"];

export default function Items() {
  const { data } = useData<Item[]>("items");
  const [q, setQ] = useState("");
  const [pocket, setPocket] = useState<string>("全部");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const pockets = useMemo(() => {
    const set = new Set((data ?? []).map((i) => i.pocket).filter(Boolean));
    return ["全部", ...POCKETS.filter((p) => set.has(p)), ...[...set].filter((p) => !POCKETS.includes(p))];
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.filter((i) => {
      if (pocket !== "全部" && i.pocket !== pocket) return false;
      if (!query) return true;
      return `${i.name.toLowerCase()}|${i.nameEn.toLowerCase()}|${i.py ?? ""}|${i.pyi ?? ""}`.includes(query);
    });
  }, [data, query, pocket]);

  return (
    <div className="page">
      <PageHeader title="道具" subtitle={data ? `共 ${data.length} 件道具，按分类筛选` : "加载中…"} />
      <div className="card p-3">
        <input className="input" placeholder="搜索道具：精灵球 / poke ball / jlq" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pockets.map((p) => (
            <button key={p} className="chip !py-1 !px-2.5 !text-xs" data-active={pocket === p} onClick={() => setPocket(p)}>{p}</button>
          ))}
          <span className="ml-auto self-center text-xs faint">{rows.length} 条</span>
        </div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((it) => (
            <Link key={it.slug} to={`/items/${it.slug}`} className="card flex items-center gap-3 p-2.5 transition-transform hover:-translate-y-0.5">
              {it.icon ? (
                <img src={`${import.meta.env.BASE_URL}${it.icon}`} alt="" width={40} height={40} className="h-10 w-10 object-contain" loading="lazy" />
              ) : (
                <div className="h-10 w-10 rounded-lg" style={{ background: "var(--surface-2)" }} />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{it.name}</span>
                  <span className="shrink-0 text-[10px] faint">{it.pocket}</span>
                </div>
                <div className="truncate text-[11px] faint">{it.nameEn}</div>
                <p className="mt-0.5 line-clamp-1 text-[11px] muted">{it.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
