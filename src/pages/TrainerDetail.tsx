import { Link, useParams, useSearchParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Trainer } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, PokeSprite, SectionCard, TypeBadge } from "../components/ui";

const STAT: [string, string][] = [
  ["hp", "HP"], ["atk", "攻"], ["def", "防"], ["spa", "特攻"], ["spd", "特防"], ["spe", "速"],
];

export default function TrainerDetail() {
  const { constant = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { data } = useData<Trainer[]>("trainers");

  const versions = (data ?? []).filter((x) => x.constant === constant);
  const wanted = params.get("diff");
  const t = versions.find((x) => x.difficultyRaw === wanted) ?? versions[0];

  if (!data) return <div className="page"><Loading lines={5} /></div>;
  if (!t) return <div className="page"><Empty>没有这位训练家</Empty></div>;

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "训练家", to: "/trainers" }, { label: t.name }]} />

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <PokeSprite src={t.sprite} alt={t.name} size={72} />
          <div>
            <h1 className="text-2xl font-extrabold">{t.name}</h1>
            <div className="text-sm faint">{t.nameEn}</div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
              <span className="chip !py-0.5 !cursor-default">{t.difficulty}</span>
              <span className="chip !py-0.5 !cursor-default">平均 Lv.{t.avgLevel}</span>
              <span className="chip !py-0.5 !cursor-default">{t.party.length} 只宝可梦</span>
            </div>
          </div>
        </div>
        {versions.length > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs faint">难度</span>
            {versions.map((v) => (
              <button
                key={v.difficultyRaw}
                className="chip !py-1 !text-xs"
                data-active={v.difficultyRaw === t.difficultyRaw}
                onClick={() => setParams({ diff: v.difficultyRaw })}
              >
                {v.difficulty} · 平均 Lv.{v.avgLevel}
              </button>
            ))}
          </div>
        )}
        {t.locations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.locations.map((l) => (
              <Link key={l.map} to={`/encounters?q=${encodeURIComponent(l.mapZh)}`} className="chip !text-xs">
                {l.mapZh}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {t.party.map((p, i) => (
          <div key={i} className="card p-3">
            <div className="flex flex-wrap items-center gap-3">
              <PokeSprite src={p.sprite} alt={p.species} size={56} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link to={`/pokedex/${p.slug}`} className="font-semibold hover:underline">{p.species}</Link>
                  <span className="text-xs faint">Lv.{p.level}</span>
                </div>
                <div className="mt-0.5 flex gap-1">{p.types.map((x) => <TypeBadge key={x} type={x} />)}</div>
              </div>
              <div className="ml-auto flex flex-wrap gap-1 text-[11px]">
                {p.item && <span className="chip !py-0.5 !cursor-default">道具：{p.item}</span>}
                {p.ability && <span className="chip !py-0.5 !cursor-default">特性：{p.ability}</span>}
                {p.nature && <span className="chip !py-0.5 !cursor-default">性格：{p.nature}</span>}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.moves.map((m, j) => (
                <span key={j} className="rounded-md px-2 py-0.5 text-xs" style={{ background: "var(--surface-2)" }}>{m}</span>
              ))}
            </div>
            {Object.values(p.ivs).some((v) => v > 0) && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] faint">
                {STAT.map(([k, label]) => (
                  <span key={k} className="tabular-nums">{label} IV {p.ivs[k] ?? 0}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
