import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useData } from "../lib/data";
import type { Move } from "../lib/types";
import { Empty, Loading, TypeBadge, useDebounced } from "../components/ui";
import { PageHeader } from "../components/Layout";

const TYPES = ["一般", "火", "水", "草", "电", "冰", "格斗", "毒", "地面", "飞行", "超能力", "虫", "岩石", "幽灵", "龙", "恶", "钢", "妖精"];
const CATS = ["物理", "特殊", "变化"];

export default function Moves() {
  const { data } = useData<Move[]>("moves");
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const query = useDebounced(q.toLowerCase().replace(/\s+/g, ""), 150);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.filter((m) => {
      if (types.length && !types.includes(m.type)) return false;
      if (cats.length && !cats.includes(m.category)) return false;
      if (!query) return true;
      return `${m.name.toLowerCase()}|${m.nameEn.toLowerCase()}|${m.py ?? ""}|${m.pyi ?? ""}`.includes(query);
    });
  }, [data, query, types, cats]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="page">
      <PageHeader title="招式" subtitle={data ? `共 ${data.length} 个招式，支持属性与物理/特殊/变化筛选` : "加载中…"} />

      <div className="card p-3">
        <input className="input" placeholder="搜索招式：十万伏特 / thunderbolt / swft" value={q} onChange={(e) => setQ(e.target.value)} />

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs faint">属性</span>
          {TYPES.map((t) => (
            <button key={t} className="chip !py-1 !px-2.5 !text-xs" data-active={types.includes(t)} onClick={() => toggle(types, setTypes, t)}>{t}</button>
          ))}
          {types.length > 0 && <button className="btn !py-1 !text-xs" onClick={() => setTypes([])}><X size={12} /> 清除</button>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs faint">分类</span>
          {CATS.map((c) => (
            <button key={c} className="chip !py-1 !px-2.5 !text-xs" data-active={cats.includes(c)} onClick={() => toggle(cats, setCats, c)}>{c}</button>
          ))}
          <span className="ml-auto text-xs faint">显示 {rows.length} 条</span>
        </div>
      </div>

      <div className="mt-4">
        {!data && <Loading lines={6} />}
        {data && rows.length === 0 && <Empty />}
        <div className="card overflow-hidden">
          <table className="w-full text-sm hidden sm:table">
            <thead>
              <tr className="text-left text-xs faint">
                <th className="px-3 py-2 font-normal">招式</th>
                <th className="px-3 py-2 font-normal">属性</th>
                <th className="px-3 py-2 font-normal">分类</th>
                <th className="px-3 py-2 font-normal text-right">威力</th>
                <th className="px-3 py-2 font-normal text-right">命中</th>
                <th className="px-3 py-2 font-normal text-right">PP</th>
                <th className="px-3 py-2 font-normal text-right">优先</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.slug} className="border-t hover:bg-[var(--surface-2)]" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="px-3 py-2">
                    <Link to={`/moves/${m.slug}`} className="font-medium hover:underline">{m.name}</Link>
                    <span className="ml-2 text-[11px] faint">{m.nameEn}</span>
                  </td>
                  <td className="px-3 py-2"><TypeBadge type={m.type} /></td>
                  <td className="px-3 py-2 text-xs muted">{m.category}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.power || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.accuracy || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.pp}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.priority || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y sm:hidden" style={{ borderColor: "var(--line-soft)" }}>
            {rows.map((m) => (
              <Link key={m.slug} to={`/moves/${m.slug}`} className="flex items-center gap-3 px-3 py-2.5" style={{ borderColor: "var(--line-soft)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{m.name}</span>
                    <TypeBadge type={m.type} />
                  </div>
                  <div className="text-[11px] faint">{m.nameEn}</div>
                </div>
                <div className="text-right text-[11px] faint tabular-nums">
                  <div>{m.category}</div>
                  <div>威力 {m.power || "—"} · PP {m.pp}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
