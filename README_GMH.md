# 灰黑产挖掘 Agent · GrayMarket Hunter

> 面向「寻找黑灰产」比赛的**全流程自治智能体**。一句话指令，自己完成
> **爬取 → 去重去噪 → 两层团伙挖掘 → 黑话飞轮 → 知识图谱 → 硬核报告**。
> 基于 [DeerFlow](https://github.com/bytedance/deer-flow) SuperAgent 框架。

```
对 Agent 说：「爬一下抖音代充并出团伙报告」
                    ↓
   它自己完成 爬取 → 分析 → 图谱 → 飞轮 → 报告
```

---

## 🎯 核心成果

| 指标 | 数值 | 说明 |
|---|---|---|
| 原始数据 | **138K+** | 375 个文件 |
| 高质量数据 | **71.8K** | 三层漏斗去噪后 |
| 核心团伙 | **514** | 话术模板指纹聚类 |
| 超级团伙 | **20** | union-find 交叉关联 |
| 头号超级团伙 | **18 团 / 579 人** | Dou+ 代投 × 带货权限 · 跨业务联合作案 |
| 关键词 | **446** | 覆盖 20 条字节产品线 |
| 黑话变体 | **89** | 飞轮自动挖掘 |
| 单次全流程成本 | **< $0.30 · < 3 min** | 三层漏斗压缩 LLM 调用 99.8% |

---

## 🧠 核心方法：两层团伙模型

```
第一层：核心团伙   —— 相同话术模板 = 同一团伙的马甲号（sock-puppets）
                      不做 BFS 链式膨胀，每个团伙业务纯净、可审计、可解释
                              ↓ union-find（共享卖家 + 同图 + 同话术）
第二层：超级团伙   —— 把多个表面独立的业务团伙连成「一波人做多业务」的超级网络
```

**头条结论永远是「一波人做多业务」的超级团伙网络** —— 治理应针对超级团伙，而非单个商品链接。

---

## 🔄 黑话飞轮（自我强化闭环）

```
①爬取 → ②去重去噪 → ③两层团伙 → ④黑话挖掘 → ⑤知识图谱 → ⑥治理报告
                                          │
            ⑦命中黑话扩展成新搜索词 ──回灌──→ 回到①
```

4 轮飞轮的增长曲线：

| 轮次 | 原始量 | 核心团伙 | 超级团伙 | 头号团伙 |
|---|---|---|---|---|
| 初始 | 55K | 312 | 11 | 11团/403人 |
| 飞轮 1 | 76K | 314 | 11 | 18团/565人 |
| 飞轮 2 | 87K | 391 | 15 | 18团/571人 |
| **飞轮 3** | **138K** | **514** | **20** | **18团/579人** |

---

## ⚙️ 工程亮点

- **三层漏斗**：75% 数据零 Token 规则层判定，LLM 调用压缩 **99.8%**，成本 < $0.30（逐条 LLM 判定需 $15–30）
- **增量加载**：checkpoint 缓存 83MB，375 文件 → 0–5 新文件，IO 减少 **98%**，秒级加载
- **飞轮自动回流**：`slang_expand --auto-append`，新黑话自动追加词库（备份+去重），无人介入

---

## 📦 目录结构

```
skills/custom/graymarket-hunter/     # 分析 skill
├── SKILL.md
└── scripts/
    ├── data_loader.py        # 增量加载 + checkpoint 缓存
    ├── gang_detect.py        # 两层团伙模型（核心算法）
    ├── slang_expand.py       # 黑话挖掘 + 自动回灌
    ├── relevance_filter.py   # 三层漏斗相关性过滤
    ├── build_viz.py          # D3 力导向知识图谱
    ├── generate_report.py    # 硬核 Markdown 报告生成
    └── llm_client.py         # 火山方舟 Ark 客户端（环境变量读 key）
skills/custom/xianyu-crawler/        # 闲鱼爬虫桥接 skill
agent-assets/graymarket-hunter/      # Agent 配置 + SOUL.md（行为准则）
frontend/public/deck.html            # 🎬 独立单文件 PPT 演示（零依赖，双击即看）
frontend/public/gang-viz.html        # 交互式团伙图谱
frontend/src/app/deck/page.tsx       # /deck 路由版 PPT
frontend/src/components/landing/     # 首页展示组件
```

---

## 🎬 比赛演示

**单文件 PPT，零依赖，双击即看**：`frontend/public/deck.html`（与 `gang-viz.html` 放同目录）

- 12 页：封面 → 痛点 → 全流程方案 → 数据规模 → 两层团伙模型 → 头号团伙 → 飞轮 → 关键词集群 → 工程亮点 → 技术栈 → 数据流 → 收尾
- 操作：`← →` 翻页 / 空格下一页 / 右下角按钮 / 左下角进度点跳转
- 内置 canvas 星空背景、渐变标题动画、数字滚动计数

或运行 DeerFlow 后访问 `/deck`（路由版）。

---

## 🚀 快速开始

```bash
# 1. 配置密钥（复制模板后填入真实 key，.env 已被 .gitignore 忽略）
cp .env.example .env
#   VOLCENGINE_API_KEY=<火山方舟 ApiKey>
#   GMH_LLM_MODEL=<Ark 接入点 ep-...>

# 2. 启动 DeerFlow
make dev

# 3. 在对话里直接对 Agent 说：
#   「爬一下抖音代充并出团伙报告」
```

Agent 会自己跑完爬取（浏览器弹出扫码）→ 分析 → 图谱 → 报告，每次分析结束自动产出结构化 Markdown 报告（团伙总览 / TOP5 超级团伙 / TOP10 核心团伙 / 治理建议 / 技术亮点）。

---

## 🛠️ 技术栈

`DeerFlow SuperAgent` · `Playwright`（闲鱼 MTOP API）· `豆包 / 火山方舟 Ark` ·
`Python`（话术模板指纹 / union-find / N-gram）· `D3.js` · `Next.js + Tailwind`

---

## 🔒 安全说明

- 所有 API key 均通过**环境变量引用**（`$VOLCENGINE_API_KEY`），代码与配置中**无任何明文凭证**
- 真实密钥仅存于 `.env`（已被 `.gitignore` 忽略，不会提交）
- 本仓库资产已脱敏：绝对路径统一为 `${HOME}`，运行产物 / `.venv` / `.jwt_secret` / 缓存均不纳入版本控制
