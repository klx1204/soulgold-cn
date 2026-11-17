import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { loadData } from "../lib/data";
import { Empty, Loading } from "../components/ui";
import { PageHeader } from "../components/Layout";

interface Entry {
  t: string;
  s: string;
  n: string;
  e: string;
  py: string;
  pyi: string;
}

const TYPE_ORDER = ["宝可梦", "招式", "特性", "道具", "技能机", "遇敌", "训练家", "指南"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    loadData<Entry[]>("search").then(setIndex).catch(() => setIndex([]));
  }, []);

  const query = q.trim().toLowerCase().replace(/\s+/g, "");

  const groups = useMemo(() => {
    if (!index) return [];
    if (!query) return [];
    const hit = index.filter((e) => {
      const zh = e.n.toLowerCase();
      const en = e.e.toLowerCase();
      return zh.includes(query) || en.includes(query) || e.py.includes(query) || e.pyi.includes(query) || e.s.toLowerCase().includes(query);
    });
    // rank: exact > prefix > contains
    const score = (e: Entry) => {
      const zh = e.n.toLowerCase();
      if (zh === query) return 0;
      if (zh.startsWith(query)) return 1;
      if (e.py.startsWith(query) || e.pyi.startsWith(query)) return 2;
      if (e.e.toLowerCase().startsWith(query)) return 3;
      return 4;
    };
    hit.sort((a, b) => score(a) - score(b) || a.n.length - b.n.length);
    const map = new Map<string, Entry[]>();
    for (const e of hit) {
      if (!map.has(e.t)) map.set(e.t, []);
      map.get(e.t)!.push(e);
    }
    return TYPE_ORDER.filter((t) => map.has(t)).map((t) => [t, map.get(t)!] as const);
  }, [index, query]);

  return (
    <div className="page">
      <PageHeader title="搜索" subtitle="支持中文、英文与拼音（全拼 / 首字母）" />
      <form
        className="card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setParams(q ? { q } : {});
        }}
      >
        <input
          autoFocus
          className="input"
          placeholder="例如：妙蛙 / bulbasaur / mwzz / 十万伏特"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setParams(e.target.value ? { q: e.target.value } : {});
          }}
        />
      </form>

      <div className="mt-4 space-y-5">
        {!index && <Loading lines={4} />}
        {index && query && groups.length === 0 && <Empty>没有找到「{q}」</Empty>}
        {index && !query && <Empty>输入关键词开始搜索</Empty>}
        {groups.map(([type, list]) => (
          <section key={type}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{type}</h2>
              <span className="text-xs faint">{list.length}</span>
            </div>
            <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--line)" }}>
              {list.slice(0, 30).map((e) => (
                <Link key={`${e.t}-${e.s}-${e.n}`} to={e.s} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface-2)]">
                  <span className="flex-1 truncate text-sm">{e.n}</span>
                  <span className="truncate text-[11px] faint">{e.e}</span>
                </Link>
              ))}
              {list.length > 30 && <div className="px-3 py-2 text-[11px] faint">还有 {list.length - 30} 条，请输入更精确的关键词</div>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
