import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.YUNWU_API_KEY,
  baseURL: process.env.YUNWU_BASE_URL || 'https://yunwu.ai/v1',
})

const MODEL = process.env.YUNWU_MODEL || 'claude-3-7-sonnet-20250219'

export async function summarizeUpdates(
  name: string,
  company: string,
  searchResults: string
): Promise<string> {
  if (!searchResults.trim()) return '暂无最新动态'

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `你是一个信息助手。以下是关于 ${name}（${company || '未知公司'}）的搜索结果：\n\n${searchResults}\n\n请用1-2句中文总结这个人最近的重要动态。如果没有相关新闻，返回"暂无最新动态"。直接给结论，不需要解释。`,
        },
      ],
      max_tokens: 200,
    })
    return response.choices[0].message.content?.trim() || '暂无最新动态'
  } catch (error) {
    console.error('AI summarize error:', error)
    return '动态获取失败，请稍后重试'
  }
}

export async function generateSuggestion(contact: {
  name: string
  company?: string
  met_context?: string
  relationship_type?: string
  notes?: string
  last_contacted_at?: string
  recent_update?: string
}): Promise<{ reason: string; opener: string }> {
  const daysSince = contact.last_contacted_at
    ? Math.floor(
        (Date.now() - new Date(contact.last_contacted_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `你是一个人脉关系顾问。

联系人信息：
- 姓名：${contact.name}
- 公司：${contact.company || '未知'}
- 认识场景：${contact.met_context || '未记录'}
- 关系类型：${contact.relationship_type || '其他'}
- 备注：${contact.notes || '无'}
- 最后联系：${daysSince !== null ? daysSince + '天前' : '未记录'}
- 最近动态：${contact.recent_update || '无'}

请给出：
1. 现在联系的理由（1句话，要具体）
2. 建议的开场白（2-3句话，自然口语，中文，不要太正式）

严格用JSON格式返回，不要其他内容：{"reason": "...", "opener": "..."}`,
        },
      ],
      max_tokens: 400,
    })

    const text = response.choices[0].message.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('AI suggest error:', error)
  }

  return {
    reason: '距上次联系已有一段时间，是个重新保持联系的好时机',
    opener: '最近怎么样？好久没联系了，有空聊聊吗？',
  }
}
