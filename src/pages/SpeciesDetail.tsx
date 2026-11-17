import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { BASE, asset, loadData, useData } from "../lib/data";
import type { Move, Species } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, PokeSprite, SectionCard, StatBar, TypeBadge, TypeRow } from "../components/ui";

const STAT_LABEL: Record<string, string> = {
  hp: "HP", atk: "攻击", def: "防御", spa: "特攻", spd: "特防", spe: "速度",
};

// attacking type -> { defending type: multiplier }
const EFF: Record<string, Record<string, number>> = {
  一般: { 岩石: 0.5, 幽灵: 0, 钢: 0.5 },
  格斗: { 一般: 2, 岩石: 2, 钢: 2, 冰: 2, 恶: 2, 飞行: 0.5, 毒: 0.5, 虫: 0.5, 超能力: 0.5, 妖精: 0.5, 幽灵: 0 },
  飞行: { 格斗: 2, 虫: 2, 草: 2, 岩石: 0.5, 钢: 0.5, 电: 0.5 },
  毒: { 草: 2, 妖精: 2, 毒: 0.5, 地面: 0.5, 岩石: 0.5, 幽灵: 0.5, 钢: 0 },
  地面: { 毒: 2, 岩石: 2, 钢: 2, 火: 2, 电: 2, 虫: 0.5, 草: 0.5, 飞行: 0 },
  岩石: { 飞行: 2, 虫: 2, 火: 2, 冰: 2, 格斗: 0.5, 地面: 0.5, 钢: 0.5 },
  虫: { 草: 2, 超能力: 2, 恶: 2, 格斗: 0.5, 飞行: 0.5, 毒: 0.5, 幽灵: 0.5, 钢: 0.5, 火: 0.5, 妖精: 0.5 },
  幽灵: { 幽灵: 2, 超能力: 2, 恶: 0.5, 一般: 0 },
  钢: { 岩石: 2, 冰: 2, 妖精: 2, 钢: 0.5, 火: 0.5, 水: 0.5, 电: 0.5 },
  火: { 虫: 2, 钢: 2, 草: 2, 冰: 2, 岩石: 0.5, 火: 0.5, 水: 0.5, 龙: 0.5 },
  水: { 地面: 2, 岩石: 2, 火: 2, 水: 0.5, 草: 0.5, 龙: 0.5 },
  草: { 地面: 2, 岩石: 2, 水: 2, 飞行: 0.5, 毒: 0.5, 虫: 0.5, 钢: 0.5, 火: 0.5, 草: 0.5, 龙: 0.5 },
  电: { 飞行: 2, 水: 2, 草: 0.5, 电: 0.5, 龙: 0.5, 地面: 0 },
  超能力: { 格斗: 2, 毒: 2, 钢: 0.5, 超能力: 0.5, 恶: 0 },
  冰: { 飞行: 2, 地面: 2, 草: 2, 龙: 2, 钢: 0.5, 火: 0.5, 水: 0.5, 冰: 0.5 },
  龙: { 龙: 2, 钢: 0.5, 妖精: 0 },
  恶: { 幽灵: 2, 超能力: 2, 格斗: 0.5, 恶: 0.5, 妖精: 0.5 },
  妖精: { 格斗: 2, 龙: 2, 恶: 2, 毒: 0.5, 钢: 0.5, 火: 0.5 },
};

interface LearnMove extends Move {
  kind: string;
  level?: number | null;
}

type LearnItem = string | { slug: string; level: number | null };
type LearnMap = Record<string, Record<string, LearnItem[]>>;

function effectiveness(types: string[]) {
  const result: Record<string, number> = {};
  for (const atk of Object.keys(EFF)) {
    let mult = 1;
    for (const def of types) mult *= EFF[atk]?.[def] ?? 1;
    if (mult !== 1) result[atk] = mult;
  }
  return result;
}

export default function SpeciesDetail() {
  const { slug = "" } = useParams();
  const { data } = useData<Species[]>("species");
  const { data: moves } = useData<Move[]>("moves");
  const { data: learnMap } = useData<LearnMap>("species-moves");
  const [filter, setFilter] = useState<string>("升级");

  const species = data?.find((s) => s.slug === slug);

  useEffect(() => {
    setFilter("升级");
  }, [slug]);

  const learn = useMemo<LearnMove[] | null>(() => {
    const groups = learnMap?.[slug];
    if (!groups || !moves) return null;
    const bySlug = new Map(moves.map((m) => [m.slug, m]));
    const rows: LearnMove[] = [];
    for (const [kind, list] of Object.entries(groups)) {
      for (const item of list) {
        const ms = typeof item === "string" ? item : item.slug;
        const level = typeof item === "string" ? null : item.level;
        const m = bySlug.get(ms);
        if (m) rows.push({ ...m, kind, level });
      }
    }
    rows.sort((a, b) => {
      if (a.kind !== b.kind) return 0;
      if (a.kind === "升级") {
        const la = a.level ?? 999;
        const lb = b.level ?? 999;
        if (la !== lb) return la - lb;
      }
      return a.name.localeCompare(b.name, "zh");
    });
    return rows;
  }, [learnMap, moves, slug]);

  const forms = useMemo(
    () => (data && species ? data.filter((s) => s.dex === species.dex && s.dex != null) : []),
    [data, species]
  );

  const learned = useMemo(() => {
    if (!learn) return [];
    if (filter === "全部") return learn;
    return learn.filter((m) => m.kind === filter);
  }, [learn, filter]);

  const learnCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of learn ?? []) counts[m.kind] = (counts[m.kind] ?? 0) + 1;
    return counts;
  }, [learn]);

  if (!data) {
    return (
      <div className="page">
        <Loading lines={6} />
      </div>
    );
  }
  if (!species) return <div className="page"><Empty>没有这个宝可梦</Empty></div>;

  const eff = effectiveness(species.types);
  const weak = Object.entries(eff).filter(([, v]) => v > 1);
  const resist = Object.entries(eff).filter(([, v]) => v < 1 && v > 0);
  const immune = Object.entries(eff).filter(([, v]) => v === 0);
  const stats = Object.entries(species.stats);
  const maxStat = Math.max(255, ...stats.map(([, v]) => v));

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "图鉴", to: "/pokedex" }, { label: species.name }]} />

      <div className="card overflow-hidden">
        <div
          className="relative p-4 md:p-6"
          style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--surface)) 0%, var(--surface) 60%)" }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl p-2" style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface-2))" }}>
              <PokeSprite src={species.sprite} alt={species.name} size={120} />
            </div>
            <div className="min-w-[180px] flex-1">
              <div className="text-xs faint tabular-nums">
                {species.dex ? `全国图鉴 #${String(species.dex).padStart(4, "0")}` : "形态"}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-wide md:text-3xl">{species.name}</h1>
              <div className="text-sm faint">{species.nameEn}</div>
              <div className="mt-2"><TypeRow types={species.types} /></div>
              {species.category && <div className="mt-2 text-xs muted">{species.category}</div>}
            </div>
            <div className="text-right">
              <div className="text-[11px] faint">种族值总和</div>
              <div className="text-3xl font-extrabold tabular-nums" style={{ color: "var(--accent)" }}>{species.bst}</div>
            </div>
          </div>
        </div>

        {forms.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2" style={{ borderColor: "var(--line)" }}>
            <span className="text-xs faint">其他形态</span>
            {forms.map((f) => (
              <Link key={f.slug} to={`/pokedex/${f.slug}`} className="chip !py-1 !text-xs" data-active={f.slug === slug}>
                {f.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="种族值">
          <div className="space-y-2">
            {stats.map(([k, v]) => (
              <StatBar key={k} label={STAT_LABEL[k] ?? k} value={v} max={maxStat} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="特性">
          <div className="space-y-2">
            {species.abilities.map((a) => (
              <div key={a.constant} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5" style={{ background: "var(--surface-2)" }}>
                <span className="text-sm">{a.name}</span>
                <span className="text-[11px] faint">{a.hidden ? "隐藏特性" : "普通特性"}</span>
              </div>
            ))}
            {species.innates.length > 0 && (
              <div className="text-xs muted flex items-center gap-1">
                <Sparkles size={12} /> 先天特性：{species.innates.join("、")}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="图鉴说明">
          {species.description ? (
            <p className="text-sm leading-7 muted">{species.description}</p>
          ) : (
            <p className="text-sm faint">暂无图鉴文本。</p>
          )}
        </SectionCard>

        <SectionCard title="属性相克">
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-xs faint">弱点</span>
              {weak.length ? weak.map(([t, v]) => (
                <span key={t} className="flex items-center gap-1">
                  <TypeBadge type={t} /><span className="text-[10px] faint">×{v}</span>
                </span>
              )) : <span className="text-xs faint">无</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-xs faint">抵抗</span>
              {resist.length ? resist.map(([t, v]) => (
                <span key={t} className="flex items-center gap-1">
                  <TypeBadge type={t} /><span className="text-[10px] faint">×{v}</span>
                </span>
              )) : <span className="text-xs faint">无</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-xs faint">免疫</span>
              {immune.length ? immune.map(([t]) => <TypeBadge key={t} type={t} />) : <span className="text-xs faint">无</span>}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="可学会的招式" className="mt-4" right={
        <div className="flex flex-wrap gap-1">
          {["升级", "技能机", "教学", "遗传", "全部"].map((k) => (
            <button key={k} className="chip !py-0.5 !px-2 !text-[11px]" data-active={filter === k} onClick={() => setFilter(k)}>
              {k}
              <span className="faint">
                {k === "全部" ? (learn ? learn.length : 0) : (learnCounts[k] ?? 0)}
              </span>
            </button>
          ))}
        </div>
      }>
        {!learn && <Loading lines={3} />}
        {learn && learned.length === 0 && <Empty>暂无招式数据</Empty>}
        {learn && learned.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs faint">
                  <th className="py-1.5 pr-2 font-normal">招式</th>
                  <th className="py-1.5 pr-2 font-normal text-right">等级</th>
                  <th className="py-1.5 pr-2 font-normal">属性</th>
                  <th className="hidden sm:table-cell py-1.5 pr-2 font-normal">分类</th>
                  <th className="py-1.5 pr-2 font-normal text-right">威力</th>
                  <th className="hidden sm:table-cell py-1.5 pr-2 font-normal text-right">命中</th>
                  <th className="hidden sm:table-cell py-1.5 pr-2 font-normal text-right">PP</th>
                  <th className="hidden sm:table-cell py-1.5 font-normal">方式</th>
                </tr>
              </thead>
              <tbody>
                {learned.map((m) => (
                  <tr key={`${m.slug}-${m.kind}`} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                    <td className="py-1.5 pr-2">
                      <Link to={`/moves/${m.slug}`} className="hover:underline" style={{ color: "var(--accent)" }}>{m.name}</Link>
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums text-xs faint">
                      {m.kind === "升级" ? (m.level === 0 ? "进化" : (m.level ?? "—")) : "—"}
                    </td>
                    <td className="py-1.5 pr-2"><TypeBadge type={m.type} /></td>
                    <td className="hidden sm:table-cell py-1.5 pr-2 text-xs muted">{m.category}</td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">{m.power || "—"}</td>
                    <td className="hidden sm:table-cell py-1.5 pr-2 text-right tabular-nums">{m.accuracy || "—"}</td>
                    <td className="hidden sm:table-cell py-1.5 pr-2 text-right tabular-nums">{m.pp}</td>
                    <td className="hidden sm:table-cell py-1.5 text-xs faint">{m.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
