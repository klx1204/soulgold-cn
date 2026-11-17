import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Encounter } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, PokeSprite, SectionCard, TypeBadge } from "../components/ui";

export default function EncounterDetail() {
  const { map = "" } = useParams();
  const { data } = useData<Encounter[]>("encounters");
  const [variant, setVariant] = useState(0);

  const enc = data?.find((e) => e.map.toLowerCase() === map.toLowerCase());
  if (!data) return <div className="page"><Loading lines={5} /></div>;
  if (!enc) return <div className="page"><Empty>没有这个地点</Empty></div>;

  const v = enc.variants[variant] ?? enc.variants[0];

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "遇敌", to: "/encounters" }, { label: enc.nameZh }]} />

      <div className="card p-5">
        <h1 className="text-2xl font-extrabold">{enc.nameZh}</h1>
        <div className="text-sm faint">{enc.name}</div>
        {enc.variants.length > 1 && (
          <div className="mt-3 flex gap-1.5">
            {enc.variants.map((v2, i) => (
              <button key={v2.time} className="chip !py-1 !text-xs" data-active={i === variant} onClick={() => setVariant(i)}>
                {v2.timeZh}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {v?.methods.map((m) => (
          <SectionCard key={m.key} title={m.method}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs faint">
                    <th className="py-1.5 pr-2 font-normal">宝可梦</th>
                    <th className="py-1.5 pr-2 font-normal">属性</th>
                    <th className="py-1.5 pr-2 font-normal text-right">等级</th>
                    <th className="py-1.5 pr-2 font-normal text-right">概率</th>
                  </tr>
                </thead>
                <tbody>
                  {m.mons.map((p, i) => (
                    <tr key={`${p.constant}-${i}`} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                      <td className="py-1.5 pr-2">
                        <Link to={`/pokedex/${p.slug}`} className="flex items-center gap-2 hover:underline">
                          <PokeSprite src={p.sprite} alt={p.name} size={30} />
                          <span>{p.name}</span>
                        </Link>
                      </td>
                      <td className="py-1.5 pr-2">
                        <div className="flex gap-1">{p.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums">
                        {p.minLevel === p.maxLevel ? p.minLevel : `${p.minLevel}–${p.maxLevel}`}
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums">{p.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
