# PRD：Personal AI CRM — Demo v0.1

**目标**：一个能 WOW 到朋友的 demo，验证核心价值  
**技术栈**：Next.js 14 (App Router) + Supabase + Tailwind CSS + Claude API（via 云雾）  
**部署**：Vercel  

---

## 核心功能（4个）

### F1：联系人管理
- 添加联系人：姓名、认识场景、关系标签（投资人/创业者/客户/朋友）、备注
- 联系人列表，显示头像首字母、关系标签、最后联系时间
- 点击进入联系人详情页

### F2：动态抓取
- 联系人详情页有「刷新动态」按钮
- 调用 Brave Search API 搜索「姓名 + 公司」的最新新闻
- AI 总结成 1-2 句「最近动态摘要」
- 存入数据库，显示抓取时间

### F3：AI 关系建议
- 联系人详情页有「AI 给建议」按钮
- 输入：联系人信息 + 最近动态 + 最后联系时间 + 备注
- 输出：「现在联系的理由」+ 「建议开场白」（1-3句话）

### F4：跟进提醒列表
- 首页/Dashboard 显示「需要跟进」列表
- 规则：超过30天未联系 → 显示为需跟进
- 每条显示：姓名、距上次联系天数、AI 推荐开场白（懒加载）

---

## 数据库 Schema（Supabase）

```sql
-- 联系人表
create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  title text,
  relationship_type text, -- investor/founder/client/friend/other
  met_context text,        -- 认识场景
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 动态摘要表
create table contact_updates (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  raw_results jsonb,       -- Brave Search 原始结果
  summary text,            -- AI 总结
  fetched_at timestamptz default now()
);

-- AI 建议表
create table ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  reason text,             -- 现在联系的理由
  opener text,             -- 建议开场白
  created_at timestamptz default now()
);
```

---

## API Routes（Next.js）

- `POST /api/contacts` — 创建联系人
- `GET /api/contacts` — 获取所有联系人
- `GET /api/contacts/[id]` — 获取单个联系人（含最新动态+建议）
- `PUT /api/contacts/[id]` — 更新联系人
- `POST /api/contacts/[id]/fetch-updates` — 触发动态抓取
- `POST /api/contacts/[id]/ai-suggest` — 生成 AI 建议
- `GET /api/dashboard` — 获取需要跟进的联系人列表

---

## 环境变量（从 .env 读取）

```
NEXT_PUBLIC_SUPABASE_URL=https://riffxnyfwifnsalbkmhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from .env>
SUPABASE_SERVICE_ROLE_KEY=<from .env>
YUNWU_API_KEY=<from .env>          # Claude API via 云雾
YUNWU_BASE_URL=https://yunwu.ai/v1
BRAVE_SEARCH_API_KEY=<from .env>   # 动态抓取用
```

---

## 页面结构

```
/                    → Dashboard（需跟进列表 + 全部联系人）
/contacts/new        → 添加联系人表单
/contacts/[id]       → 联系人详情（动态 + AI 建议）
```

---

## UI 风格

- 简洁现代，以白色/浅灰为主，卡片式布局
- 移动端友好（demo 时可能用手机展示）
- 关系标签用色块区分：投资人（蓝）/ 创业者（紫）/ 客户（绿）/ 朋友（橙）
- 字体：Inter

---

## 验收标准

- [ ] 能添加一个联系人（姓名+场景+标签+备注）
- [ ] 点「刷新动态」能看到 AI 总结的最近新闻
- [ ] 点「AI 建议」能看到开场白建议
- [ ] Dashboard 能看到超30天未联系的人
- [ ] 页面在手机浏览器上不变形
- [ ] 所有 API key 只在服务端使用，不暴露前端

---

## 不在范围内

- 用户登录/多用户（demo 阶段单用户）
- 消息直接发送功能
- LinkedIn 爬取
- 移动端 App
