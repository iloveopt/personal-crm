import Link from 'next/link'

const colorTokens = [
  { name: 'ink', value: '#050505' },
  { name: 'paper', value: '#FFFFFF' },
  { name: 'signal', value: '#FA5400' },
  { name: 'volt', value: '#DFFF00' },
]

const productRows = [
  ['Anna Zhang', 'AI 投资', '42 天未联系', '高优先级'],
  ['陈明', 'AI 销售自动化', '8 天前', '产品合作'],
  ['Priya Rao', 'AI 基础设施', '33 天未联系', '技术引荐'],
]

const valueItems = [
  {
    kicker: '01 / Capture',
    title: '把每一次相遇，变成可推进的关系资产',
    body: '从姓名、行业、地区、标签到认识场景，先把上下文完整保存，再让后续跟进有据可依。',
  },
  {
    kicker: '02 / Context',
    title: '新闻不是信息流，是下一句话的入口',
    body: '联系人动态、行业新闻和历史备注被整理成可直接使用的跟进理由与开场白。',
  },
  {
    kicker: '03 / Network',
    title: '看见人和行业之间真实的路径',
    body: '关系图谱和行业图谱把投资人、创始人、客户、朋友之间的潜在线索显性化。',
  },
]

const functions = [
  {
    label: 'Contact OS',
    title: '联系人管理',
    text: '搜索、筛选、编辑、标记联系，把关系维护从散乱记录变成清晰工作台。',
  },
  {
    label: 'News Pulse',
    title: '新闻动态',
    text: '每个联系人都有最近动态和新闻摘要，展示真实产品状态而不是装饰图。',
  },
  {
    label: 'AI Follow-up',
    title: 'AI Chat 跟进',
    text: '围绕某个联系人连续提问，生成邀约策略、微信话术和下一步行动。',
  },
  {
    label: 'Graph View',
    title: '关系与行业图谱',
    text: '用节点和连接展示人脉、行业和潜在合作路径，支持从图谱回到联系人详情。',
  },
]

function ProductFrame() {
  return (
    <div className="relative min-h-[520px] overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,84,0,0.35),transparent_42%),linear-gradient(315deg,rgba(223,255,0,0.16),transparent_36%)]" />
      <div className="relative grid min-h-[520px] grid-cols-1 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-between border-b border-white/15 p-5 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-[#FA5400]" />
              All Scenes Relationship OS
            </div>
            <h1 className="mt-8 max-w-4xl text-[54px] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-[92px] lg:text-[120px]">
              Win Every Relationship Scene
            </h1>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <p className="max-w-xl text-base font-medium leading-7 text-white/76 sm:text-lg">
              面向投资、客户、合作和朋友维护的 Personal CRM。用新闻、AI 跟进和图谱，把人脉从通讯录变成增长路径。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-black uppercase text-[#050505] transition hover:bg-[#DFFF00]"
              >
                进入 Demo
              </Link>
              <Link
                href="/graph"
                className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 text-sm font-black uppercase text-white transition hover:border-[#FA5400] hover:text-[#FA5400]"
              >
                看图谱
              </Link>
            </div>
          </div>
        </div>

        <div className="relative p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-4">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-white/55">Live Product State</span>
            <span className="rounded-full bg-[#DFFF00] px-3 py-1 text-xs font-black uppercase text-[#050505]">Mock</span>
          </div>
          <div className="space-y-3">
            {productRows.map((row) => (
              <div key={row[0]} className="grid grid-cols-[1fr_auto] gap-3 border border-white/16 bg-white/[0.06] p-4 backdrop-blur">
                <div>
                  <p className="text-lg font-black tracking-[-0.02em]">{row[0]}</p>
                  <p className="mt-1 text-sm text-white/58">{row[1]}</p>
                </div>
                <div className="text-right text-xs font-bold uppercase text-white/64">
                  <p>{row[2]}</p>
                  <p className="mt-2 text-[#FA5400]">{row[3]}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border border-white/16 bg-white p-5 text-[#050505]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FA5400]">AI Follow-up</p>
            <p className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.04em]">
              Turn news into the next message.
            </p>
            <p className="mt-4 text-sm font-medium leading-6 text-[#4A4A4A]">
              Anna 最近关注垂直 AI，建议用产品验证进展切入，发起 20 分钟请教型邀约。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="-mx-4 -mt-6 bg-white text-[#050505]">
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <ProductFrame />
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 border-y border-[#050505] py-8 lg:grid-cols-[0.9fr_1.4fr] lg:py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FA5400]">Editorial Commerce</p>
            <h2 className="mt-4 max-w-lg text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] sm:text-7xl">
              From contact list to relationship motion.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {valueItems.map((item) => (
              <article key={item.kicker} className="border-l border-[#050505] pl-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7A7A7A]">{item.kicker}</p>
                <h3 className="mt-5 text-2xl font-black uppercase leading-none tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-5 text-sm font-medium leading-6 text-[#555]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-[620px] grid-cols-1 bg-[#F3F3F3] lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-between p-5 sm:p-8 lg:order-1">
          <div className="grid gap-3">
            {functions.map((item) => (
              <div key={item.label} className="grid gap-4 border-b border-[#050505]/20 py-5 sm:grid-cols-[150px_1fr]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FA5400]">{item.label}</p>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#555]">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/contacts/new"
            className="mt-8 inline-flex w-fit min-h-12 items-center rounded-full bg-[#050505] px-6 text-sm font-black uppercase text-white transition hover:bg-[#FA5400]"
          >
            添加第一个联系人
          </Link>
        </div>
        <div className="order-1 min-h-[520px] bg-[#050505] p-5 text-white sm:p-8 lg:order-2">
          <div className="flex h-full flex-col justify-between border border-white/16 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">Graph Product State</p>
              <div className="relative mt-10 h-[340px]">
                <div className="absolute left-[44%] top-[42%] flex h-24 w-24 items-center justify-center rounded-full bg-white text-sm font-black uppercase text-[#050505]">
                  Me
                </div>
                {[
                  ['Anna', 'left-[8%] top-[12%]', '#FA5400'],
                  ['Ming', 'right-[10%] top-[18%]', '#DFFF00'],
                  ['Priya', 'left-[18%] bottom-[8%]', '#FFFFFF'],
                  ['Sarah', 'right-[14%] bottom-[14%]', '#FFFFFF'],
                ].map(([name, pos, color]) => (
                  <div
                    key={name}
                    className={`absolute ${pos} flex h-20 w-20 items-center justify-center rounded-full border border-white/25 text-xs font-black uppercase`}
                    style={{ background: color, color: color === '#FFFFFF' || color === '#DFFF00' ? '#050505' : '#FFFFFF' }}
                  >
                    {name}
                  </div>
                ))}
                <div className="absolute left-[18%] top-[24%] h-px w-[64%] rotate-12 bg-white/24" />
                <div className="absolute left-[28%] top-[58%] h-px w-[48%] -rotate-12 bg-white/24" />
                <div className="absolute left-[50%] top-[18%] h-[58%] w-px rotate-12 bg-white/24" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {colorTokens.map((token) => (
                <div key={token.name} className="border border-white/16 p-3">
                  <div className="h-8" style={{ background: token.value }} />
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-white/55">{token.name}</p>
                  <p className="mt-1 text-xs text-white/55">{token.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 bg-[#050505] p-6 text-white sm:p-10 lg:grid-cols-[1.2fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FA5400]">Built for all scenes</p>
            <h2 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl">
              Start with real people. Move with real context.
            </h2>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/70">
              用一个成熟品牌官网的节奏承接浏览者：首屏看产品状态，价值区讲方法，功能区给证据，最后进入可操作 demo。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-black uppercase text-[#050505] transition hover:bg-[#DFFF00]"
            >
              体验完整 Demo
            </Link>
            <Link
              href="/graph"
              className="inline-flex min-h-12 items-center rounded-full bg-[#FA5400] px-6 text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#050505]"
            >
              进入图谱
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
