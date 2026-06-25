import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styles from './Member.module.css'

const MANIFEST_URL = '/homework/manifest.json'

// Simple syntax highlighting via HTML escaping + keyword spans
function highlightCode(code, ext) {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let result = escaped

  if (ext === 'html') {
    // Highlight tags
    result = result.replace(
      /(&lt;\/?)([\w-]+)([\s\S]*?)(\/?&gt;)/g,
      '<span class="kw-tag">$1</span><span class="kw-elem">$2</span>$3<span class="kw-tag">$4</span>'
    )
    // Highlight attributes
    result = result.replace(
      /\b(class|id|href|src|style|type|rel|alt|width|height|name|value|placeholder|disabled|checked|selected|method|action)\b=/g,
      '<span class="kw-attr">$1</span>='
    )
    // Highlight strings
    result = result.replace(/"([^"]*)"/g, '<span class="kw-str">"$1"</span>')
  }

  if (ext === 'css') {
    // Highlight properties
    result = result.replace(
      /^(\s*)([\w-]+)(\s*:)/gm,
      '$1<span class="kw-prop">$2</span>$3'
    )
    // Highlight values
    result = result.replace(
      /:\s*([^;{]+)/g,
      ': <span class="kw-val">$1</span>'
    )
    // Highlight comments
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="kw-comment">$1</span>'
    )
    // Selectors
    result = result.replace(
      /^([^{]+)(\{)/gm,
      (_, sel, brace) => {
        const colored = sel.replace(
          /(\.|#)?([\w-]+)/g,
          '<span class="kw-selector">$1$2</span>'
        )
        return colored + brace
      }
    )
  }

  if (ext === 'js' || ext === 'javascript') {
    // Keywords
    result = result.replace(
      /\b(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|new|this|class|export|import|default|from|async|await|try|catch|throw|typeof|instanceof|null|undefined|true|false)\b/g,
      '<span class="kw-keyword">$1</span>'
    )
    // Strings
    result = result.replace(/'([^']*)'/g, '<span class="kw-str">\'$1\'</span>')
    result = result.replace(/"([^"]*)"/g, '<span class="kw-str">"$1"</span>')
    // Template literals
    result = result.replace(/(`[\s\S]*?`)/g, '<span class="kw-str">$1</span>')
    // Numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="kw-num">$1</span>')
    // Comments
    result = result.replace(/(\/\/.*)/g, '<span class="kw-comment">$1</span>')
  }

  return result
}

function detectExt(filename) {
  if (/\.html$/i.test(filename)) return 'html'
  if (/\.css$/i.test(filename)) return 'css'
  if (/\.(js|jsx)$/i.test(filename)) return 'js'
  return 'txt'
}

export default function Member() {
  const { id } = useParams()
  const [manifest, setManifest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTheme, setActiveTheme] = useState(0)
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [fileLoading, setFileLoading] = useState(false)

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then(r => r.json())
      .then(data => {
        setManifest(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleSection = (themeIdx, sectionIdx) => {
    const key = `${themeIdx}-${sectionIdx}`
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openFile = async (filePath, fileName) => {
    setSelectedFile({ path: filePath, name: fileName })
    setFileLoading(true)
    try {
      const res = await fetch(`/homework/${filePath}`)
      const text = await res.text()
      setFileContent(text)
    } catch {
      setFileContent('// 无法加载文件内容')
    }
    setFileLoading(false)
  }

  const closeFile = () => {
    setSelectedFile(null)
    setFileContent('')
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>加载中...</div>
      </div>
    )
  }

  if (!manifest) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>未找到作业数据</div>
      </div>
    )
  }

  const { student, themes } = manifest
  const theme = themes[activeTheme]

  return (
    <div className={styles.page}>
      {/* ===== Header ===== */}
      <header className={styles.header}>
        <Link to="/team" className={styles.backBtn}>← 返回团队</Link>
        <div className={styles.headerInfo}>
          <div className={styles.avatarLarge}>
            {student.name.slice(0, 2)}
          </div>
          <div>
            <h1 className={styles.headerName}>{student.name}</h1>
            <p className={styles.headerId}>学号：{student.id}</p>
          </div>
        </div>
        <p className={styles.headerDesc}>
          Web技术及应用开发 · 学期作业总览
        </p>
      </header>

      {/* ===== Theme Tabs ===== */}
      <nav className={styles.tabs}>
        {themes.map((t, i) => (
          <button
            key={t.name}
            className={`${styles.tab} ${activeTheme === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTheme(i)}
          >
            <span className={styles.tabIcon}>
              {i === 0 ? '🎨' : i === 1 ? '📄' : '⚡'}
            </span>
            <span className={styles.tabText}>{t.name}</span>
            <span className={styles.tabCount}>
              {t.sections.reduce((s, sec) => s + sec.levels.length, 0)} 关
            </span>
          </button>
        ))}
      </nav>

      {/* ===== Sections Accordion ===== */}
      <div className={styles.sections}>
        {theme.sections.map((section, sIdx) => {
          const isOpen = expandedSections.has(`${activeTheme}-${sIdx}`)

          return (
            <div key={section.name} className={`${styles.sectionCard} glass`}>
              {/* Section header */}
              <button
                className={styles.sectionHeader}
                onClick={() => toggleSection(activeTheme, sIdx)}
              >
                <div className={styles.sectionInfo}>
                  <span className={styles.sectionIcon}>{isOpen ? '▾' : '▸'}</span>
                  <span className={styles.sectionName}>{section.name}</span>
                  <span className={styles.sectionCount}>
                    {section.levels.length} 关卡
                  </span>
                </div>
                <div className={styles.sectionActions}>
                  {section.pdf && (
                    <a
                      href={`/homework/${section.pdf}`}
                      download
                      className={styles.pdfBtn}
                      onClick={e => e.stopPropagation()}
                    >
                      <span>📥 下载报告</span>
                    </a>
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className={styles.sectionBody}>
                  {/* PDF Preview */}
                  {section.pdf && (
                    <div className={styles.pdfPreview}>
                      <div className={styles.pdfLabel}>📄 实验报告</div>
                      <iframe
                        src={`/homework/${section.pdf}#toolbar=0&navpanes=0`}
                        className={styles.pdfFrame}
                        title="实验报告预览"
                      />
                    </div>
                  )}

                  {/* Levels */}
                  <div className={styles.levels}>
                    {section.levels.map(level => (
                      <div key={level.id} className={styles.levelCard}>
                        <div className={styles.levelHeader}>
                          <span className={styles.levelBadge}>
                            第 {level.number} 关
                          </span>
                          <span className={styles.levelName}>{level.name}</span>
                          <span className={styles.levelId}>#{level.id}</span>
                        </div>
                        <div className={styles.levelFiles}>
                          {level.files.map(file => (
                            <button
                              key={file.path}
                              className={styles.fileBtn}
                              onClick={() => openFile(file.path, file.name)}
                            >
                              <span className={styles.fileIcon}>
                                {/\.css/i.test(file.name) ? '🎨' :
                                 /\.html/i.test(file.name) ? '🌐' :
                                 /\.js/i.test(file.name) ? '📜' : '📝'}
                              </span>
                              <span className={styles.fileName}>{file.name}</span>
                              <span className={styles.fileExt}>
                                {detectExt(file.name)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ===== Code Viewer Modal ===== */}
      {selectedFile && (
        <div className={styles.modal} onClick={closeFile}>
          <div className={`${styles.modalContent} glass-strong`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalFileName}>{selectedFile.name}</span>
                <span className={styles.modalLang}>{detectExt(selectedFile.name)}</span>
              </div>
              <button className={styles.modalClose} onClick={closeFile}>✕</button>
            </div>
            <div className={styles.codeViewer}>
              {fileLoading ? (
                <div className={styles.codeLoading}>加载中...</div>
              ) : (
                <pre className={styles.codeBlock}>
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(fileContent, detectExt(selectedFile.name))
                    }}
                  />
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
