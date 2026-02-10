const crypto = require("crypto")
const {
  generateWAMessageContent,
  generateWAMessageFromContent
} = require("@whiskeysockets/baileys")

const handler = async (m, {
  sock,
  text,
  reply,
  isAdmins,
  isOwner,
  isBotAdmins,
  prefix,
  command,
  mess
}) => {
  try {
    if (!m.isGroup) return reply("only group")
    if (!isAdmins && !isOwner) return reply("only admin")
    if (!isBotAdmins) return reply("bot harus admin")

    async function groupStatus(jid, content) {
      const inside = await generateWAMessageContent(content, {
        upload: sock.waUploadToServer
      })

      const messageSecret = crypto.randomBytes(32)

      const msg = generateWAMessageFromContent(
        jid,
        {
          messageContextInfo: { messageSecret },
          groupStatusMessageV2: {
            message: {
              ...inside,
              messageContextInfo: { messageSecret }
            }
          }
        },
        {}
      )

      await sock.relayMessage(jid, msg.message, {
        messageId: msg.key.id
      })

      return msg
    }

    const isQuoted = !!m.quoted
    const mime = isQuoted ? (m.quoted.mimetype || m.quoted.mtype) : null
    const caption = text?.trim() || ""
    let options = {}

    if (isQuoted) {
      const media = await m.quoted.download()

      if (/image/.test(mime)) {
        options = { image: media, caption }
      } else if (/video/.test(mime)) {
        options = { video: media, caption }
      } else if (/audio/.test(mime)) {
        options = {
          audio: media,
          mimetype: "audio/mpeg",
          ptt: false
        }
      } else {
        return reply("❌ Reply foto, video, atau audio!")
      }
    } else if (caption) {
      options = { text: caption }
    } else {
      return reply(
        `Contoh:\n${prefix + command} ini caption\n(reply foto / video / audio)`
      )
    }

    await groupStatus(m.chat, options)
    await sock.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (e) {
    console.log(e)
    reply("❌ Terjadi error")
  }
}

handler.command = ["swgc", "upswgc", "toswgc"]
handler.tags = ["group"]
handler.desc = "Upload status grup (text / media)"

module.exports = handler