import { useGallery } from '../context/gallery'
import ToolCard from '../components/ToolCard'
import styles from './Home.module.css'

const tools = [
  {
    to: '/timer', icon: '🍅', title: '番茄钟',
    desc: '25分钟专注 + 5分钟休息，提升工作效率',
  },
  {
    to: '/schedule', icon: '📋', title: '日程看板',
    desc: '管理待办任务，标记优先级与状态，支持标签筛选',
  },
  {
    to: '/gallery', icon: '🖼️', title: '图片画廊',
    desc: '浏览、上传和管理图片资源，为网站提供视觉素材',
  },
  {
    to: '/sorting', icon: '📊', title: '排序可视化',
    desc: '冒泡排序与选择排序的动态动画演示',
  },
  {
    to: '/pathfinding', icon: '🧭', title: '寻路可视化',
    desc: 'BFS与A*算法在迷宫中的搜索过程可视化',
  },
  {
    to: '/team', icon: '👥', title: '团队展示',
    desc: '了解开发团队，查看成员分工与贡献',
  },
]

export default function Home() {
  const { images } = useGallery()
  const galleryImages = images.slice(0, 6)

  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <h1 className={styles.heading}>🔧 Web 工具箱</h1>
        <p className={styles.subtitle}>
          一个集成了番茄钟、日程管理、图片画廊、算法可视化等多种实用工具的网站
        </p>
      </header>

      <section className={styles.grid}>
        {tools.map((tool, i) => (
          <ToolCard
            key={tool.to}
            {...tool}
            image={galleryImages[i]?.url}
          />
        ))}
      </section>
    </div>
  )
}
