import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Space, Divider, Typography, Switch } from 'antd'
import { SaveOutlined, RollbackOutlined } from '@ant-design/icons'
import { useDebug } from '../contexts/DebugContext'

const { Title, Text } = Typography

const defaultLLMSettings = {
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiKey: '',
  model: 'Qwen/Qwen3-8B',
  systemPrompt: '你是专业的封面设计师，把用户的输入，转化为一张专业的封面图的文本描述提示词，直接输出提示词给我：the image ……'
}

const defaultImageSettings = {
  apiUrl: 'https://api.siliconflow.cn/v1/images/generations',
  apiKey: '',
  model: 'Kwai-Kolors/Kolors'
}

export default function SettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { debugMode, toggleDebugMode } = useDebug()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const llmSettings = JSON.parse(localStorage.getItem('llmSettings') || JSON.stringify(defaultLLMSettings))
    const imageSettings = JSON.parse(localStorage.getItem('imageSettings') || JSON.stringify(defaultImageSettings))
    form.setFieldsValue({
      llmApiUrl: llmSettings.apiUrl,
      llmApiKey: llmSettings.apiKey,
      llmModel: llmSettings.model,
      systemPrompt: llmSettings.systemPrompt,
      imageApiUrl: imageSettings.apiUrl,
      imageApiKey: imageSettings.apiKey,
      imageModel: imageSettings.model,
      debugMode
    })
  }

  const handleSave = async (values) => {
    setLoading(true)
    try {
      const llmSettings = {
        apiUrl: values.llmApiUrl,
        apiKey: values.llmApiKey,
        model: values.llmModel,
        systemPrompt: values.systemPrompt
      }
      const imageSettings = {
        apiUrl: values.imageApiUrl,
        apiKey: values.imageApiKey,
        model: values.imageModel
      }

      localStorage.setItem('llmSettings', JSON.stringify(llmSettings))
      localStorage.setItem('imageSettings', JSON.stringify(imageSettings))

      message.success('设置已保存')
    } catch (error) {
      message.error('保存失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.setFieldsValue({
      llmApiUrl: defaultLLMSettings.apiUrl,
      llmApiKey: '',
      llmModel: defaultLLMSettings.model,
      systemPrompt: defaultLLMSettings.systemPrompt,
      imageApiUrl: defaultImageSettings.apiUrl,
      imageApiKey: '',
      imageModel: defaultImageSettings.model,
      debugMode: false
    })
    toggleDebugMode(false)
    message.info('已重置为默认设置')
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>API 设置</Title>
      <Text type="secondary">配置您的 LLM 和图像生成 API 参数</Text>

      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={(changedValues) => {
            if (changedValues.debugMode !== undefined) {
              toggleDebugMode(changedValues.debugMode)
            }
          }}
          initialValues={{
            llmApiUrl: defaultLLMSettings.apiUrl,
            llmModel: defaultLLMSettings.model,
            systemPrompt: defaultLLMSettings.systemPrompt,
            imageApiUrl: defaultImageSettings.apiUrl,
            imageModel: defaultImageSettings.model
          }}
        >
          <Title level={4}>LLM API 设置</Title>
          <Text type="secondary">用于生成图像提示词</Text>

          <Form.Item
            label="API 地址"
            name="llmApiUrl"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="https://api.siliconflow.cn/v1/chat/completions" />
          </Form.Item>

          <Form.Item
            label="API Key"
            name="llmApiKey"
            rules={[{ required: true, message: '请输入API Key' }]}
          >
            <Input.Password placeholder="请输入API Key" />
          </Form.Item>

          <Form.Item
            label="模型名称"
            name="llmModel"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="Qwen/Qwen3-8B" />
          </Form.Item>

          <Form.Item
            label="系统提示词"
            name="systemPrompt"
            rules={[{ required: true, message: '请输入系统提示词' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="你是专业的封面设计师，把用户的输入，转化为一张专业的封面图的文本描述提示词，直接输出提示词给我：the image ……"
            />
          </Form.Item>

          <Divider />

          <Title level={4}>图像生成 API 设置</Title>
          <Text type="secondary">用于生成图像</Text>

          <Form.Item
            label="API 地址"
            name="imageApiUrl"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="https://api.siliconflow.cn/v1/images/generations" />
          </Form.Item>

          <Form.Item
            label="API Key"
            name="imageApiKey"
            rules={[{ required: true, message: '请输入API Key' }]}
          >
            <Input.Password placeholder="请输入API Key" />
          </Form.Item>

          <Form.Item
            label="模型名称"
            name="imageModel"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="Kwai-Kolors/Kolors" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                保存设置
              </Button>
              <Button icon={<RollbackOutlined />} onClick={handleReset}>
                重置默认
              </Button>
            </Space>
          </Form.Item>

          <Divider />

          <Title level={4}>调试设置</Title>
          <Text type="secondary">开启调试模式可在 VConsole 控制台查看 API 请求日志</Text>

          <Form.Item
            label="调试模式"
            name="debugMode"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
