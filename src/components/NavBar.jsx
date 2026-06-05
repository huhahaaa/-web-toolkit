import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/auth'
import styles from './NavBar.module.css'

const links = [
  { to: '/', label: '🏠 首页' },
  { to: '/timer', label: '🍅 番茄钟' },
  { to: '/schedule', label: '📋 日程看板' },
  { to: '/gallery', label: '🖼️ 画廊' },
  { to: '/sorting', label: '📊 排序可视化' },
  { to: '/pathfinding', label: '🧭 寻路可视化' },
  { to: '/team', label: '👥 团队' },
]

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>🔧 Web 工具箱</div>
      <ul className={styles.links}>
        {links.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => isActive ? styles.active : ''}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className={styles.user}>
        {user ? (
          <>
            <span className={styles.username}>{user.username}</span>
            <button onClick={logout} className={styles.logoutBtn}>退出</button>
          </>
        ) : (
          <span className={styles.guest}>未登录</span>
        )}
      </div>
    </nav>
  )
}
