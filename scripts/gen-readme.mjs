// 从 taofai.com 线上 data.json 生成本仓 README（GitHub Actions 每日同步）。
// 口径与指南站仓库 scripts/gen-github-readme.mjs 一致：剔除 status=对照 的对照页；
// 计数与 data.json 的 meta.resourcesCount 对账（过滤后条数）。
// 用法：node scripts/gen-readme.mjs [data.json 路径] [输出路径]
import { readFileSync, writeFileSync } from 'node:fs'

const data = JSON.parse(readFileSync(process.argv[2] || 'data.json', 'utf8'))
const SITE = 'https://taofai.com'
const out = process.argv[3] || 'README.md'

const CAT = [
  ['gpu', '免费 GPU 算力', 'Free GPU'],
  ['vps', '免费服务器与 VPS', 'Free Servers & VPS'],
  ['api', '免费 API 额度', 'Free API Credits'],
  ['ai', '免费 AI 工具', 'Free AI Tools'],
  ['esim', 'eSIM 与境外号码', 'eSIM & Global Numbers'],
]
const res = data.resources.filter((r) => r.status !== '对照')
const byCat = Object.fromEntries(CAT.map(([id]) => [id, res.filter((r) => r.category === id)]))
const updated = data.meta?.updated || ''

const short = (s, n = 64) => {
  s = String(s ?? '').trim()
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const idx = Math.max(cut.lastIndexOf('；'), cut.lastIndexOf('，'), cut.lastIndexOf('、'))
  return (idx > 20 ? cut.slice(0, idx) : cut).trim() + '…'
}
const ACCESS = { none: 'AI 可全程代办', email: '需邮箱验证码', sms: '需短信验证码', realname: '需实名', card: '需绑卡', paid: '付费' }

const L = []
L.push('# 免费资源清单 · Awesome Free AI & Cloud Resources')
L.push('')
L.push(`免费服务器、免费 GPU、免费 AI API、免费工具与 eSIM 号卡——共 **${res.length} 条**，每条都经人工对照官方页面核实，标注额度、领取条件与核实日期。`)
L.push('')
L.push('Free servers, free GPU, free AI API credits, tools and eSIM plans — every entry verified against the official page, with quota, conditions and verified date.')
L.push('')
L.push(`- 完整版（可筛选、带申领步骤）：${SITE}/resources`)
L.push(`- 机器可读数据（给 AI 用）：${SITE}/data.json`)
L.push(`- 让 AI 直接帮你领：${SITE}/ai-prompts`)
L.push(`- 最近同步：${updated}`)
L.push('')
L.push('## 目录')
L.push('')
for (const [id, zh, en] of CAT) if (byCat[id].length) L.push(`- ${zh} ${en}（${byCat[id].length}）`)
L.push('')
L.push('> 本仓库由脚本从 [AI指南站](https://taofai.com) 的站内数据自动生成，每日同步，**不接受 PR**；发现错误请到站内条目页反馈，或邮件 zhi@muse.ai。每条的「核实日期」以站内详情页为准。')
L.push('')
for (const [id, zh, en] of CAT) {
  if (!byCat[id].length) continue
  L.push(`## ${zh}`)
  L.push('')
  for (const r of byCat[id]) {
    const bits = [short(r.quota)]
    if (r.agentAccess && ACCESS[r.agentAccess]) bits.push(ACCESS[r.agentAccess])
    L.push(`- [${r.name}](${SITE}/resources/${r.id}) — ${bits.join(' · ')}`)
  }
  L.push('')
}
L.push('## 好价（限时优惠）')
L.push('')
L.push(`限时优惠时效性强，不进本清单，请看站内好价栏目（现价与截止日期逐条核实）：${SITE}/deals`)
L.push('')
L.push('## 关于')
L.push('')
L.push('AI指南站（taofai.com）是一个专收录免费资源的中文站点：只收官方有明确免费口径的资源，逐条核实、标注日期，失效即下架。本清单是它的 GitHub 镜像门面。')
L.push('')

writeFileSync(out, L.join('\n'), 'utf8')
console.log(`README generated: ${res.length} resources -> ${out}`)
for (const [id, zh] of CAT) console.log(`  ${zh}: ${byCat[id].length}`)
