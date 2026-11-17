import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { NAV } from "../components/Layout";
import { asset, loadData } from "../lib/data";
import type { Species } from "../lib/types";
import { PokeSprite, TypeBadge } from "../components/ui";

const COUNTS_KEY = "home-counts";

export default function Home() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [random, setRandom] = useState<Species[]>([]);

  useEffect(() => {
    Promise.all([
      loadData<Species[]>("species"),
      loadData<unknown[]>("moves"),
      loadData<unknown[]>("abilities"),
      loadData<unknown[]>("items"),
      loadData<unknown[]>("encounters"),
      loadData<unknown[]>("trainers"),
      loadData<unknown[]>("frontier"),
    ]).then(([sp, mv, ab, it, en, tr, fr]) => {
      setCounts({
        宝可梦: sp.length,
        招式: mv.length,
        特性: ab.length,
        道具: it.length,
        遇敌地点: en.length,
        训练家: tr.length,
        开拓区配置: fr.length,
      });
      const pick = [...sp].sort(() => Math.random() - 0.5).slice(0, 8);
      setRandom(pick);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <section className="relative overflow-hidden rounded-2xl border p-6 md:p-10"
        style={{ borderColor: "var(--line)", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 13%, var(--surface)) 0%, var(--surface) 55%)" }}>
        <div className="absolute -right-10 -top-12 opacity-[0.08] select-none pointer-events-none">
          <img src={asset("sprites/pokemon/ho_oh.png")} alt="" width={260} />
        </div>
        <div className="relative">
          <div className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--accent)" }}>
            Pok&eacute;mon Soulgold
          </div>
          <h1 className="mt-2 text-2xl md:text-4xl font-extrabold tracking-wide">
            宝可梦 魂金 · 中文资料站
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base muted leading-relaxed">
            城都与关都的完整图鉴、招式、特性、道具、野外遇敌、技能机、训练家与开拓区数据，
            附带中文攻略指南。资料以官方简体中文为主，保留英文原名与全部游戏内数值。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/pokedex" className="btn !bg-[var(--accent)] !text-[#20180a] !border-transparent font-semibold">
              进入图鉴 <ArrowRight size={15} />
            </Link>
            <Link to="/search" className="btn">
              <Search size={15} /> 搜索资料
            </Link>
            <Link to="/guides" className="btn">攻略指南</Link>
          </div>
        </div>
      </section>

      {counts && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="card px-3 py-2.5 text-center">
              <div className="text-lg font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                {v.toLocaleString()}
              </div>
              <div className="text-[11px] faint">{k}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-7 mb-3 text-sm font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
        浏览
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="card group flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "color-mix(in srgb, var(--accent) 14%, var(--surface-2))", color: "var(--accent)" }}>
              <n.icon size={17} />
            </div>
            <div>
              <div className="text-sm font-semibold">{n.label}</div>
              <div className="text-[11px] faint">{n.to.replace("/", "")}</div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-7 mb-3 text-sm font-semibold tracking-wide" style={{ color: "var(--accent)" }}>
        随便看看
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {random.map((s) => (
          <Link key={s.slug} to={`/pokedex/${s.slug}`} className="card flex flex-col items-center p-2 hover:-translate-y-0.5 transition-transform">
            <PokeSprite src={s.sprite} alt={s.name} size={56} />
            <div className="mt-1 truncate text-[11px] font-medium w-full text-center">{s.name}</div>
            <div className="mt-1"><TypeBadge type={s.types[0]} /></div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] faint leading-relaxed">
        非官方粉丝资料站，数据基于 Soulgold v1.2.1 汉化版 ROM 与官方中文译名。<br />
        宝可梦及相关名称版权归任天堂 / Game Freak / Creatures Inc. 所有。
      </p>
    </div>
  );
}
