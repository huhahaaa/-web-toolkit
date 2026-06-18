import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import styles from './Auth.module.css'

export default function Auth() {
  const { user, register, login, updateAvatar, logout } = useAuth()
  const navigate = useNavigate()
  const fileInput = useRef(null)

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(null) // base64 data URL
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // --- Already logged in: show profile ---
  if (user) {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} glass-strong`}>
          <div className={styles.cardGlow} />
          <h2 className={styles.heading}>👤 个人中心</h2>

          {/* Avatar */}
          <div className={styles.avatarLargeWrap} onClick={() => fileInput.current?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className={styles.avatarLarge} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <span>📷</span>
            </div>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (ev) => {
                updateAvatar(ev.target.result)
                setSuccess('头像已更新')
                setTimeout(() => setSuccess(''), 2000)
              }
              reader.readAsDataURL(file)
            }}
          />

          <p className={styles.profileName}>{user.username}</p>
          <p className={styles.profileHint}>点击头像更换</p>

          <button
            className={styles.btnPrimary}
            onClick={() => navigate('/')}
          >
            返回首页
          </button>
          <button
            className={styles.btnDanger}
            onClick={() => { logout(); navigate('/') }}
          >
            退出登录
          </button>

          {success && <p className={styles.successMsg}>{success}</p>}
        </div>
      </div>
    )
  }

  // --- Login / Register form ---
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const result = mode === 'login'
      ? login(username, password)
      : register(username, password, avatar)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} glass-strong`}>
        <div className={styles.cardGlow} />

        <h2 className={styles.heading}>
          {mode === 'login' ? '🔐 登录' : '✨ 注册'}
        </h2>
        <p className={styles.subtitle}>
          {mode === 'login' ? '欢迎回来，继续你的工作' : '创建一个账号，开始使用工具箱'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Avatar upload (register only) */}
          {mode === 'register' && (
            <div className={styles.avatarUpload} onClick={() => fileInput.current?.click()}>
              {avatar ? (
                <img src={avatar} alt="头像预览" className={styles.avatarPreview} />
              ) : (
                <div className={styles.avatarEmpty}>
                  <span>📷</span>
                  <span className={styles.avatarHint}>点击上传头像</span>
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleAvatarUpload}
          />

          {/* Username */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>用户名</label>
            <input
              type="text"
              className={styles.input}
              placeholder="输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>密码</label>
            <input
              type="password"
              className={styles.input}
              placeholder={mode === 'register' ? '设置密码（至少3位）' : '输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {/* Error */}
          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Submit */}
          <button type="submit" className={styles.btnPrimary}>
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className={styles.toggle}>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            className={styles.toggleBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}
