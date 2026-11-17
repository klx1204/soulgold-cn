import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Droplets, Fish, MapPin, Mountain, Sprout } from "lucide-react";
import { useData } from "../lib/data";
import type { Encounter } from "../lib/types";
import { Empty, Loading, PokeSprite, TypeBadge, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

const METHOD_META: Record<string, { label: string; icon: typeof Sprout; className: string }> = {
  land_mons: { label: "草丛", icon: Sprout, className: "text-[#8fce9f]" },
  water_mons: { label: "冲浪", icon: Droplets, className: "text-[#7fa6d8]" },
  fishing_mons: { label: "钓鱼", icon: Fish, className: "text-[#e4c07a]" },
  rock_smash_mons: { label: "碎岩", icon: Mountain, className: "text-[#c9a27a]" },
};

export default function Encounters() {
  const { data } = useData<Encounter[]>("encounters");
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    if (!query) return data;
    return data.filter((e) => {
      if (`${e.nameZh.toLowerCase()}|${e.name.toLowerCase()}|${e.py ?? ""}|${e.pyi ?? ""}`.includes(query)) return true;
      // also match by contained species
      return e.variants.some((v) => v.methods.some((m) => m.mons.some((p) => p.name.toLowerCase().includes(query) || (p.nameEn ?? "").toLowerCase().includes(query))));
    });
  }, [data, query]);

  return (
    <div className="page">
      <PageHeader title="野外遇敌" subtitle={data ? `共 ${data.length} 个地点，含时段与钓竿/冲浪/碎岩分布` : "加载中…"} />
      <div className="card p-3">
        <input
          className="input"
          placeholder="搜索地点或宝可梦：29号道路 / 波波 / route 29"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value) setParams({ q: e.target.value }); else setParams({});
          }}
        />
        <div className="mt-2 text-right text-xs faint">{rows.length} 个地点</div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((e) => {
            const speciesSet = new Set<string>();
            const methods = new Set<string>();
            e.variants.forEach((v) =>
              v.methods.forEach((m) => {
                methods.add(m.key);
                m.mons.forEach((p) => speciesSet.add(p.slug ?? p.name));
              })
            );
            const preview = e.variants[0]?.methods.find((m) => m.key === "land_mons")?.mons.slice(0, 6) ??
              e.variants[0]?.methods[0]?.mons.slice(0, 6) ?? [];
            return (
              <Link key={e.map} to={`/encounters/${e.map.toLowerCase()}`} className="card p-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} style={{ color: "var(--accent)" }} />
                  <span className="font-semibold">{e.nameZh}</span>
                  <span className="ml-auto text-[11px] faint">{speciesSet.size} 种</span>
                </div>
                <div className="text-[11px] faint">{e.name}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {[...methods].map((key) => {
                    const meta = METHOD_META[key];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <span key={key} className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px]" style={{ background: "var(--surface-2)" }}>
                        <Icon size={11} className={meta.className} />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {preview.map((p) => (
                    <span key={p.constant} className="flex items-center gap-0.5 rounded px-1" style={{ background: "var(--surface-2)" }}>
                      <PokeSprite src={p.sprite} alt={p.name} size={26} />
                      <span className="text-[10px]">{p.name}</span>
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
