import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { message, name, contact } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Construct the prompt for AI moderation
    const systemPrompt = `你是一个内容审核助手。分析用户消息，判断是否包含以下不当内容：
- 垃圾信息或营销推广
- 骚扰、威胁或辱骂性语言
- 误导或欺骗性信息
- 不当或冒犯性内容

请严格但公平。合法的商业咨询，即使简短，也应该通过。

只返回 JSON 格式，不要有其他内容：
{
  "isAppropriate": true/false,
  "reason": "如果不当则简要说明原因（中文），如果合适则为空字符串"
}`

    const userMessage = `用户信息：
姓名: ${name || '未提供'}
联系方式: ${contact || '未提供'}
消息内容: ${message}`

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    })

    const responseText = completion.choices[0].message.content?.trim() || ''

    // Try to parse the JSON response
    let result
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      result = JSON.parse(cleanedText)
    } catch {
      console.error('Failed to parse AI response:', responseText)
      // If parsing fails, assume it's appropriate to avoid false positives
      result = {
        isAppropriate: true,
        reason: '',
      }
    }

    return NextResponse.json({
      isAppropriate: result.isAppropriate,
      reason: result.reason || '',
    })
  } catch (error: any) {
    console.error('AI Moderation Error:', error)

    // In case of API error, allow the message through to avoid blocking legitimate users
    return NextResponse.json({
      isAppropriate: true,
      reason: '',
      warning: 'Moderation service unavailable',
    })
  }
}
