import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { Trainer } from "../lib/types";
import { Empty, Loading, PokeSprite, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

export default function Trainers() {
  const { data } = useData<Trainer[]>("trainers");
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("全部");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.filter((t) => {
      if (diff !== "全部" && t.difficulty !== diff) return false;
      if (!query) return true;
      const locs = t.locations.map((l) => `${l.mapZh}${l.map}`).join("|").toLowerCase();
      return `${t.name.toLowerCase()}|${t.constant.toLowerCase()}|${(t.py ?? "")}|${(t.pyi ?? "")}|${locs}`.includes(query);
    });
  }, [data, diff, query]);

  return (
    <div className="page">
      <PageHeader title="训练家" subtitle={data ? `共 ${data.length} 位训练家，含队伍配置` : "加载中…"} />
      <div className="card p-3">
        <input className="input" placeholder="搜索训练家或地点：Crystal / 若叶镇 / 29号道路" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["全部", "普通", "困难"].map((d) => (
            <button key={d} className="chip !py-1 !px-2.5 !text-xs" data-active={diff === d} onClick={() => setDiff(d)}>{d}</button>
          ))}
          <span className="ml-auto self-center text-xs faint">{rows.length} 条</span>
        </div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <Link key={t.constant} to={`/trainers/${t.constant}`} className="card p-3 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <PokeSprite src={t.sprite} alt={t.name} size={44} />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{t.name}</div>
                  <div className="text-[11px] faint">
                    {t.difficulty} · 平均 Lv.{t.avgLevel} · {t.party.length} 只
                  </div>
                </div>
              </div>
              {t.locations.length > 0 && (
                <div className="mt-1.5 line-clamp-1 text-[11px] muted">{t.locations.map((l) => l.mapZh).join("、")}</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
