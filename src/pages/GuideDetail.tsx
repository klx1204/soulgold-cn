import { Link, useParams } from "react-router-dom";
import { useData } from "../lib/data";
import type { Guide } from "../lib/types";
import { Breadcrumb } from "../components/Layout";
import { Empty, Loading, Markdown } from "../components/ui";

export default function GuideDetail() {
  const { slug = "" } = useParams();
  const { data } = useData<Guide[]>("guides");
  const guide = data?.find((g) => g.slug === slug);

  if (!data) return <div className="page"><Loading lines={6} /></div>;
  if (!guide) return <div className="page"><Empty>没有这篇指南</Empty></div>;

  return (
    <div className="page">
      <Breadcrumb items={[{ label: "指南", to: "/guides" }, { label: guide.title }]} />
      <article className="card p-5 md:p-7">
        <h1 className="text-2xl font-extrabold">{guide.title}</h1>
        <p className="mt-1 text-sm faint">{guide.summary}</p>
        <div className="divider" />
        <Markdown content={guide.content} />
      </article>
      <div className="mt-4 text-center">
        <Link to="/guides" className="btn">返回指南列表</Link>
      </div>
    </div>
  );
}
