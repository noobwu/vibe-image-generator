# 修复 VConsole 浮动按钮不跟随调试模式开关的问题

## 问题分析
当前实现存在的问题：
1. HomePage 和 SettingsPage 各自维护独立的 `debugMode` 状态
2. HomePage 只在组件挂载时从 localStorage 读取 `debugMode`
3. 当在 SettingsPage 切换调试模式开关并保存后，HomePage 的状态不会更新
4. HomePage 的 useEffect 只在首次加载时执行，不会响应 localStorage 的变化

## 修复方案

### 方案：在 HomePage 中添加 storage 事件监听
监听 `storage` 事件，当 localStorage 中的 `debugMode` 变化时，自动更新 HomePage 的状态并重新创建/销毁 VConsole 实例。

### 具体实现

#### 修改 HomePage.jsx
1. 添加 `storage` 事件监听器
2. 当检测到 `debugMode` key 变化时：
   - 更新本地 `debugMode` 状态
   - 重新执行创建/销毁 VConsole 实例的逻辑
3. 在组件卸载时移除事件监听器

#### 修改 SettingsPage.jsx
无需修改，SettingsPage 已经正确地更新了 localStorage。

## 实现逻辑
```javascript
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'debugMode') {
      const newDebugMode = e.newValue === 'true'
      setDebugMode(newDebugMode)
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}, [])
```

这样当在 SettingsPage 切换调试模式开关时，HomePage 会通过 storage 事件自动感知到变化，并相应地创建或销毁 VConsole 实例。