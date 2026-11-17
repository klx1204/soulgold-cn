import { Link, useParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Item } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, SectionCard } from "../components/ui";

export default function ItemDetail() {
  const { slug = "" } = useParams();
  const { data } = useData<Item[]>("items");
  const item = data?.find((i) => i.slug === slug);

  if (!data) return <div className="page"><Loading lines={5} /></div>;
  if (!item) return <div className="page"><Empty>没有这个道具</Empty></div>;

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "道具", to: "/items" }, { label: item.name }]} />
      <div className="card p-5">
        <div className="flex items-center gap-4">
          {item.icon && <img src={`${import.meta.env.BASE_URL}${item.icon}`} alt="" className="h-16 w-16 object-contain" />}
          <div>
            <h1 className="text-2xl font-extrabold">{item.name}</h1>
            <div className="text-sm faint">{item.nameEn}</div>
            <div className="mt-1 flex gap-1.5">
              <span className="chip !py-0.5 !text-[11px] !cursor-default">{item.pocket}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 muted">{item.description || "暂无说明"}</p>
      </div>

      <SectionCard title="获取地点" className="mt-4">
        {item.locations.length === 0 && <p className="text-xs faint">暂无收录的获取地点。</p>}
        {item.locations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.locations.map((l, i) => (
              <Link key={i} to={`/encounters/${l.map.toLowerCase()}`} className="chip !text-xs">
                {l.mapZh || l.map}
                <span className="faint">· {l.source}</span>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
