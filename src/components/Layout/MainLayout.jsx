import { useState, useEffect } from 'react'
import { Layout, Menu, Drawer, Button } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  PictureOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons'

const { Header, Sider } = Layout

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menuItems = [
    {
      key: '/',
      icon: <PictureOutlined />,
      label: '图像生成'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'API设置'
    }
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  const renderSidebar = () => (
    <>
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#001529',
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
      }}>
        {!collapsed && 'Vibe Generator'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[location.pathname]}
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0 } }}
          width={200}
        >
          {renderSidebar()}
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={0}
          style={{
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            zIndex: 1000
          }}
        >
          {renderSidebar()}
        </Sider>
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 0 : 200), transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 16px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
              />
            )}
            <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 'bold' }}>
              社交媒体图像生成器
            </div>
          </div>
        </Header>
        {children}
      </Layout>
    </Layout>
  )
}
