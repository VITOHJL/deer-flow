# 🛡️ GrayHunt · 黑灰产情报智能体

> Telegram + Twitter/X 双平台黑灰产情报采集与研判系统。一条对话即可驱动**采集 → 智能清洗 → 沉淀落库 → 情报研判 → 可视化展示**全链路。

基于 [DeerFlow](https://github.com/bytedance/deer-flow) 自定义智能体框架构建，针对抖音 / TikTok / 字节系平台的刷量作弊、账号交易、引流诈骗、工具交易等黑灰产风险做自动化情报作业。

---

## ✨ 核心能力

| 能力 | 说明 |
|---|---|
| **双平台采集** | Telegram（已加入群，零封号风险）+ Twitter/X（经 TikHub API） |
| **多模态提取** | LLM 视觉识别**图片里**的微信/TG/QQ 账号、域名、价目表、二维码（纯文本搜不到的情报） |
| **智能清洗** | 关键词预筛 + LLM 双层过滤，只保留真正的黑灰产情报 |
| **沉淀落库** | SQLite（按数据源分表）+ JSON/CSV，账号实体不脱敏、可溯源 |
| **情报研判** | SQL 聚合（风险分布/Top 高危群/高频引流渠道）+ LLM 研判报告 |
| **可视化** | GrayHunt 交互式 HTML 大屏：按群组聚合、四维筛选、群链接可点、图片缩略图 |
| **低成本** | 关键词预筛省下 90%+ LLM 调用，批量分析 + 按需视觉提取 |

---

## 🚀 快速开始

### 前置依赖

- **Node.js ≥ 22**、**pnpm**、**uv**（Python 包管理）、**nginx**
- macOS：`brew install node@22 pnpm uv nginx`
- 一个支持视觉的大模型（推荐火山方舟 Doubao-Seed-2.0-Lite，需 `supports_vision`）
- 采集 Telegram 需：Telegram API（api_id/api_hash/手机号）+ 本地 socks5 代理
- 采集 Twitter 需：[TikHub](https://tikhub.io) API Key

### 步骤 1 · 安装与配置

```bash
# 1. 生成配置文件
make config                       # 复制 config.example.yaml -> config.yaml

# 2. 在 config.yaml 配置大模型（models 段，填 EP + api_key）
#    在 .env 提供 API key：echo "VOLCENGINE_API_KEY=ark-xxxx" >> .env

# 3. 安装依赖
make check                        # 检查 node/pnpm/uv/nginx
make install                      # 安装前后端依赖
```

### 步骤 2 · 配置情报采集器

编辑 `tg-intel-crawler/config/config.yaml`（由 `config.example.yaml` 复制）：

```yaml
telegram:
  api_id: <你的>                  # https://my.telegram.org 申请
  api_hash: <你的>
  phone: "+86xxxxxxxxxxx"
  proxy: { type: socks5, host: 127.0.0.1, port: 7897 }   # 本地代理
llm:
  api_key: <你的模型key>
  base_url: https://ark.cn-beijing.volces.com/api/v3
  model: <你的 EP>
twitter:
  api_key: <TikHub key>
```

> ⚠️ `config.yaml`、`.env`、`*.session` 含密钥/登录态，已被 `.gitignore` 忽略，不会提交。

### 步骤 3 · 启动服务

```bash
make dev
```

启动后访问 **http://localhost:2026**（Nginx 统一入口；注意不是 :3000）。
首次需注册/登录账号。

---

## 🤖 使用方式：自定义智能体 GrayHunt

项目内置自定义智能体 **`telegram-twitter-gray-hunter`**，绑定三个情报 skill + 图表能力，SOUL 内置全流程与护栏（不编造数据、不脱敏、防封号、用真实路径）。

1. 在 http://localhost:2026 登录 → 进 **Agents** 页面 → 选 `telegram-twitter-gray-hunter`
2. 一条提示词跑通全流程：

```
完成一次完整的黑灰产情报作业：
① Telegram crawl --joined-only --days 30 采集已加入群
② Twitter crawl-twitter --days 7 --vision 采集（开启图片视觉提取）
③ analyst 分析：风险分布、Top高危群、高频引流渠道（不脱敏），出研判报告
④ report-html --embed-images 生成 GrayHunt 可视化页面
全程真实数据严禁编造，实体不脱敏，每步汇报关键统计。
```

> 提示：自定义智能体功能需 `config.yaml` 中 `agents_api.enabled: true`（默认关闭）。

---

## 🛠️ 命令行方式（tg-crawler CLI）

不走 agent 也可直接用底层 CLI：

```bash
cd tg-intel-crawler
export TG_INTEL_CRAWLER_HOME=$(pwd)

# 采集（Telegram 已加入群，最安全，零封号风险）
tg-crawler crawl --joined-only --mode history --days 30

# 采集 Twitter + 图片视觉提取
tg-crawler crawl-twitter --days 7 --vision

# 生成可视化页面（--embed-images 离线自包含，可做项目首页）
tg-crawler report-html --embed-images --output grayhunt.html
```

| 命令 | 作用 | 是否触碰 Telegram |
|---|---|---|
| `crawl --joined-only` | 爬已加入群历史（最安全） | 是（只读，零封号） |
| `crawl-twitter [--vision]` | 爬 Twitter/X，可视觉提取图片 | 否（走 TikHub API） |
| `discover` | 按关键词发现新群（默认只列出） | 是（有 FloodWait 风险） |
| `candidates` | 候选群池治理（stats/verify/approve） | 部分 |
| `report-html` | 生成 GrayHunt 可视化 HTML | 否 |

---

## 📊 可视化大屏 GrayHunt

`report-html` 生成的页面特性：

- 按**来源群组聚合**，同类群组归并
- **四维筛选**：风险等级 / 风险类别 / 来源平台 / 来源群组（按情报数降序）
- 群链接可点（私密群 🔒 标识）、正文 URL 自动转蓝链
- **图片缩略图 + 图中信息(OCR)** 展示
- `--embed-images` 生成完全离线自包含的单文件 HTML

项目根目录的 `grayhunt.html` 即一份生成好的情报大屏快照。

---

## 💰 如何降低 LLM 花销

| 手段 | 效果 |
|---|---|
| **关键词预筛** | 本地关键词粗筛，只有命中的才送 LLM。实测 Telegram 群 2795 条 → 仅 2 条进 LLM（省 99.9%） |
| **批量分析** | 多条消息合并一次调用（batch_size=15），调用次数降一个量级 |
| **多模态按需** | 视觉提取 `--vision` 可关；落库 `(day,id)` 去重，不重复研判 |

---

## 📁 项目结构

```
deer-flow/
├── backend/                    # DeerFlow Agent 后端（FastAPI + LangGraph）
├── frontend/                   # Next.js 前端
├── skills/public/              # Agent 技能
│   ├── threat-intel-collector/ #   采集+清洗+落库
│   ├── threat-intel-curator/   #   候选池治理
│   └── threat-intel-analyst/   #   分析研判 + 可视化
├── tg-intel-crawler/           # 底层情报采集器（CLI: tg-crawler）
│   ├── tg_intel_crawler/       #   采集/过滤/存储/可视化
│   └── output/intel.db         #   情报库（SQLite，gitignore）
├── grayhunt.html               # 情报大屏快照（离线自包含）
├── grayhunt-demo.html          # Demo 演示 PPT
└── grayhunt-teleprompter.html  # Demo 录制提词器
```

---

## 🔒 安全与合规

本项目用于**合法的网络安全研究与平台风控治理**。采集到的账号、联系方式等实体信息用于情报溯源与处置；使用方需对合规使用负责。
