# 修复 VConsole 浮动状态控制方案

## 问题分析
当前代码假设 VConsole 有 `show()` 和 `hide()` 方法，但实际上这些方法可能不存在或不起作用。需要改为通过动态创建/销毁实例来控制。

## 修复计划

### 1. 修改 main.jsx
- 移除直接创建 VConsole 实例的代码
- 不再将 vConsole 暴露到 window 对象

### 2. 修改 HomePage.jsx
- 移除 `vConsole.show()` 和 `vConsole.hide()` 调用
- 根据 `debugMode` 状态动态创建/销毁 VConsole 实例
- 使用 `useEffect` 监听 `debugMode` 变化：
  - 当 `debugMode` 为 `true` 时，创建 VConsole 实例并保存到 ref
  - 当 `debugMode` 为 `false` 时，销毁 VConsole 实例
- 移除 `document.body.classList` 操作

### 3. 修改 SettingsPage.jsx
- 移除 `vConsole.show()` 和 `vConsole.hide()` 调用
- 根据 `debugMode` 状态动态创建/销毁 VConsole 实例
- 在 `loadSettings` 和 `handleSave` 中添加实例创建/销毁逻辑
- 移除 `document.body.classList` 操作

### 4. 修改 index.css
- 移除 `.vconsole-hidden` 相关的 CSS 规则
- 不再需要通过 CSS 控制浮动按钮显示

## 实现逻辑
```javascript
// 创建 VConsole 实例
const createVConsole = () => {
  if (!vConsoleRef.current) {
    vConsoleRef.current = new VConsole()
  }
}

// 销毁 VConsole 实例
const destroyVConsole = () => {
  if (vConsoleRef.current) {
    vConsoleRef.current.destroy()
    vConsoleRef.current = null
  }
}
```

这样当调试模式开启时，VConsole 实例被创建并显示；当调试模式关闭时，VConsole 实例被销毁，浮动按钮也会消失。