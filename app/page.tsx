'use client'

import { useState } from 'react'

interface ResponseOption {
  label: string
  text: string
}

export default function Home() {
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [translation, setTranslation] = useState('')
  const [responses, setResponses] = useState<ResponseOption[]>([])
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!message.trim()) {
      setError('Пожалуйста, введите сообщение')
      return
    }

    if (!apiKey.trim()) {
      setError('Пожалуйста, введите OpenAI API ключ')
      return
    }

    setLoading(true)
    setError('')
    setTranslation('')
    setResponses([])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          senderName: senderName || 'собеседник',
          apiKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при генерации ответов')
      }

      const data = await response.json()
      setTranslation(data.translation)
      setResponses(data.responses)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка. Проверьте API ключ и попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📱 Instagram DM Assistant</h1>
        <p>Ваш помощник для быстрых и профессиональных ответов</p>
      </div>

      <div className="content">
        <div className="input-section">
          <label htmlFor="message">Сообщение от собеседника:</label>
          <textarea
            id="message"
            className="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Вставьте сообщение, которое вам написали в Instagram..."
          />
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <label htmlFor="senderName">Имя отправителя (опционально):</label>
            <input
              id="senderName"
              type="text"
              className="input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Например: Anna"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="apiKey">OpenAI API Key:</label>
            <input
              id="apiKey"
              type="password"
              className="input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
        </div>

        <button
          className="button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Генерация...' : 'Создать варианты ответов'}
        </button>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Генерируем ответы...</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {translation && (
          <div className="results">
            <div className="translation-box">
              <h3>🌐 Перевод сообщения:</h3>
              <p className="translation-text">{translation}</p>
            </div>

            <div className="responses-section">
              <h3>💬 Варианты ответов:</h3>
              {responses.map((response, index) => (
                <div key={index} className="response-card">
                  <h4>{response.label}</h4>
                  <p className="response-text">{response.text}</p>
                  <button
                    className={`copy-button ${copiedIndex === index ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(response.text, index)}
                  >
                    {copiedIndex === index ? '✓ Скопировано' : '📋 Копировать'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
