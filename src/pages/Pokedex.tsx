import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useData } from "../lib/data";
import type { Species } from "../lib/types";
import { Empty, Loading, TypeBadge, useDebounced } from "../components/ui";
import { PageHeader as Header } from "../components/Layout";

const TYPES = ["一般", "火", "水", "草", "电", "冰", "格斗", "毒", "地面", "飞行", "超能力", "虫", "岩石", "幽灵", "龙", "恶", "钢", "妖精"];

export default function Pokedex() {
  const { data, error } = useData<Species[]>("species");
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [sort, setSort] = useState<"dex" | "name" | "bst">("dex");
  const [typeMode, setTypeMode] = useState<"all" | "any">("all");
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    const baseOnly = false;
    const filtered = data.filter((s) => {
      if (baseOnly && s.isForm) return false;
      if (types.length) {
        const hit = typeMode === "all" ? types.every((t) => s.types.includes(t)) : types.some((t) => s.types.includes(t));
        if (!hit) return false;
      }
      if (!query) return true;
      const hay = `${s.name.toLowerCase()}|${s.nameEn.toLowerCase()}|${s.py ?? ""}|${s.pyi ?? ""}|${s.dex ?? ""}`;
      return hay.includes(query);
    });
    const sorted = [...filtered];
    if (sort === "dex")
      sorted.sort(
        (a, b) =>
          (a.dex ?? 9999) - (b.dex ?? 9999) ||
          Number(a.isForm) - Number(b.isForm) ||
          a.name.localeCompare(b.name)
      );
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    if (sort === "bst") sorted.sort((a, b) => b.bst - a.bst);
    return sorted;
  }, [data, query, types, sort, typeMode]);

  const toggleType = (t: string) => {
    setTypes((old) => {
      if (old.includes(t)) return old.filter((x) => x !== t);
      if (old.length >= 2) return [old[1], t];
      return [...old, t];
    });
  };

  return (
    <div className="page">
      <Header
        title="宝可梦图鉴"
        subtitle={data ? `共 ${data.length} 条记录，支持双属性筛选与中/英/拼音搜索` : "加载中…"}
      />

      <div className="card p-3">
        <input
          className="input"
          placeholder="搜索名称、英文名或拼音，例如：妙蛙 / bulbasaur / mwzz"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs faint">属性筛选</span>
          {TYPES.map((t) => (
            <button
              key={t}
              className="chip !py-1 !px-2.5 !text-xs"
              data-active={types.includes(t)}
              onClick={() => toggleType(t)}
            >
              {t}
              {types.includes(t) && <span className="faint">#{types.indexOf(t) + 1}</span>}
            </button>
          ))}
          {types.length > 1 && (
            <button className="btn !py-1 !text-xs" onClick={() => setTypeMode(typeMode === "all" ? "any" : "all")}>
              {typeMode === "all" ? "同时具备" : "任一属性"}
            </button>
          )}
          {types.length > 0 && (
            <button className="btn !py-1 !text-xs" onClick={() => setTypes([])}>
              <X size={12} /> 清除
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="faint">排序</span>
          {([["dex", "图鉴编号"], ["name", "名称"], ["bst", "种族值"]] as const).map(([k, label]) => (
            <button key={k} className="chip !py-1 !text-xs" data-active={sort === k} onClick={() => setSort(k)}>
              {label}
            </button>
          ))}
          <span className="ml-auto faint">显示 {rows.length} 条</span>
        </div>
      </div>

      <div className="mt-4">
        {error && <Empty>{error}</Empty>}
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="grid-cards">
          {rows.map((s) => (
            <Link
              key={s.slug}
              to={`/pokedex/${s.slug}`}
              className="card group p-2.5 transition-transform hover:-translate-y-0.5"
              style={{ contentVisibility: "auto", containIntrinsicSize: "150px" }}
            >
              <div className="flex items-center justify-between text-[11px] faint">
                <span className="tabular-nums">#{String(s.dex ?? "—").padStart(4, "0")}</span>
                {s.isForm && <span className="rounded bg-[var(--surface-2)] px-1">形态</span>}
              </div>
              <div className="flex justify-center py-1">
                <img
                  src={`${import.meta.env.BASE_URL}${s.sprite}`}
                  alt={s.name}
                  loading="lazy"
                  className="h-[76px] w-[76px] object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <div className="truncate text-center text-sm font-medium">{s.name}</div>
              <div className="truncate text-center text-[10px] faint">{s.nameEn}</div>
              <div className="mt-1 flex justify-center gap-1">
                {s.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
