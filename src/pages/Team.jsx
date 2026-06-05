import { useGallery } from '../context/gallery'
import styles from './Team.module.css'

const members = [
  {
    name: '成员一',
    role: '组长 / 前端开发',
    desc: '负责项目架构、番茄钟与日程看板模块',
    links: { github: '#', email: '#' },
  },
  {
    name: '成员二',
    role: '前端开发',
    desc: '负责图片画廊模块、网站视觉设计',
    links: { github: '#', email: '#' },
  },
  {
    name: '成员三',
    role: '前端开发',
    desc: '负责排序可视化模块、算法实现',
    links: { github: '#', email: '#' },
  },
  {
    name: '成员四',
    role: '前端开发',
    desc: '负责寻路可视化模块、团队展示页',
    links: { github: '#', email: '#' },
  },
]

export default function Team() {
  const { images } = useGallery()
  const avatarPool = images.slice(0, 4)

  return (
    <div className={styles.page}>
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
