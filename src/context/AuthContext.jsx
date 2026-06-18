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

  const register = useCallback((username, password) => {
    if (users.find(u => u.username === username)) {
      return { success: false, error: '用户名已存在' }
    }
    const newUsers = [...users, { username, password }]
    setUsers(newUsers)
    localStorage.setItem('toolkit_users', JSON.stringify(newUsers))
    const newUser = { username }
    setUser(newUser)
    localStorage.setItem('toolkit_user', JSON.stringify(newUser))
    return { success: true }
  }, [users])

  const login = useCallback((username, password) => {
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) {
      return { success: false, error: '用户名或密码错误' }
    }
    const loggedIn = { username }
    setUser(loggedIn)
    localStorage.setItem('toolkit_user', JSON.stringify(loggedIn))
    return { success: true }
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('toolkit_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
