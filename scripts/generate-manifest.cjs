/**
 * Generate homework manifest.json from the public/homework directory.
 * Run: node scripts/generate-manifest.cjs
 */
const fs = require('fs')
const path = require('path')

const BASE = path.resolve(__dirname, '..', 'public', 'homework')
const OUT = path.join(BASE, 'manifest.json')

function parseLevelName(dirName) {
  // Format: "第1关-初识CSS：丰富多彩的网页样式-220000616"
  const match = dirName.match(/^第(\d+)关-(.+)-(\d+)$/)
  if (!match) return null
  return {
    number: parseInt(match[1], 10),
    name: match[2],
    id: match[3],
  }
}

function scanSection(sectionPath) {
  // Inside section: 未分班/学生ID/ -> 学生ID.pdf + 代码文件/
  const weifenban = path.join(sectionPath, '未分班')
  if (!fs.existsSync(weifenban)) return null

  const students = fs.readdirSync(weifenban).filter(f => {
    try { return fs.statSync(path.join(weifenban, f)).isDirectory() }
    catch { return false }
  })

  const result = { pdf: null, levels: [] }

  for (const student of students) {
    const studentDir = path.join(weifenban, student)

    // Find PDF
    const files = fs.readdirSync(studentDir)
    const pdfFile = files.find(f => f.endsWith('.pdf'))
    if (pdfFile) {
      // Relative path from public/homework
      const rel = path.relative(BASE, path.join(studentDir, pdfFile))
      result.pdf = rel.replace(/\\/g, '/')
    }

    // Find code levels
    const codeDir = path.join(studentDir, '代码文件')
    if (fs.existsSync(codeDir)) {
      const levelDirs = fs.readdirSync(codeDir).filter(f => {
        try { return fs.statSync(path.join(codeDir, f)).isDirectory() }
        catch { return false }
      })

      for (const levelDir of levelDirs) {
        const parsed = parseLevelName(levelDir)
        if (!parsed) continue

        const levelPath = path.join(codeDir, levelDir)
        const codeFiles = fs.readdirSync(levelPath)
          .filter(f => f.endsWith('.txt'))
          .map(f => ({
            name: f.replace(/\.txt$/, ''),
            path: path.relative(BASE, path.join(levelPath, f)).replace(/\\/g, '/'),
          }))

        result.levels.push({
          ...parsed,
          files: codeFiles,
        })
      }
    }
  }

  // Sort levels by number
  result.levels.sort((a, b) => a.number - b.number)
  return result
}

function scanTheme(themePath) {
  const sections = fs.readdirSync(themePath).filter(f => {
    try { return fs.statSync(path.join(themePath, f)).isDirectory() }
    catch { return false }
  })

  return sections.map(section => {
    const scanned = scanSection(path.join(themePath, section))
    return {
      name: section,
      pdf: scanned?.pdf || null,
      levels: scanned?.levels || [],
    }
  })
}

function main() {
  const themes = fs.readdirSync(BASE).filter(f => {
    if (f === 'manifest.json') return false
    try { return fs.statSync(path.join(BASE, f)).isDirectory() }
    catch { return false }
  })

  const manifest = {
    student: { name: '何畅', id: '20231120119' },
    themes: themes.map(theme => ({
      name: theme,
      sections: scanTheme(path.join(BASE, theme)),
    })),
  }

  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`Manifest written: ${OUT}`)
  console.log(`Themes: ${manifest.themes.length}`)
  manifest.themes.forEach(t => {
    const totalLevels = t.sections.reduce((sum, s) => sum + s.levels.length, 0)
    console.log(`  ${t.name}: ${t.sections.length} sections, ${totalLevels} levels`)
  })
}

main()
