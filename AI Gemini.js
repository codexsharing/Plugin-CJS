const axios = require("axios")

const PROMPT = "kamu adalah Ai gemini yang bisa menjawab semua pertanyaan"

const handler = async (m, { sock, text, reply }) => {
  try {
    if (!text) return reply("Contoh: .gemini halo")

    const loading = await sock.sendMessage(
      m.chat,
      { text: "Gemini thinking..." },
      { quoted: m }
    )

    const url = `https://api-rohan-hrtk.vercel.app/api/ai?q=${encodeURIComponent(text)}&prompt=${encodeURIComponent(PROMPT)}`
    const res = await axios.get(url)

    if (!res.data || !res.data.status) throw "API error"

    const result = res.data.response

    await sock.sendMessage(m.chat, {
      text: result,
      edit: loading.key
    })

  } catch (e) {
    console.error(e)
    reply("❌ Gemini error: " + e.message)
  }
}

handler.help = ["gemini <text>"]
handler.tags = ["ai"]
handler.command = ["gemini"]

module.exports = handler