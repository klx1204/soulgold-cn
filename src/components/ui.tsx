import { marked } from "marked";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BASE, asset } from "../lib/data";

const TYPE_CLASS: Record<string, string> = {
  一般: "normal", 格斗: "fighting", 飞行: "flying", 毒: "poison", 地面: "ground",
  岩石: "rock", 虫: "bug", 幽灵: "ghost", 钢: "steel", 火: "fire", 水: "water",
  草: "grass", 电: "electric", 超能力: "psychic", 冰: "ice", 龙: "dragon",
  恶: "dark", 妖精: "fairy", 星晶: "stellar", 无: "unknown",
};

export function TypeBadge({ type }: { type: string }) {
  return <span className={`type-badge type-${TYPE_CLASS[type] ?? "unknown"}`}>{type}</span>;
}

export function TypeRow({ types }: { types: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {types.filter(Boolean).map((t) => (
        <TypeBadge key={t} type={t} />
      ))}
    </div>
  );
}

export function StatBar({ label, value, max = 255 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color =
    value >= 130 ? "var(--accent)" : value >= 90 ? "#8fce9f" : value >= 60 ? "#7fa6d8" : "#c98b7a";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 shrink-0 faint">{label}</span>
      <span className="w-8 shrink-0 text-right font-semibold tabular-nums">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function PokeSprite({
  src,
  alt,
  size = 64,
  className = "",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={asset(src)}
      alt={alt}
      loading="lazy"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}

export function SectionCard({
  title,
  children,
  right,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-4 ${className}`}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
            {title}
          </h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Loading({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-10" />
      ))}
    </div>
  );
}

export function Empty({ children = "没有找到匹配内容" }: { children?: React.ReactNode }) {
  return <div className="py-16 text-center text-sm faint">{children}</div>;
}

export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => {
    let raw = marked.parse(content.replace(/\{small\}/g, ""), { async: false, gfm: true }) as string;
    // Relative guide screenshots live under public/guides/images.
    raw = raw.replace(/src="images\//g, `src="${BASE}guides/images/`);
    // Internal absolute links must respect the GitHub Pages base path.
    raw = raw.replace(
      /href="\/(pokedex|items|guides|moves|abilities|encounters|machines|trainers|frontier|search)/g,
      `href="${BASE}$1`
    );
    return raw;
  }, [content]);
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="chip" data-active={!!active} onClick={onClick}>
      {children}
    </button>
  );
}

export function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="hover:underline" style={{ color: "var(--accent)" }}>
      {children}
    </Link>
  );
}

export function useDebounced<T>(value: T, delay = 180): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
