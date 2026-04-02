import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// NoppoStudioの各サービスから呼び出せるようにCORSを許可
app.use('*', cors())

/**
 * ランダムな文字列を生成 (読み間違いを防ぐため 0, O, 1, I は除外)
 */
const generateRandomText = (length = 5) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length)
  }
  return result
}

/**
 * 文字を強力に歪ませたSVGを生成する
 */
const createSVG = (text) => {
  const width = 150
  const height = 50
  let letters = ''

  // 1. 文字の配置（回転・縮小・歪み・上下のズレ）
  for (let i = 0; i < text.length; i++) {
    const x = 15 + i * 26 
    const y = 35 + (Math.random() * 8 - 4) // 上下の揺らぎを強化
    
    const rotate = Math.floor(Math.random() * 50) - 25 // -25度〜25度
    const scale = 0.85 + Math.random() * 0.3 // 85%〜115%
    const skewX = Math.floor(Math.random() * 24) - 12 // 斜めの歪みを強化

    // 文字ごとに微妙に透明度を変えてさらに複雑にする
    const opacity = 0.8 + Math.random() * 0.2

    letters += `
      <text x="${x}" y="${y}" 
            font-family="'Georgia', serif" 
            font-weight="bold" 
            font-size="32" 
            fill="#0070FF" 
            fill-opacity="${opacity}"
            transform="scale(${scale}) rotate(${rotate}, ${x}, ${y}) skewX(${skewX})">
        ${text[i]}
      </text>
    `
  }

  // 2. 邪魔なノイズ（ベジェ曲線）
  let noise = ''
  for (let i = 0; i < 3; i++) {
    const coords = Array.from({ length: 8 }, () => Math.random() * 150)
    noise += `<path d="M ${coords[0]} ${coords[1]} C ${coords[2]} ${coords[3]}, ${coords[4]} ${coords[5]}, ${coords[6]} ${coords[7]}" 
                stroke="#0070FF" stroke-width="1.5" fill="none" opacity="0.3" />`
  }

  // 3. ランダムなドットノイズ
  for (let i = 0; i < 15; i++) {
    const dotX = Math.random() * width
    const dotY = Math.random() * height
    noise += `<circle cx="${dotX}" cy="${dotY}" r="1" fill="#0070FF" opacity="0.4" />`
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgba(0,112,255,0.05)" rx="10" />
      ${noise}
      ${letters}
    </svg>
  `.trim()
}

// --- エンドポイント設定 ---

// CAPTCHA生成
app.get('/captcha/generate', (c) => {
  const text = generateRandomText()
  const svg = createSVG(text)
  
  // フロントエンドで答え合わせができるようにJSONで返す
  // 本番運用ではSessionやKVに保存して照合するのがセーフティだぜ
  return c.json({
    svg: svg,
    answer: text
  })
})

// ヘルスチェック用
app.get('/', (c) => c.text('NoppoTools API is active.'))

export default app
