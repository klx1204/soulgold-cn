import {
  BookOpen,
  Swords,
  Sparkles,
  Backpack,
  Map as MapIcon,
  Disc3,
  Users,
  Trophy,
  ScrollText,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  Home,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

export const NAV = [
  { to: "/pokedex", label: "宝可梦图鉴", short: "图鉴", icon: BookOpen },
  { to: "/moves", label: "招式", short: "招式", icon: Swords },
  { to: "/abilities", label: "特性", short: "特性", icon: Sparkles },
  { to: "/items", label: "道具", short: "道具", icon: Backpack },
  { to: "/encounters", label: "野外遇敌", short: "遇敌", icon: MapIcon },
  { to: "/machines", label: "技能机 / 秘传机", short: "技能机", icon: Disc3 },
  { to: "/trainers", label: "训练家", short: "训练家", icon: Users },
  { to: "/frontier", label: "开拓区", short: "开拓区", icon: Trophy },
  { to: "/guides", label: "指南", short: "指南", icon: ScrollText },
];

const BOTTOM = [NAV[0], NAV[1], NAV[3], NAV[4], NAV[8]];

function ThemeToggle() {
  const [light, setLight] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("light") : false
  );
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    try {
      localStorage.setItem("sg-theme", light ? "light" : "dark");
    } catch {}
  }, [light]);
  return (
    <button
      className="btn !px-2.5"
      onClick={() => setLight((v) => !v)}
      aria-label="切换主题"
      title={light ? "切换到深色" : "切换到浅色"}
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

function SearchForm({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <form
      className={compact ? "w-full min-w-0" : "w-full min-w-0 max-w-md"}
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        if (v) navigate(`/search?q=${encodeURIComponent(v)}`);
      }}
    >
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 faint" />
        <input
          className="input !pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索宝可梦、招式、道具…（中/英/拼音）"
          aria-label="搜索"
        />
      </div>
    </form>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 px-2 py-1">
      <img
        src={`${import.meta.env.BASE_URL}sprites/pokemon/ho_oh.png`}
        alt=""
        className="h-8 w-8 object-contain"
      />
      <div className="leading-tight">
        <div className="text-base font-bold tracking-wide" style={{ color: "var(--accent)" }}>
          魂金图鉴
        </div>
        <div className="text-[11px] faint">Soulgold 中文资料站</div>
      </div>
    </Link>
  );
}

function SideNav() {
  return (
    <nav className="mt-4 flex flex-col gap-1">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              isActive ? "font-semibold" : "muted hover:text-[var(--text)]"
            }`
          }
          style={({ isActive }) =>
            isActive
              ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
              : undefined
          }
        >
          <n.icon size={17} />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        className="relative ml-auto h-full w-[78%] max-w-[320px] overflow-y-auto p-4"
        style={{ background: "var(--bg-soft)", borderLeft: "1px solid var(--line)" }}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button className="btn !px-2" onClick={onClose} aria-label="关闭菜单">
            <X size={16} />
          </button>
        </div>
        <div className="mt-4">
          <SideNav />
        </div>
        <div className="mt-6 text-xs faint">资料以中文为主，保留英文原名。</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawer(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar desktop-only">
        <Logo />
        <SideNav />
        <div className="mt-auto pt-6 text-[11px] faint leading-relaxed">
          <div>数据来源：Soulgold v1.2.1</div>
          <div>非官方中文资料站</div>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <button className="btn !px-2 mobile-only" onClick={() => setDrawer(true)} aria-label="打开菜单">
            <Menu size={18} />
          </button>
          <div className="hidden md:block shrink-0">
            <Link to="/" className="flex items-center gap-1.5 text-sm faint hover:text-[var(--text)]">
              <Home size={15} /> 首页
            </Link>
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <SearchForm />
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {BOTTOM.map((n) => (
          <NavLink key={n.to} to={n.to} data-active={location.pathname.startsWith(n.to)}>
            <n.icon />
            <span>{n.short}</span>
          </NavLink>
        ))}
      </nav>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">{title}</h1>
        {subtitle && <p className="mt-1 text-sm muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1 text-xs faint">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {it.to ? (
            <Link to={it.to} className="hover:text-[var(--accent)]">
              {it.label}
            </Link>
          ) : (
            <span>{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
