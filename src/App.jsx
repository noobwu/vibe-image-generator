import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import { DebugProvider } from './contexts/DebugContext'
import MainLayout from './components/Layout/MainLayout'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

const { Content } = Layout

function App() {
  return (
    <DebugProvider>
      <BrowserRouter>
        <MainLayout>
          <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Content>
        </MainLayout>
      </BrowserRouter>
    </DebugProvider>
  )
}

export default App
