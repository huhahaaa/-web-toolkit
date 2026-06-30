import { Link } from 'react-router-dom'
import { useGallery } from '../context/gallery'
import styles from './Team.module.css'

const members = [
  {
    name: '何畅',
    role: '组长',
    desc: '负责网页整体架构、模块细分、首页设计与团队展示页面设计',
    links: { github: 'https://github.com/huhahaaa', email: '#' },
    page: '/member/a',
  },
  {
    name: '黄林',
    role: '组员',
    desc: '负责排序可视化模块、算法实现与动画演示',
    links: { github: '#', email: '#' },
    page: '/member/b',
  },
  {
    name: '申化涛',
    role: '组员',
    desc: '负责寻路可视化模块、BFS 与 A* 算法实现',
    links: { github: '#', email: '#' },
    page: '/member/c',
  },
  {
    name: '胡玄烨',
    role: '组员',
    desc: '负责番茄钟模块、计时器逻辑与每日统计',
    links: { github: '#', email: '#' },
    page: '/member/d',
  },
  {
    name: '高一然',
    role: '组员',
    desc: '负责图片画廊模块、上传管理与视觉素材',
    links: { github: '#', email: '#' },
    page: '/member/e',
  },
  {
    name: '赵鸣澳',
    role: '组员',
    desc: '负责日程看板模块、任务管理与优先级系统',
    links: { github: '#', email: '#' },
    page: '/member/f',
  },
]

export default function Team() {
  const { images } = useGallery()
  const avatarPool = images.slice(0, 6)

  return (
    <div className={`${styles.page} section-ambient`}>
      <div className="ambient-blob ambient-blob--purple" style={{ top: '0%', left: '15%', animationDelay: '0s' }} />
      <div className="ambient-blob ambient-blob--indigo" style={{ bottom: '-5%', right: '10%', animationDelay: '-5s' }} />
      <div className="ambient-blob ambient-blob--teal" style={{ top: '40%', right: '20%', animationDelay: '-9s', width: '200px', height: '200px' }} />
      <h2 className={styles.heading}>👥 团队展示</h2>
      <p className={styles.subtitle}>
        我们是一支热爱技术的小团队，共同完成本次 Web 技术大作业
      </p>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>项目分工</h3>
        <div className={styles.grid}>
          {members.map((m, i) => (
            <div key={m.name} className={styles.card}>
              <div className={styles.avatarWrap}>
                {avatarPool[i] ? (
                  <img src={avatarPool[i].url} alt={m.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {m.name.slice(-2)}
                  </div>
                )}
              </div>
              <h4 className={styles.name}>{m.name}</h4>
              <span className={styles.role}>{m.role}</span>
              <p className={styles.desc}>{m.desc}</p>
              <div className={styles.links}>
                {m.page && (
                  <Link to={m.page} className={styles.pageLink}>📂 查看作业</Link>
                )}
                <a href={m.links.github}>GitHub</a>
                <a href={`mailto:${m.links.email}`}>Email</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>技术栈</h3>
        <div className={styles.techTags}>
          {['React', 'Vite', 'React Router', 'CSS Modules', 'Canvas API', 'JavaScript ES6+', 'localStorage'].map(tech => (
            <span key={tech} className={styles.techTag}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
