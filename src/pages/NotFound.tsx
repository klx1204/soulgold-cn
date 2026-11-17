import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page text-center py-24">
      <div className="text-5xl font-extrabold" style={{ color: "var(--accent)" }}>404</div>
      <p className="mt-3 text-sm muted">页面不存在，可能是链接有误。</p>
      <Link to="/" className="btn mt-5 inline-flex">返回首页</Link>
    </div>
  );
}
