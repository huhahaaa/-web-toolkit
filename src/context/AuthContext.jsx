import { useState, useCallback } from 'react'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('toolkit_user')
    return saved ? JSON.parse(saved) : null
  })
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('toolkit_users')
    return saved ? JSON.parse(saved) : []
  })

  const saveUsers = (newUsers) => {
    setUsers(newUsers)
    localStorage.setItem('toolkit_users', JSON.stringify(newUsers))
  }

  const saveUser = (userData) => {
    setUser(userData)
    localStorage.setItem('toolkit_user', JSON.stringify(userData))
  }

  const register = useCallback((username, password, avatar = null) => {
    if (users.find(u => u.username === username)) {
      return { success: false, error: '用户名已存在' }
    }
    if (username.length < 2) {
      return { success: false, error: '用户名至少需要2个字符' }
    }
    if (password.length < 3) {
      return { success: false, error: '密码至少需要3位' }
    }
    const newUserData = { username, password, avatar }
    saveUsers([...users, newUserData])
    const loggedIn = { username, avatar }
    saveUser(loggedIn)
    return { success: true }
  }, [users])

  const login = useCallback((username, password) => {
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) {
      return { success: false, error: '用户名或密码错误' }
    }
    const loggedIn = { username, avatar: found.avatar || null }
    saveUser(loggedIn)
    return { success: true }
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('toolkit_user')
  }, [])

  const updateAvatar = useCallback((avatar) => {
    if (!user) return
    // Update current session
    const updated = { ...user, avatar }
    saveUser(updated)
    // Update in users list so it persists on re-login
    const newUsers = users.map(u =>
      u.username === user.username ? { ...u, avatar } : u
    )
    saveUsers(newUsers)
  }, [user, users])

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}
