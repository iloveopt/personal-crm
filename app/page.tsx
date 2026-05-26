import Link from 'next/link'

const followUpContacts = [
  { name: 'Anna Zhang', role: 'AI 投资', days: 42, tag: 'investor' },
  { name: '陈明', role: 'AI 销售自动化', days: 8, tag: 'founder' },
  { name: 'Priya Rao', role: 'AI 基础设施', days: 33, tag: 'client' },
]

const features = [
  {
    icon: '👤',
    title: '联系人管理',
    desc: '记录每个关系的认识场景、标签和备注，让人脉有迹可循。',
  },
  {
    icon: '📡',
    title: '动态抓取',
    desc: '一键获取联系人最新新闻动态，AI 自动总结关键信息。',
  },
  {
    icon: '💡',
    title: 'AI 跟进建议',
    desc: '基于动态和关系上下文，生成下一步行动和开场白。',
  },
  {
    icon: '🕸️',
    title: '关系图谱',
    desc: '可视化人脉网络，发现潜在路径和合作机会。',
  },
]

const tagColors: Record<string, string> = {
  investor: 'bg-blue-50 text-blue-700',
  founder: 'bg-purple-50 text-purple-700',
  client: 'bg-emerald-50 text-emerald-700',
  friend: 'bg-amber-50 text-amber-700',
}

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          让每段关系都有下一步
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
          用 AI 追踪动态、生成跟进建议，把通讯录变成可推进的关系网络。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600"
          >
            进入 Dashboard
          </Link>
          <Link
            href="/graph"
            className="rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            查看图谱
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">需要跟进</h2>
          <Link href="/dashboard" className="text-sm text-[var(--accent)] hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {followUpContacts.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-[var(--border)] bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                  {c.name[0]}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tagColors[c.tag]}`}>
                  {c.tag === 'investor' ? '投资人' : c.tag === 'founder' ? '创业者' : c.tag === 'client' ? '客户' : '朋友'}
                </span>
              </div>
              <div className="mt-3">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">{c.role}</p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm">
                <span className={`h-2 w-2 rounded-full ${c.days > 30 ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="text-[var(--muted)]">{c.days} 天未联系</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold text-gray-900">核心功能</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--border)] bg-white p-6 transition hover:shadow-md"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          开始管理你的关系网络
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
          添加第一个联系人，体验 AI 动态追踪和跟进建议。
        </p>
        <Link
          href="/contacts/new"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600"
        >
          添加联系人
        </Link>
      </section>
    </div>
  )
}
