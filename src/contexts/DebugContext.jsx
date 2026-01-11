import { createContext, useContext, useState, useEffect } from 'react'
import VConsole from 'vconsole'

const DebugContext = createContext()

export const useDebug = () => {
  const context = useContext(DebugContext)
  if (!context) {
    throw new Error('useDebug must be used within DebugProvider')
  }
  return context
}

export const DebugProvider = ({ children }) => {
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    const debugEnabled = localStorage.getItem('debugMode') === 'true'
    setDebugMode(debugEnabled)
  }, [])

  useEffect(() => {
    localStorage.setItem('debugMode', debugMode ? 'true' : 'false')
  }, [debugMode])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'debugMode') {
        const newValue = e.newValue === 'true'
        setDebugMode(newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (debugMode) {
      if (!window.__vconsole_instance__) {
        window.__vconsole_instance__ = new VConsole()
      }
    } else {
      if (window.__vconsole_instance__) {
        window.__vconsole_instance__.destroy()
        window.__vconsole_instance__ = null
      }
    }
  }, [debugMode])

  const toggleDebugMode = (value) => {
    setDebugMode(value)
  }

  return (
    <DebugContext.Provider value={{ debugMode, toggleDebugMode }}>
      {children}
    </DebugContext.Provider>
  )
}
