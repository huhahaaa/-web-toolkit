import { Link } from 'react-router-dom'
import { useGallery } from '../context/gallery'
import ToolCard from '../components/ToolCard'
import styles from './Home.module.css'

const tools = {
  featured: [
    {
      to: '/timer', icon: '🍅', title: '番茄钟',
      desc: '25分钟专注 + 5分钟休息，科学节奏提升工作效率',
    },
    {
      to: '/schedule', icon: '📋', title: '日程看板',
      desc: '管理待办任务，标记优先级与进度状态，支持标签筛选',
    },
  ],
  secondary: [
    {
      to: '/gallery', icon: '🖼️', title: '图片画廊',
      desc: '浏览、上传和管理图片资源',
    },
    {
      to: '/sorting', icon: '📊', title: '排序可视化',
      desc: '冒泡排序与选择排序的动态动画演示',
    },
    {
      to: '/pathfinding', icon: '🧭', title: '寻路可视化',
      desc: 'BFS 与 A* 算法在迷宫中的搜索过程',
    },
    {
      to: '/team', icon: '👥', title: '团队展示',
      desc: '了解开发团队与成员分工',
    },
  ],
}

export default function Home() {
  const { images } = useGallery()
  const galleryImages = images.slice(0, 6)

  return (
    <div className={styles.home}>
      {/* ============================================
          Hero Section — Animated gradient blobs
          ============================================ */}
      <section className={styles.hero}>
        {/* --- Grid pattern overlay --- */}
        <div className={styles.gridOverlay} />

        {/* --- Ambient glow blobs (5 layers) --- */}
        <div className={styles.heroBg}>
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
          <div className={`${styles.blob} ${styles.blob4}`} />
          <div className={`${styles.blob} ${styles.blob5}`} />
        </div>

        {/* --- Floating icons orbit --- */}
        <div className={styles.orbitRing}>
          <span className={`${styles.floatIcon} ${styles.fi1}`}>🍅</span>
          <span className={`${styles.floatIcon} ${styles.fi2}`}>📋</span>
          <span className={`${styles.floatIcon} ${styles.fi3}`}>🖼️</span>
          <span className={`${styles.floatIcon} ${styles.fi4}`}>📊</span>
          <span className={`${styles.floatIcon} ${styles.fi5}`}>🧭</span>
          <span className={`${styles.floatIcon} ${styles.fi6}`}>👥</span>
        </div>

        {/* --- Hero Card --- */}
        <div className={`${styles.heroCard} glass-strong`}>
          <div className={styles.heroCardGlow} />
          <span className={styles.heroBadge}>Vite + React · 全栈工具箱</span>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleAccent}>Web</span> 工具箱
          </h1>
          <p className={styles.heroDesc}>
            集番茄钟、日程管理、图片画廊、算法可视化于一体
            <br />
            打造你的高效开发与学习工作台
          </p>
          <div className={styles.heroActions}>
            <Link to="/timer" className={styles.btnPrimary}>
              <span>🚀</span> 开始使用
            </Link>
            <Link to="/team" className={styles.btnOutline}>
              了解更多
            </Link>
          </div>

          {/* Decorative code line */}
          <div className={styles.codeLine}>
            <span className={styles.codeBracket}>{'{'}</span>
            <span className={styles.codeText}>toolkit</span>
            <span className={styles.codePunct}>:</span>
            <span className={styles.codeStr}>"ready"</span>
            <span className={styles.codeBracket}>{'}'}</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={styles.scrollHint}>
          <span className={styles.scrollText}>向下滚动探索</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>
      </section>

      {/* ============================================
          Featured Tools — Large Cards
          ============================================ */}
      <section className={`${styles.featuredSection} section-ambient`}>
        <div className="ambient-blob ambient-blob--purple" style={{ top: '-10%', right: '5%', animationDelay: '0s' }} />
        <div className="ambient-blob ambient-blob--indigo" style={{ bottom: '-15%', left: '3%', animationDelay: '-5s' }} />
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>—— 精选工具</span>
          <h2 className={styles.sectionTitle}>高效工作，从这里开始</h2>
          <p className={styles.sectionDesc}>
            两个核心工具助你管理时间与任务
          </p>
        </div>
        <div className={styles.featuredGrid}>
          {tools.featured.map((tool, i) => (
            <div
              key={tool.to}
              className={`animate-in ${i === 0 ? 'stagger-1' : 'stagger-2'}`}
            >
              <ToolCard
                size="large"
                {...tool}
                image={galleryImages[i]?.url}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          All Tools — Compact Grid
          ============================================ */}
      <section className={`${styles.secondarySection} section-ambient`}>
        <div className="ambient-blob ambient-blob--violet" style={{ top: '5%', left: '8%', animationDelay: '-3s' }} />
        <div className="ambient-blob ambient-blob--teal" style={{ bottom: '-10%', right: '5%', animationDelay: '-8s' }} />
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>—— 更多工具</span>
          <h2 className={styles.sectionTitle}>探索全部功能</h2>
          <p className={styles.sectionDesc}>
            算法可视化、资源管理与团队协作
          </p>
        </div>
        <div className={styles.secondaryGrid}>
          {tools.secondary.map((tool, i) => (
            <div
              key={tool.to}
              className={`animate-in ${['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'][i] || ''}`}
            >
              <ToolCard size="small" {...tool} />
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          Stats Strip
          ============================================ */}
      <section className={styles.statsStrip}>
        <div className="ambient-blob ambient-blob--purple" style={{ top: '-30%', left: '50%', transform: 'translateX(-50%)', opacity: 0.3, width: '400px', height: '400px' }} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>7</span>
          <span className={styles.statLabel}>功能模块</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>React 19</span>
          <span className={styles.statLabel}>技术框架</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>4</span>
          <span className={styles.statLabel}>核心算法</span>
        </div>
      </section>
    </div>
  )
}
