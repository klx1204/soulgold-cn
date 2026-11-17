# 魂金图鉴 · Soulgold 中文资料站

宝可梦 **魂金（Soulgold）** 的非官方中文资料站，部署于 GitHub Pages：

**https://klx1204.github.io/soulgold-cn/**

## 内容

| 板块 | 说明 |
| --- | --- |
| 宝可梦图鉴 | 959 条记录，双属性筛选、中/英/拼音搜索、种族值、特性、属性相克、可学招式 |
| 招式 | 848 个招式，属性 + 物理/特殊/变化筛选 |
| 特性 | 531 个特性，含拥有者反查 |
| 道具 | 236 件道具，按物品分类筛选，含获取地点 |
| 野外遇敌 | 132 个地点，时段、陆地/冲浪/钓鱼/碎岩分布 |
| 技能机 / 秘传机 | 110 个 TM/HM，含获取地点 |
| 训练家 | 441 位训练家，队伍、招式、道具、性格、个体值 |
| 开拓区 | 2708 套对战配置，按宝可梦分组 |
| 指南 | 8 篇中文指南（FAQ、传说位置、隐藏洞窟、闪光、超级进化、奖杯、赠礼、BUG 报告） |

## 数据来源

- **游戏数值**：`Eemeliri/soulgold` 的 `docs/data`（英文原始数据）。
- **中文名称与说明**：从 `宝可梦 魂金 v1.2.1 汉化版` ROM 中提取（招式、特性、道具、训练家、地图名），与官方简体中文译名核对。
- **图鉴文字**：`pokemon-dataset-zh`（官方简中图鉴描述）。
- **图片**：Soulgold 游戏内像素图。

## 技术栈

Vite + React 19 + TypeScript + Tailwind CSS 4，纯静态输出。搜索索引在构建期生成（含拼音全拼与首字母），客户端过滤。

## 本地开发

```sh
npm install
npm run dev        # http://localhost:5173/soulgold-cn/
npm run build      # 输出到 dist/
```

## 重新生成数据

数据由 Python 脚本从本地素材生成，需要以下目录：

- `../soulgold`（Soulgold 仓库）
- `../pokemon-dataset-zh`
- `../pokeemerald-expansion`（中文 charmap）
- `tools/rom/rom_zh.json`（从汉化 ROM 提取的文本）

```sh
python3 tools/rom/extract.py     # 从 ROM 提取中文文本
python3 scripts/build_data.py    # 生成 public/data
node scripts/gen_search.mjs      # 生成拼音索引
python3 scripts/translate_guides.py  # 生成超级进化页与截图
```

## 部署

推送到 `main` 后，GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）。

## 声明

非官方粉丝作品，与任天堂、Game Freak、Creatures Inc. 无关。宝可梦相关名称与图像版权归其各自所有者。
