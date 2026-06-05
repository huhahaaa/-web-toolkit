import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <NavBar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <span>© 2026 Web工具箱 · Web技术及应用开发期末大作业</span>
      </footer>
    </div>
  )
}
