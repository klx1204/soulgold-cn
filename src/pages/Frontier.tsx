import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../lib/data";
import type { FrontierSet } from "../lib/types";
import { Empty, Loading, PokeSprite, TypeBadge, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

const STAT_LABEL = ["HP", "攻", "防", "特攻", "特防", "速"];

export default function Frontier() {
  const { data } = useData<FrontierSet[]>("frontier");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const grouped = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, FrontierSet[]>();
    for (const s of data) {
      if (query && !`${s.species.toLowerCase()}|${s.speciesEn.toLowerCase()}|${s.ability.toLowerCase()}|${s.item.toLowerCase()}|${s.moves.join("").toLowerCase()}`.includes(query)) continue;
      const key = s.speciesEn;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [data, query]);

  return (
    <div className="page">
      <PageHeader
        title="开拓区"
        subtitle={data ? `共 ${data.length} 套配置，按宝可梦分组。点击展开招式与努力值。` : "加载中…"}
      />
      <div className="card p-3">
        <input className="input" placeholder="搜索宝可梦、道具、招式：暴雪王 / 讲究围巾 / 暴风雪" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-2 text-right text-xs faint">{grouped.length} 种宝可梦</div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && grouped.length === 0 && <Empty />}
        <div className="grid gap-2 lg:grid-cols-2">
          {grouped.map(([en, sets]) => {
            const head = sets[0];
            const expanded = open === en;
            return (
              <div key={en} className="card overflow-hidden">
                <button
                  className="flex w-full items-center gap-3 p-3 text-left"
                  onClick={() => setOpen(expanded ? null : en)}
                >
                  <PokeSprite src={head.sprite} alt={head.species} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/pokedex/${head.slug}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                        {head.species}
                      </Link>
                      <div className="flex gap-1">{head.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
                    </div>
                    <div className="text-[11px] faint">{head.speciesEn} · {sets.length} 套配置</div>
                  </div>
                  <span className="text-xs faint">{expanded ? "收起" : "展开"}</span>
                </button>
                {expanded && (
                  <div className="space-y-2 border-t px-3 pb-3 pt-2" style={{ borderColor: "var(--line)" }}>
                    {sets.map((s) => (
                      <div key={s.key} className="rounded-lg p-2" style={{ background: "var(--surface-2)" }}>
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          <span className="chip !py-0.5 !cursor-default">{s.nature}</span>
                          <span className="chip !py-0.5 !cursor-default">{s.ability}</span>
                          {s.item && <span className="chip !py-0.5 !cursor-default">{s.item}</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1 text-xs">
                          {s.moves.map((m, i) => <span key={i}>{m}{i < s.moves.length - 1 ? " / " : ""}</span>)}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] faint tabular-nums">
                          {s.evs.map((v, i) => v > 0 && <span key={i}>{STAT_LABEL[i]}+{v}</span>)}
                          {s.ivs.every((v) => v === 31) && <span>个体值全 31</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
