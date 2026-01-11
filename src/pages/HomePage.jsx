import { useState, useEffect } from 'react'
import { Card, Input, Button, Space, Typography, Spin, Alert, Row, Col, message, Select } from 'antd'
import { SendOutlined, DownloadOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDebug } from '../contexts/DebugContext'
import { fetchWithRetry } from '../utils/apiRetry'

const { Title, Text, Paragraph } = Typography

export default function HomePage() {
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('input')
  const [error, setError] = useState('')
  const [style, setStyle] = useState('') // 默认不指定风格
  const { debugMode } = useDebug()

  // 常用的图片风格选项
  const styleOptions = [
    { value: '', label: '默认风格' },
    { value: 'realistic', label: '写实风格' },
    { value: 'anime', label: '动漫风格' },
    { value: 'watercolor', label: '水彩风格' },
    { value: 'oil painting', label: '油画风格' },
    { value: 'pixel art', label: '像素艺术风格' },
    { value: 'flat illustration', label: '扁平插画风格' },
    { value: 'cyberpunk', label: '赛博朋克风格' },
    { value: 'minimalist', label: '极简风格' }
  ]

  const addDebugLog = (type, title, data) => {
    if (!debugMode) return
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const logType = type === 'request' ? 'info' : type === 'response' ? 'info' : 'error'
    const emoji = type === 'request' ? '📤' : type === 'response' ? '📥' : '❌'
    console[logType](`[${timestamp}] ${emoji} ${title}`, data)
  }

  const generatePrompt = async () => {
    if (!inputText.trim()) {
      message.warning('请输入文本内容')
      return
    }

    setLoading(true)
    setStep('generating-prompt')
    setGeneratedPrompt('')
    setImageUrl('')
    setError('')

    try {
      const llmSettings = JSON.parse(localStorage.getItem('llmSettings') || '{}')

      if (!llmSettings.apiUrl || !llmSettings.apiKey || !llmSettings.model) {
        throw new Error('请先在设置页面配置 LLM API')
      }

      const requestBody = {
        model: llmSettings.model,
        messages: [
          {
            role: 'system',
            content: llmSettings.systemPrompt || '你是专业的封面设计师，把用户的输入，转化为一张专业的封面图的文本描述提示词，直接输出提示词给我：the image ……'
          },
          {
            role: 'user',
            content: inputText
          }
        ],
        stream: false,
        max_tokens: 512,
        enable_thinking: false
      }

      addDebugLog('request', 'LLM API 请求', {
        url: llmSettings.apiUrl,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmSettings.apiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      })

      const response = await fetchWithRetry(llmSettings.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmSettings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }, 3, 1000, 120000)

      const data = await response.json()

      addDebugLog('response', 'LLM API 响应', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '生成提示词失败')
      }

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const prompt = data.choices[0].message.content
        setGeneratedPrompt(prompt)
        setStep('generating-image')
        await generateImage(prompt)
      } else {
        throw new Error('生成提示词失败：返回数据格式不正确')
      }
    } catch (error) {
      console.error('生成提示词错误:', error)
      addDebugLog('error', 'LLM API 错误', {
        message: error.message,
        stack: error.stack
      })
      setError(error.message || '生成提示词时发生错误')
      message.error(error.message || '生成提示词失败')
      throw error
    }
  }

  const generateImage = async (prompt) => {
    try {
      const imageSettings = JSON.parse(localStorage.getItem('imageSettings') || '{}')

      if (!imageSettings.apiUrl || !imageSettings.apiKey || !imageSettings.model) {
        throw new Error('请先在设置页面配置图像生成 API')
      }

      // 根据选择的风格修改提示词
      let styledPrompt = prompt;
      if (style) {
        styledPrompt = `${prompt}, ${style} style`;
      }

      const requestBody = {
        model: imageSettings.model,
        prompt: styledPrompt
      }

      addDebugLog('request', '图像生成 API 请求', {
        url: imageSettings.apiUrl,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${imageSettings.apiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      })

      const response = await fetchWithRetry(imageSettings.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${imageSettings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }, 3, 1000, 180000)

      const data = await response.json()

      addDebugLog('response', '图像生成 API 响应', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '生成图像失败')
      }

      if (data.images && data.images[0] && data.images[0].url) {
        setImageUrl(data.images[0].url)
        setStep('completed')
        message.success('图像生成成功！')
      } else {
        throw new Error('生成图像失败：返回数据格式不正确')
      }
    } catch (error) {
      console.error('生成图像错误:', error)
      addDebugLog('error', '图像生成 API 错误', {
        message: error.message,
        stack: error.stack
      })
      setError(error.message || '生成图像时发生错误')
      message.error(error.message || '生成图像失败')
      throw error
    }
  }

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      message.warning('请输入文本内容')
      return
    }

    setLoading(true)
    setError('')
    try {
      await generatePrompt()
    } catch (error) {
      console.error('生成错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      message.loading('正在下载...', 0)
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('下载图像失败')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vibe-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      message.destroy()
      message.success('下载成功！')
    } catch (error) {
      console.error('下载错误:', error)
      message.destroy()
      message.error('下载失败: ' + error.message)
    }
  }

  const handleReset = () => {
    setInputText('')
    setGeneratedPrompt('')
    setImageUrl('')
    setError('')
    setStyle('')
    setStep('input')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {error && (
        <Alert
          message="发生错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="输入文本" extra={
            <Button type="link" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
              API设置
            </Button>
          }>
            <Space orientation="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>输入您的描述</Text>
                <Paragraph type="secondary">
                  输入活动描述、关键词或任何您想要的内容，系统将为您生成专业的社交媒体图像
                </Paragraph>
                <Input.TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="例如：周末50%促销活动，气球，购物袋，扁平矢量风格"
                  rows={4}
                  disabled={loading}
                />
              </div>
              
              <div>
                <Text strong>选择图片风格</Text>
                <Paragraph type="secondary">
                  选择您喜欢的图片风格，系统会根据选择优化生成效果
                </Paragraph>
                <Select
                  value={style}
                  onChange={setStyle}
                  options={styleOptions}
                  placeholder="选择图片风格"
                  style={{ width: '100%' }}
                  disabled={loading}
                />
              </div>

              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleGenerate}
                loading={loading}
                disabled={!inputText.trim()}
                block
                size="large"
              >
                生成图像
              </Button>

              {generatedPrompt && (
                <div>
                  <Text strong>生成的提示词：</Text>
                  <Paragraph copyable style={{ marginTop: 8 }}>
                    {generatedPrompt}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="生成的图像" extra={
            imageUrl && (
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleGenerate} disabled={loading}>
                  重新生成
                </Button>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
                  下载图像
                </Button>
              </Space>
            )
          }>
            {loading && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  {step === 'generating-prompt' && '正在生成提示词...'}
                  {step === 'generating-image' && '正在生成图像...'}
                </div>
              </div>
            )}

            {!loading && !imageUrl && (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                <div>输入文本并点击生成按钮开始创建图像</div>
              </div>
            )}

            {!loading && imageUrl && (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={imageUrl}
                  alt="Generated Image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 500,
                    borderRadius: 8
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
