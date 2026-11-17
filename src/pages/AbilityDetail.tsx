import { Link, useParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Ability, Species } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, PokeSprite, SectionCard, TypeBadge } from "../components/ui";

export default function AbilityDetail() {
  const { slug = "" } = useParams();
  const { data } = useData<Ability[]>("abilities");
  const { data: species } = useData<Species[]>("species");

  const ability = data?.find((a) => a.slug === slug);
  const users = (species ?? []).filter((s) =>
    [...s.abilities.map((x) => x.constant), ...s.hiddenAbilities].includes(ability?.constant ?? "")
  );

  if (!data) return <div className="page"><Loading lines={5} /></div>;
  if (!ability) return <div className="page"><Empty>没有这个特性</Empty></div>;

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "特性", to: "/abilities" }, { label: ability.name }]} />
      <div className="card p-5">
        <h1 className="text-2xl font-extrabold">{ability.name}</h1>
        <div className="text-sm faint">{ability.nameEn}</div>
        <p className="mt-4 text-sm leading-7 muted">{ability.description || "暂无说明"}</p>
      </div>

      <SectionCard title={`拥有此特性的宝可梦（${users.length}）`} className="mt-4">
        {!species && <Loading lines={3} />}
        {users.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {users.map((s) => (
              <Link key={s.slug} to={`/pokedex/${s.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]">
                <PokeSprite src={s.sprite} alt={s.name} size={34} />
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{s.name}</div>
                  <div className="flex gap-0.5">{s.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
