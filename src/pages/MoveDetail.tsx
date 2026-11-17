import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Move, Species } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, PokeSprite, SectionCard, StatBar, TypeBadge, TypeRow } from "../components/ui";

interface Learner {
  name: string;
  slug: string;
  types: string[];
  sprite: string;
}

export default function MoveDetail() {
  const { slug = "" } = useParams();
  const { data } = useData<Move[]>("moves");
  const { data: species } = useData<Species[]>("species");
  const { data: learnerMap } = useData<Record<string, string[]>>("learners");

  const move = data?.find((m) => m.slug === slug);

  const learners = useMemo<Learner[] | null>(() => {
    const list = learnerMap?.[slug];
    if (!list || !species) return null;
    const bySlug = new Map(species.map((s) => [s.slug, s]));
    return list.flatMap((sl) => {
      const s = bySlug.get(sl);
      return s ? [{ name: s.name, slug: s.slug, types: s.types, sprite: s.sprite }] : [];
    });
  }, [learnerMap, species, slug]);

  if (!data) return <div className="page"><Loading lines={5} /></div>;
  if (!move) return <div className="page"><Empty>没有这个招式</Empty></div>;

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "招式", to: "/moves" }, { label: move.name }]} />

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{move.name}</h1>
            <div className="text-sm faint">{move.nameEn}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <TypeBadge type={move.type} />
              <span className="chip !py-0.5 !text-[11px] !cursor-default">{move.category}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              ["威力", move.power || "—"],
              ["命中", move.accuracy || "—"],
              ["PP", move.pp],
              ["优先度", move.priority > 0 ? `+${move.priority}` : move.priority],
            ].map(([k, v]) => (
              <div key={k as string} className="min-w-[54px] rounded-lg px-2 py-1.5" style={{ background: "var(--surface-2)" }}>
                <div className="text-[10px] faint">{k}</div>
                <div className="text-lg font-bold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        </div>
        {move.description && <p className="mt-4 text-sm leading-7 muted">{move.description}</p>}
      </div>

      <SectionCard title={`可学会的宝可梦${learners ? `（${learners.length}）` : ""}`} className="mt-4">
        {!learners && <Loading lines={4} />}
        {learners && learners.length === 0 && <Empty>暂无学习数据</Empty>}
        {learners && learners.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {learners.map((l) => (
              <Link key={l.slug} to={`/pokedex/${l.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]">
                <PokeSprite src={l.sprite} alt={l.name} size={34} />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{l.name}</div>
                  <div className="text-[10px] faint">{l.types.join(" / ")}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
