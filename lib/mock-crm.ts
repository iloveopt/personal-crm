import type {
  AiSuggestion,
  ChatMessage,
  Contact,
  ContactDetail,
  ContactUpdate,
  IndustryLink,
  NetworkGraph,
  NewsItem,
  RelationshipEdge,
} from '@/lib/types'

type CrmState = {
  schemaVersion: number
  contacts: Contact[]
  updates: ContactUpdate[]
  suggestions: AiSuggestion[]
  chats: ChatMessage[]
  relationships: RelationshipEdge[]
}

type ContactInput = Pick<
  Contact,
  | 'name'
  | 'company'
  | 'title'
  | 'industry'
  | 'location'
  | 'priority'
  | 'tags'
  | 'email'
  | 'relationship_type'
  | 'met_context'
  | 'notes'
>

const STORAGE_KEY = 'personal-crm-demo-state'
const STATE_VERSION = 2
const FOLLOW_UP_DAYS = 30

let serverState: CrmState | null = null

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const NEWS_POOL: Record<string, NewsItem[]> = {
  'contact-elon': [
    { id: 'news-elon-1', title: 'xAI 完成 $60B 融资，估值达 $180B', source: 'Bloomberg', published_at: daysAgo(2), summary: 'Elon Musk 旗下 xAI 完成新一轮融资，由 a16z、Sequoia 领投，将用于扩建 Memphis 数据中心集群并加速 Grok 3 模型训练。', url: '#', topic: 'AI 融资' },
    { id: 'news-elon-2', title: 'Tesla FSD v13 获中国路测许可', source: 'Reuters', published_at: daysAgo(5), summary: 'Tesla 全自动驾驶系统 v13 获得上海和北京路测牌照，计划 Q3 向中国用户推送 Beta 版本。', url: '#', topic: '自动驾驶' },
    { id: 'news-elon-3', title: 'SpaceX Starship 第七次试飞成功回收', source: 'TechCrunch', published_at: daysAgo(9), summary: 'Starship 成功完成轨道试飞并实现助推器精准回收，商业发射窗口预计 2027 年 Q1 开放。', url: '#', topic: '航天' },
  ],
  'contact-sam': [
    { id: 'news-sam-1', title: 'OpenAI 发布 GPT-5，推理能力大幅提升', source: 'The Verge', published_at: daysAgo(3), summary: 'GPT-5 在数学、代码和多步推理上超越前代 40%，企业版同步推出 Agent API 和持久化记忆功能。', url: '#', topic: 'AI 模型' },
    { id: 'news-sam-2', title: 'OpenAI 估值突破 $300B，年化收入 $16B', source: 'WSJ', published_at: daysAgo(7), summary: 'Sam Altman 透露公司已实现月收入超 $1.3B，企业客户数突破 100 万家，正筹备 IPO 架构调整。', url: '#', topic: 'AI 商业化' },
    { id: 'news-sam-3', title: 'Sam Altman 宣布 Stargate 项目一期落地德州', source: 'Bloomberg', published_at: daysAgo(12), summary: '耗资 $100B 的 AI 基础设施项目 Stargate 一期数据中心在德州 Abilene 动工，预计 2027 年投运。', url: '#', topic: 'AI 基础设施' },
  ],
  'contact-jensen': [
    { id: 'news-jensen-1', title: 'NVIDIA 市值突破 $4T，单季营收 $44B', source: 'CNBC', published_at: daysAgo(1), summary: 'Blackwell Ultra 芯片需求持续爆发，数据中心收入占比达 88%。Jensen Huang 表示 AI 推理需求将是训练的 10 倍。', url: '#', topic: 'AI 芯片' },
    { id: 'news-jensen-2', title: 'NVIDIA 推出 Cosmos 世界模型平台', source: 'Wired', published_at: daysAgo(8), summary: '面向机器人和自动驾驶的世界模型生成平台 Cosmos 正式开放，支持物理仿真和场景合成。', url: '#', topic: '具身智能' },
  ],
  'contact-lei-jun': [
    { id: 'news-leijun-1', title: '小米 SU7 Ultra 交付破万，月销超 BBA 同级', source: '36氪', published_at: daysAgo(3), summary: '小米汽车 SU7 Ultra 单月交付突破 1 万台，在 30-50 万价位段超越宝马 3 系和奥迪 A4。', url: '#', topic: '新能源汽车' },
    { id: 'news-lei-jun-2', title: '雷军宣布小米大模型 MiLM 3.0 开源', source: '机器之心', published_at: daysAgo(6), summary: '小米开源 MiLM 3.0（70B 参数），在中文理解和设备端推理上领先，将集成到 MIUI 和车载系统。', url: '#', topic: 'AI 开源' },
    { id: 'news-lei-jun-3', title: '小米集团 2026 Q1 财报：营收破千亿', source: '财新', published_at: daysAgo(10), summary: '小米 Q1 营收 1080 亿元，同比增长 32%。其中汽车业务贡献 210 亿，IoT 平台连接设备数突破 8 亿。', url: '#', topic: '财报' },
  ],
  'contact-zhang-yiming': [
    { id: 'news-yiming-1', title: '字节跳动 Seed 团队发布新一代 MoE 模型', source: '量子位', published_at: daysAgo(4), summary: '字节 Seed 团队开源 Seed-X MoE 模型（万亿参数 16 专家），在代码和数学任务上对标 GPT-5。', url: '#', topic: 'AI 模型' },
    { id: 'news-yiming-2', title: 'TikTok 电商 GMV 突破 $500B', source: 'Financial Times', published_at: daysAgo(8), summary: 'TikTok Shop 全球年化 GMV 达 5000 亿美元，其中东南亚占 40%。直播电商和短视频带货模式快速复制。', url: '#', topic: '电商' },
  ],
  'contact-anna': [
    { id: 'news-anna-1', title: 'Northstar Ventures 领投 AI Agent 初创 $20M A 轮', source: 'PitchBook', published_at: daysAgo(3), summary: 'Anna Zhang 主导投资了一家做企业级 AI Agent 编排的公司，重点看好 Agent 在销售和客服场景的落地。', url: '#', topic: 'AI 投资' },
    { id: 'news-anna-2', title: 'Anna Zhang 在 SOSV Climate Summit 发表主题演讲', source: 'TechNode', published_at: daysAgo(10), summary: '演讲主题为"AI 应用的第二波机会：从 Copilot 到 Autonomous"，强调垂直行业自动化是下一个投资主题。', url: '#', topic: '投资趋势' },
  ],
  'contact-ming': [
    { id: 'news-ming-1', title: 'Orbit AI 获红杉中国种子轮 $5M', source: '36氪', published_at: daysAgo(2), summary: '陈明创办的 Orbit AI 完成种子轮融资，产品定位 AI 驱动的销售线索评分和自动化跟进。', url: '#', topic: '融资' },
    { id: 'news-ming-2', title: 'Orbit AI 产品 Beta 上线，首月 ARR 破百万', source: 'SaaS Daily', published_at: daysAgo(7), summary: '产品上线首月即获得 20+ 付费客户，ARR 突破 100 万元，集中在 B2B SaaS 和教育行业。', url: '#', topic: 'SaaS 增长' },
  ],
  'contact-priya': [
    { id: 'news-priya-1', title: 'HelioStack 推出模型评估 Benchmark-as-a-Service', source: 'VentureBeat', published_at: daysAgo(4), summary: 'Priya Rao 带领团队发布自动化模型评估平台，支持 50+ 评测维度和自定义 benchmark 配置。', url: '#', topic: 'AI 基础设施' },
    { id: 'news-priya-2', title: 'HelioStack 被 Gartner 评为 AI Infra Cool Vendor', source: 'Gartner', published_at: daysAgo(14), summary: '凭借在模型评估和数据管线上的创新，HelioStack 入选 Gartner 2026 年 AI 基础设施 Cool Vendor 名单。', url: '#', topic: 'AI 行业认可' },
  ],
  'contact-lei': [
    { id: 'news-lei-1', title: 'BluePeak Capital 发布 2026 企业软件投资报告', source: '投中网', published_at: daysAgo(5), summary: '王磊团队发布年度报告，看好 AI 原生 ERP、垂直行业 Agent 和中国企业出海 SaaS 三大方向。', url: '#', topic: '投资趋势' },
    { id: 'news-lei-2', title: 'BluePeak 领投企业协作工具 FlowWork B 轮 $30M', source: 'PitchBook', published_at: daysAgo(11), summary: '王磊表示 FlowWork 的 AI 会议纪要和任务自动分派功能解决了国内企业协作的核心痛点。', url: '#', topic: '企业服务投资' },
  ],
  'contact-sarah': [
    { id: 'news-sarah-1', title: 'LatticeWorks 推出 AI 驱动的客户健康评分', source: 'Product Hunt', published_at: daysAgo(3), summary: 'Sarah Lee 主导的新功能上线 Product Hunt 并获 #2 Daily，通过行为数据预测客户流失风险。', url: '#', topic: 'PLG' },
  ],
  'contact-david': [
    { id: 'news-david-1', title: 'Mercury Retail 试点 AI 私域运营，复购率提升 23%', source: 'Retail Asia', published_at: daysAgo(6), summary: 'David Kim 分享试点数据：AI 个性化推荐 + 自动化消息使老客复购率提升 23%，客单价提升 15%。', url: '#', topic: '零售科技' },
  ],
}

function makeNews(contact: Contact): NewsItem[] {
  const poolNews = NEWS_POOL[contact.id]
  if (poolNews) return poolNews

  const company = contact.company || contact.name
  const industry = contact.industry || '企业服务'
  return [
    {
      id: makeId('news'),
      title: `${company} 发布 ${industry} 场景新进展`,
      source: 'Demo News',
      published_at: daysAgo(4),
      summary: `${contact.name} 所在团队最近围绕 ${industry} 的落地效率做了公开分享，重点提到客户验证和商业化节奏。`,
      url: '#',
      topic: industry,
    },
    {
      id: makeId('news'),
      title: `${contact.name} 参与行业闭门交流`,
      source: 'Founder Weekly',
      published_at: daysAgo(10),
      summary: `讨论集中在预算收紧后的增长策略、AI 工具采购标准，以及如何用更小团队完成交付。`,
      url: '#',
      topic: contact.relationship_type === 'investor' ? '投资趋势' : '市场动向',
    },
  ]
}

function createSeedContacts(): Contact[] {
  return [
    {
      id: 'contact-elon',
      name: 'Elon Musk',
      company: 'Tesla / SpaceX / xAI',
      title: 'CEO',
      industry: 'AI & 航天 & 新能源',
      location: 'Austin, Texas',
      priority: 'high',
      tags: ['AI', '自动驾驶', '航天', '新能源', 'Starlink'],
      email: 'elon@x.example',
      relationship_type: 'founder',
      met_context: '在 All-In Summit 简短交流过 AI Agent 方向',
      notes: 'xAI 的 Grok 模型迭代很快，Tesla FSD 在中国落地值得关注。可能通过他的投资人圈子找到合作。',
      last_contacted_at: daysAgo(67),
      created_at: daysAgo(200),
      updated_at: daysAgo(67),
    },
    {
      id: 'contact-sam',
      name: 'Sam Altman',
      company: 'OpenAI',
      title: 'CEO',
      industry: 'AGI 研发',
      location: 'San Francisco',
      priority: 'high',
      tags: ['AGI', 'GPT', 'AI Safety', '超级计算'],
      email: 'sam@openai.example',
      relationship_type: 'founder',
      met_context: 'YC 校友网络，在 SF AI Meetup 聊过 AI 应用层机会',
      notes: 'OpenAI 企业版可能有 partnership 机会。关注 Stargate 项目对算力格局的影响。',
      last_contacted_at: daysAgo(55),
      created_at: daysAgo(180),
      updated_at: daysAgo(55),
    },
    {
      id: 'contact-jensen',
      name: 'Jensen Huang',
      company: 'NVIDIA',
      title: 'CEO & Founder',
      industry: 'AI 芯片 & GPU 计算',
      location: 'Santa Clara',
      priority: 'high',
      tags: ['GPU', 'AI 芯片', '数据中心', 'CUDA', '具身智能'],
      email: 'jensen@nvidia.example',
      relationship_type: 'founder',
      met_context: 'GTC 2025 大会 VIP 晚宴简短交流',
      notes: 'NVIDIA 的 Inception 计划可能对早期 AI 公司有资源支持。Blackwell Ultra 供不应求。',
      last_contacted_at: daysAgo(45),
      created_at: daysAgo(150),
      updated_at: daysAgo(45),
    },
    {
      id: 'contact-lei-jun',
      name: '雷军',
      company: '小米集团',
      title: '创始人 & CEO',
      industry: '消费电子 & 新能源汽车',
      location: 'Beijing',
      priority: 'high',
      tags: ['IoT', '新能源汽车', 'AI 大模型', '生态链', '消费品'],
      email: 'leijun@xiaomi.example',
      relationship_type: 'founder',
      met_context: '通过小米生态链 VP 介绍，在小米科技园短暂见面',
      notes: '小米汽车增长超预期，大模型 MiLM 开源策略值得关注。生态链可能有 AI 硬件合作机会。',
      last_contacted_at: daysAgo(38),
      created_at: daysAgo(120),
      updated_at: daysAgo(38),
    },
    {
      id: 'contact-zhang-yiming',
      name: '张一鸣',
      company: '字节跳动',
      title: '创始人',
      industry: '内容平台 & AI',
      location: 'Singapore',
      priority: 'medium',
      tags: ['推荐算法', 'TikTok', 'AI 大模型', '电商', '全球化'],
      email: 'yiming@bytedance.example',
      relationship_type: 'founder',
      met_context: '通过共同朋友在新加坡晚餐见过一次',
      notes: '字节 Seed 团队 AI 实力很强，TikTok 电商增长惊人。已经半退休但仍影响关键技术方向。',
      last_contacted_at: daysAgo(90),
      created_at: daysAgo(250),
      updated_at: daysAgo(90),
    },
    {
      id: 'contact-anna',
      name: 'Anna Zhang',
      company: 'Northstar Ventures',
      title: 'Partner',
      industry: 'AI 投资',
      location: 'Singapore',
      priority: 'high',
      tags: ['AI 应用', '融资', '出海', 'Agent'],
      email: 'anna@northstar.example',
      relationship_type: 'investor',
      met_context: '在 AI Demo Day 认识，聊过企业服务和出海方向',
      notes: '偏好清晰的增长数据和产品留存指标。最近重仓 AI Agent 赛道，刚投了一个 $20M A 轮。',
      last_contacted_at: daysAgo(42),
      created_at: daysAgo(90),
      updated_at: daysAgo(42),
    },
    {
      id: 'contact-ming',
      name: '陈明',
      company: 'Orbit AI',
      title: 'Founder & CEO',
      industry: 'AI 销售自动化',
      location: 'Shanghai',
      priority: 'high',
      tags: ['SaaS', '销售科技', '种子轮', 'AI Agent'],
      email: 'ming@orbit.example',
      relationship_type: 'founder',
      met_context: '朋友介绍认识，正在做销售自动化产品',
      notes: '刚完成红杉种子轮 $5M。产品 Beta 首月 ARR 破百万，增长势头很好。想找早期设计合伙人。',
      last_contacted_at: daysAgo(8),
      created_at: daysAgo(50),
      updated_at: daysAgo(8),
    },
    {
      id: 'contact-sarah',
      name: 'Sarah Lee',
      company: 'LatticeWorks',
      title: 'Head of Growth',
      industry: 'B2B SaaS',
      location: 'San Francisco',
      priority: 'medium',
      tags: ['增长', '客户成功', 'PLG', 'AI 客户健康评分'],
      email: 'sarah@lattice.example',
      relationship_type: 'client',
      met_context: '线上 workshop 后主动加了微信',
      notes: '关心团队知识库和客户成功流程。最近推出的 AI 客户健康评分产品上了 Product Hunt #2。',
      created_at: daysAgo(21),
      updated_at: daysAgo(21),
    },
    {
      id: 'contact-priya',
      name: 'Priya Rao',
      company: 'HelioStack',
      title: 'VP Product',
      industry: 'AI 基础设施',
      location: 'Bangalore',
      priority: 'medium',
      tags: ['Infra', '模型评估', '数据平台', 'Gartner Cool Vendor'],
      email: 'priya@helio.example',
      relationship_type: 'friend',
      met_context: '在开源社区 meetup 认识，聊过模型评估和数据管线',
      notes: '公司刚被 Gartner 评为 AI Infra Cool Vendor。新推出 Benchmark-as-a-Service 平台。',
      last_contacted_at: daysAgo(33),
      created_at: daysAgo(130),
      updated_at: daysAgo(33),
    },
    {
      id: 'contact-lei',
      name: '王磊',
      company: 'BluePeak Capital',
      title: 'Investment Director',
      industry: '企业服务投资',
      location: 'Beijing',
      priority: 'medium',
      tags: ['企业服务', '投资', 'AI 原生 ERP', '出海 SaaS'],
      email: 'lei@bluepeak.example',
      relationship_type: 'investor',
      met_context: '朋友晚餐局认识，对垂直 SaaS 很熟',
      notes: '最近发布了 2026 企业软件投资报告，看好 AI 原生 ERP 和中国出海 SaaS。领投了 FlowWork B 轮 $30M。',
      last_contacted_at: daysAgo(61),
      created_at: daysAgo(160),
      updated_at: daysAgo(61),
    },
    {
      id: 'contact-david',
      name: 'David Kim',
      company: 'Mercury Retail',
      title: 'GM, Digital',
      industry: '零售科技',
      location: 'Seoul',
      priority: 'low',
      tags: ['零售', 'AI 私域', '复购提升', '试点机会'],
      email: 'david@mercury.example',
      relationship_type: 'client',
      met_context: '客户转介绍，想了解 AI 驱动的私域运营',
      notes: 'AI 私域试点效果好：复购率提升 23%，客单价提升 15%。预算周期在 Q3，适合提前铺垫扩大合作。',
      last_contacted_at: daysAgo(18),
      created_at: daysAgo(40),
      updated_at: daysAgo(18),
    },
  ]
}

function createSeedState(): CrmState {
  const contacts = createSeedContacts()
  const updates: ContactUpdate[] = contacts.slice(0, 5).map((contact, index) => ({
    id: `update-${contact.id}`,
    contact_id: contact.id,
    raw_results: { source: 'mock', query: `${contact.name} ${contact.company}` },
    summary: buildUpdateSummary(contact),
    news: makeNews(contact),
    fetched_at: daysAgo(index + 2),
  }))

  return {
    schemaVersion: STATE_VERSION,
    contacts,
    updates,
    suggestions: [
      {
        id: 'suggestion-elon-1',
        contact_id: 'contact-elon',
        reason: 'xAI 刚完成 $60B 融资，正在快速扩张 AI 应用生态。距离上次联系 67 天，适合用 Grok 生态合作切入。',
        opener: 'Elon，看到 xAI 新一轮融资的消息，非常impressive。我们在 AI Agent 方向有一些产品验证，想了解 Grok 平台未来是否会开放 Agent 生态合作。',
        created_at: daysAgo(1),
      },
      {
        id: 'suggestion-anna-1',
        contact_id: 'contact-anna',
        reason: '她刚投了一个 $20M 的 AI Agent A 轮，说明正在积极看这个方向。距离上次联系 42 天。',
        opener: 'Anna，恭喜最近 AI Agent 那个 deal close！我这边的产品验证也有些新进展，用户留存数据比上次聊时好了不少。想找你请教 20 分钟，看看下一步怎么做 GTM 最有效。',
        created_at: daysAgo(2),
      },
      {
        id: 'suggestion-priya-1',
        contact_id: 'contact-priya',
        reason: '她的公司刚被 Gartner 评为 Cool Vendor，而且新推出的 Benchmark-as-a-Service 和你的产品有互补可能。',
        opener: 'Priya，恭喜 Gartner Cool Vendor！你们的 Benchmark-as-a-Service 看起来正好能解决我们在模型评估上的痛点。想聊聊有没有产品集成的可能。',
        created_at: daysAgo(1),
      },
      {
        id: 'suggestion-lei-jun-1',
        contact_id: 'contact-lei-jun',
        reason: '小米 MiLM 开源 + IoT 8 亿设备，设备端 AI Agent 是你的产品可能的落地场景。',
        opener: '雷总，看到 MiLM 3.0 开源的消息，设备端推理这块确实是刚需。我们在做的 AI 关系管理如果能跑在 MIUI 上可能是个有意思的场景，想找时间请教一下小米 AI 生态的合作模式。',
        created_at: daysAgo(3),
      },
    ],
    chats: [
      {
        id: 'chat-anna-1',
        contact_id: 'contact-anna',
        role: 'user',
        content: '帮我判断现在适不适合联系 Anna。',
        created_at: daysAgo(2),
      },
      {
        id: 'chat-anna-2',
        contact_id: 'contact-anna',
        role: 'assistant',
        content: '适合。她最近关注垂直 AI，而你可以用产品验证进展切入。建议先发一个低压力的请教型消息，不要直接进入融资话题。',
        created_at: daysAgo(2),
      },
    ],
    relationships: [
      {
        id: 'edge-elon-jensen',
        source: 'contact-elon',
        target: 'contact-jensen',
        label: 'GPU 供应链',
        strength: 95,
        reason: 'xAI 是 NVIDIA 最大客户之一，Grok 训练依赖 Blackwell Ultra 集群。Tesla FSD 也大量使用 NVIDIA 芯片。',
      },
      {
        id: 'edge-elon-sam',
        source: 'contact-elon',
        target: 'contact-sam',
        label: 'AGI 竞争',
        strength: 88,
        reason: 'xAI 和 OpenAI 是 AGI 赛道直接竞争对手，但在 AI Safety 话题上有共同关注。',
      },
      {
        id: 'edge-sam-jensen',
        source: 'contact-sam',
        target: 'contact-jensen',
        label: '算力合作',
        strength: 92,
        reason: 'OpenAI 是 NVIDIA GPU 最大采购方之一，Stargate 项目深度依赖 NVIDIA 硬件。',
      },
      {
        id: 'edge-lei-jun-yiming',
        source: 'contact-lei-jun',
        target: 'contact-zhang-yiming',
        label: '中国科技圈',
        strength: 70,
        reason: '两人都是中国顶级科技企业家，在 AI 大模型和全球化方向上有交集。字节和小米在 IoT 内容分发上有合作。',
      },
      {
        id: 'edge-anna-ming',
        source: 'contact-anna',
        target: 'contact-ming',
        label: '投资关注',
        strength: 86,
        reason: 'Anna 刚投了 AI Agent 赛道，陈明的 Orbit AI 完全在她的投资偏好内，有可能跟进下一轮。',
      },
      {
        id: 'edge-ming-sarah',
        source: 'contact-ming',
        target: 'contact-sarah',
        label: '潜在客户',
        strength: 72,
        reason: 'Sarah 负责 B2B 增长，LatticeWorks 可能会试用 Orbit AI 的销售线索评分功能。',
      },
      {
        id: 'edge-anna-lei',
        source: 'contact-anna',
        target: 'contact-lei',
        label: '共同投资主题',
        strength: 64,
        reason: '两人都覆盖企业服务与 AI 应用投资，且都在看 Agent 方向。',
      },
      {
        id: 'edge-priya-ming',
        source: 'contact-priya',
        target: 'contact-ming',
        label: '技术合作',
        strength: 58,
        reason: 'HelioStack 的模型评估平台可以帮助 Orbit AI 优化销售预测模型的准确性。',
      },
      {
        id: 'edge-sarah-david',
        source: 'contact-sarah',
        target: 'contact-david',
        label: '增长运营',
        strength: 51,
        reason: '两人都在做客户增长和运营效率提升，可以交流 AI 驱动的客户生命周期管理经验。',
      },
      {
        id: 'edge-jensen-lei-jun',
        source: 'contact-jensen',
        target: 'contact-lei-jun',
        label: '芯片供应',
        strength: 60,
        reason: '小米自动驾驶和大模型训练需要 NVIDIA GPU，两人在 CES 和 GTC 有过交流。',
      },
      {
        id: 'edge-sam-anna',
        source: 'contact-sam',
        target: 'contact-anna',
        label: 'AI 生态',
        strength: 55,
        reason: 'Anna 投资的 AI Agent 公司很可能基于 OpenAI API 构建，生态上有上下游关系。',
      },
    ],
  }
}

function cloneState(state: CrmState): CrmState {
  return JSON.parse(JSON.stringify(state)) as CrmState
}

function guessContactDefaults(contact: Contact): Contact {
  const lowerCompany = contact.company?.toLowerCase() || ''
  const relationship = contact.relationship_type
  let industry = contact.industry

  if (!industry && relationship === 'investor') industry = '企业服务投资'
  if (!industry && lowerCompany.includes('ai')) industry = 'AI 应用'
  if (!industry) industry = '企业服务'

  return {
    ...contact,
    industry,
    location: contact.location || 'Remote',
    priority: contact.priority || (relationship === 'investor' ? 'high' : 'medium'),
    tags: contact.tags || [industry],
  }
}

function normalizeState(value: unknown): CrmState {
  const seed = createSeedState()

  if (!value || typeof value !== 'object') return seed

  const state = value as Partial<CrmState>
  if (state.schemaVersion !== STATE_VERSION) return seed

  const contacts = Array.isArray(state.contacts) && state.contacts.length > 0
    ? state.contacts.map(guessContactDefaults)
    : seed.contacts

  const contactIds = new Set(contacts.map((contact) => contact.id))
  const updates = Array.isArray(state.updates) && state.updates.length > 0
    ? state.updates
        .filter((update) => contactIds.has(update.contact_id))
        .map((update) => {
          const contact = contacts.find((item) => item.id === update.contact_id)
          return {
            ...update,
            news: update.news || (contact ? makeNews(contact) : []),
          }
        })
    : seed.updates

  return {
    schemaVersion: STATE_VERSION,
    contacts,
    updates,
    suggestions: Array.isArray(state.suggestions) ? state.suggestions : seed.suggestions,
    chats: Array.isArray(state.chats) ? state.chats : seed.chats,
    relationships: Array.isArray(state.relationships) ? state.relationships : seed.relationships,
  }
}

function getInitialState() {
  return createSeedState()
}

function readState(): CrmState {
  if (typeof window === 'undefined') {
    serverState ??= getInitialState()
    return cloneState(serverState)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const initialState = getInitialState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
    return initialState
  }

  try {
    const state = normalizeState(JSON.parse(raw))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return state
  } catch {
    const initialState = getInitialState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
    return initialState
  }
}

function writeState(state: CrmState) {
  if (typeof window === 'undefined') {
    serverState = cloneState(state)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function sortByUpdatedAt(a: Contact, b: Contact) {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
}

function isFollowUpDue(contact: Contact) {
  if (!contact.last_contacted_at) return true

  const daysSinceContact = Math.floor(
    (Date.now() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceContact >= FOLLOW_UP_DAYS
}

function buildUpdateSummary(contact: Contact) {
  const company = contact.company || '当前项目'
  const role = contact.relationship_type || '联系人'
  const industry = contact.industry || '企业服务'

  if (role === 'investor') {
    return `${company} 最近持续关注 ${industry} 机会，${contact.name} 公开提到更看重真实使用频次和客户续费信号。`
  }

  if (role === 'founder') {
    return `${company} 最近在推进新版本发布，${contact.name} 可能正在寻找早期用户反馈和合作资源。`
  }

  if (role === 'client') {
    return `${company} 团队近期在优化增长和客户运营流程，适合用一个具体案例重新开启沟通。`
  }

  return `${contact.name} 最近围绕 ${industry} 有一些新的职业动态，适合用轻量近况同步重新建立联系。`
}

function buildSuggestion(contact: Contact, recentUpdate?: string): Pick<AiSuggestion, 'reason' | 'opener'> {
  const reason = recentUpdate
    ? `可以围绕最近动态切入，沟通会显得自然且有上下文。`
    : `你们已经有一段时间没有互动，适合用近况同步保持关系温度。`

  const opener = recentUpdate
    ? `${contact.name}，看到你们最近关于 ${contact.industry || '行业'} 的动态，感觉和我这边正在做的事情有不少交集。想找你请教一下这个方向的判断，也顺便同步下我最近的进展。`
    : `${contact.name}，最近怎么样？之前聊到的方向我这边有些新进展，想找个时间和你简单同步，也听听你的近况。`

  return { reason, opener }
}

function buildAssistantReply(contact: Contact, prompt: string, recentUpdate?: string) {
  const topic = contact.industry || '你们共同关注的方向'
  const promptHint = prompt.trim() ? `针对你问的「${prompt.trim()}」，` : ''
  const updateContext = recentUpdate ? `可以引用这条近况：「${recentUpdate}」` : '可以先从上次见面的上下文切入'

  return `${promptHint}建议用“具体近况 + 轻量请教 + 明确时间”的结构。${updateContext}。可发送：${contact.name}，最近看到你们在 ${topic} 上有新进展，我这边也在验证一个相关方向。想找你请教 20 分钟，看看我的判断有没有偏差，这周三或周四哪个时间方便？`
}

function getRelatedContacts(state: CrmState, id: string) {
  const relatedIds = new Set(
    state.relationships
      .filter((edge) => edge.source === id || edge.target === id)
      .map((edge) => (edge.source === id ? edge.target : edge.source))
  )

  return state.contacts.filter((contact) => relatedIds.has(contact.id))
}

function buildIndustryLinks(contacts: Contact[]): IndustryLink[] {
  const links: IndustryLink[] = []
  const byIndustry = new Map<string, Contact[]>()

  contacts.forEach((contact) => {
    const industry = contact.industry || '其他'
    byIndustry.set(industry, [...(byIndustry.get(industry) || []), contact])
  })

  const industries = Array.from(byIndustry.keys())
  industries.forEach((industry, index) => {
    const next = industries[index + 1]
    if (!next) return

    links.push({
      source: industry,
      target: next,
      label: index % 2 === 0 ? '客户场景相邻' : '资本与技术互补',
      strength: 44 + index * 8,
    })
  })

  return links
}

export function resetDemoData() {
  const state = getInitialState()
  writeState(state)
  return state
}

export function listContacts() {
  return readState().contacts.sort(sortByUpdatedAt)
}

export function listFollowUps() {
  return readState().contacts.filter(isFollowUpDue).sort((a, b) => {
    const aTime = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0
    const bTime = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0
    return aTime - bTime
  })
}

export function getContactDetail(id: string): ContactDetail | null {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === id)

  if (!contact) return null

  return {
    ...contact,
    updates: state.updates
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()),
    suggestions: state.suggestions
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    chats: state.chats
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    relatedContacts: getRelatedContacts(state, id),
  }
}

export function createContact(input: ContactInput) {
  const state = readState()
  const now = new Date().toISOString()
  const contact: Contact = guessContactDefaults({
    id: makeId('contact'),
    name: input.name.trim(),
    company: input.company?.trim() || undefined,
    title: input.title?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    location: input.location?.trim() || undefined,
    priority: input.priority || 'medium',
    tags: input.tags?.filter(Boolean) || [],
    email: input.email?.trim() || undefined,
    relationship_type: input.relationship_type || undefined,
    met_context: input.met_context?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    created_at: now,
    updated_at: now,
  })

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    contacts: [contact, ...state.contacts],
  })

  return contact
}

export function updateContact(id: string, patch: Partial<Contact>) {
  const state = readState()
  let updatedContact: Contact | null = null
  const now = new Date().toISOString()
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<Contact>

  const contacts = state.contacts.map((contact) => {
    if (contact.id !== id) return contact

    const nextContact = guessContactDefaults({
      ...contact,
      ...cleanPatch,
      updated_at: now,
    })

    updatedContact = nextContact
    return nextContact
  })

  writeState({ ...state, contacts })
  return updatedContact
}

export function deleteContact(id: string) {
  const state = readState()
  const contactExists = state.contacts.some((contact) => contact.id === id)
  if (!contactExists) return false

  writeState({
    schemaVersion: STATE_VERSION,
    contacts: state.contacts.filter((contact) => contact.id !== id),
    updates: state.updates.filter((update) => update.contact_id !== id),
    suggestions: state.suggestions.filter((suggestion) => suggestion.contact_id !== id),
    chats: state.chats.filter((message) => message.contact_id !== id),
    relationships: state.relationships.filter((edge) => edge.source !== id && edge.target !== id),
  })

  return true
}

export function addMockUpdate(contactId: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact) return null

  const update: ContactUpdate = {
    id: makeId('update'),
    contact_id: contactId,
    raw_results: { source: 'mock', query: `${contact.name} ${contact.company || ''}`.trim() },
    summary: buildUpdateSummary(contact),
    news: makeNews(contact),
    fetched_at: new Date().toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    updates: [update, ...state.updates],
  })

  return update
}

export function addMockSuggestion(contactId: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact) return null

  const latestUpdate = state.updates
    .filter((item) => item.contact_id === contactId)
    .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())[0]

  const suggestion: AiSuggestion = {
    id: makeId('suggestion'),
    contact_id: contactId,
    ...buildSuggestion(contact, latestUpdate?.summary),
    created_at: new Date().toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    suggestions: [suggestion, ...state.suggestions],
  })

  return suggestion
}

export function sendFollowUpChat(contactId: string, content: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact || !content.trim()) return null

  const latestUpdate = state.updates
    .filter((item) => item.contact_id === contactId)
    .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())[0]

  const now = new Date().toISOString()
  const userMessage: ChatMessage = {
    id: makeId('chat'),
    contact_id: contactId,
    role: 'user',
    content: content.trim(),
    created_at: now,
  }
  const assistantMessage: ChatMessage = {
    id: makeId('chat'),
    contact_id: contactId,
    role: 'assistant',
    content: buildAssistantReply(contact, content, latestUpdate?.summary),
    created_at: new Date(Date.now() + 500).toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    chats: [...state.chats, userMessage, assistantMessage],
  })

  return [userMessage, assistantMessage]
}

export function getNetworkGraph(): NetworkGraph {
  const state = readState()
  const industryNames = Array.from(new Set(state.contacts.map((contact) => contact.industry || '其他')))
  const radius = 180
  const centerX = 300
  const centerY = 230
  const industries = industryNames.map((name, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(industryNames.length, 1) - Math.PI / 2
    return {
      id: name,
      name,
      contacts: state.contacts.filter((contact) => (contact.industry || '其他') === name),
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius),
    }
  })

  return {
    contacts: state.contacts,
    edges: state.relationships,
    industries,
    industryLinks: buildIndustryLinks(state.contacts),
  }
}
