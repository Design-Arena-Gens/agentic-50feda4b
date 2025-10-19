import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { message, senderName, apiKey } = await request.json()

    if (!message || !apiKey) {
      return NextResponse.json(
        { error: 'Необходимо предоставить сообщение и API ключ' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Detect language and translate
    const translationPrompt = `Переведи следующее сообщение на русский или украинский язык (выбери тот, который звучит более естественно). Если сообщение уже на русском или украинском, просто повтори его. Выведи только перевод без дополнительных комментариев:

"${message}"`

    const translationResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный переводчик. Переводи тексты точно и естественно.',
        },
        {
          role: 'user',
          content: translationPrompt,
        },
      ],
      temperature: 0.3,
    })

    const translation = translationResponse.choices[0].message.content?.trim() || ''

    // Generate response options
    const responsePrompt = `Ты помощник организатора кинофестиваля. Тебе написал ${senderName} следующее сообщение:

"${message}"

Создай 3 варианта ответа на ТОМ ЖЕ ЯЗЫКЕ, на котором написано входящее сообщение:

1. Формальный и профессиональный ответ
2. Дружелюбный и тёплый ответ
3. Краткий и конкретный ответ

Все ответы должны:
- Быть вежливыми и приветливыми
- Мотивировать человека к участию в кинофестивале
- Создавать позитивный контакт
- Быть написаны на том же языке, что и входящее сообщение
- Быть естественными и человечными

Верни ответ строго в формате JSON:
{
  "responses": [
    {"label": "Формальный вариант", "text": "текст ответа"},
    {"label": "Дружелюбный вариант", "text": "текст ответа"},
    {"label": "Краткий вариант", "text": "текст ответа"}
  ]
}

Не добавляй никаких дополнительных комментариев, только JSON.`

    const responsesResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный помощник для организатора кинофестиваля. Ты создаёшь продуманные и привлекательные ответы для потенциальных участников.',
        },
        {
          role: 'user',
          content: responsePrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const responsesText = responsesResponse.choices[0].message.content || '{}'
    const responsesData = JSON.parse(responsesText)

    return NextResponse.json({
      translation,
      responses: responsesData.responses || [],
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Произошла ошибка при обработке запроса' },
      { status: 500 }
    )
  }
}
