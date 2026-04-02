import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('*', cors())

// ランダムな文字列を生成する関数
const generateRandomText = (length = 5) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 読み間違いやすい 0, O, 1, I は除外
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 文字を歪ませたSVGを生成する関数
const createSVG = (text) => {
  const width = 150
  const height = 50
  let letters = ''

  // 1文字ずつ配置して、ランダムに回転・移動させる
  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * 25
    const y = 35
    const rotate = Math.floor(Math.random() * 40) - 20 // -20度〜20度の回転
    letters += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-weight="bold" font-size="30" fill="#0070FF" transform="rotate(${rotate}, ${x}, ${y})">${text[i]}</text>`
  }

  // ノイズ（邪魔な線）を入れてボットをかく乱する
  let noiseLines = ''
  for (let i = 0; i < 3; i++) {
    noiseLines += `<line x1="${Math.random() * width}" y1="${Math.random() * height}" x2="${Math.random() * width}" y2="${Math.random() * height}" stroke="#0070FF" stroke-width="1" opacity="0.5" />`
  }

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgba(255,255,255,0.1)" rx="10" />
      ${noiseLines}
      ${letters}
    </svg>
  `.trim()
}

// --- エンドポイント ---

app.get('/captcha/generate', (c) => {
  const text = generateRandomText()
  const svg = createSVG(text)
  
  // 本来は text をKVなどに保存して後で照合するけど、
  // まずは表示確認用にJSONで「正解」と一緒に返してみる
  return c.json({
    svg: svg,
    answer: text // 開発中はこれを見てテストできるぜ
  })
})

export default app
