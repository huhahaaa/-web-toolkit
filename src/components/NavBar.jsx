import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useTheme } from '../context/theme'
import styles from './NavBar.module.css'

const links = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/timer', label: '番茄钟', icon: '🍅' },
  { to: '/schedule', label: '日程看板', icon: '📋' },
  { to: '/gallery', label: '画廊', icon: '🖼' },
  { to: '/sorting', label: '排序可视化', icon: '📊' },
  { to: '/pathfinding', label: '寻路可视化', icon: '🧭' },
  { to: '/team', label: '团队', icon: '👥' },
]

export default function NavBar() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🔧</span>
        <span className={styles.brandText}>Web 工具箱</span>
      </div>

      <ul className={styles.links}>
        {links.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkLabel}>{link.label}</span>
              <span className={styles.linkIndicator} />
            </NavLink>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label="切换主题"
          title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
          <span className={styles.themeIcon} key={theme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>

        <Link to="/auth" className={styles.userArea}>
          {user ? (
            <div className={styles.userAvatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInit}>
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          ) : (
            <div className={styles.loginBtn}>
              <span className={styles.loginIcon}>👤</span>
              <span className={styles.loginText}>登录</span>
            </div>
          )}
        </Link>
      </div>
    </nav>
  )
}
