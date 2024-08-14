const axios = require("axios")

class TopGG {
  constructor(topggToken, botId) {
    this.token = topggToken
    this.botId = botId
    this.baseURL = "https://top.gg/api"
  }

  async isVoted(userId) {
    try {
      const response = await axios.get(
        `/bots/${this.botId}/check?userId=${userId}`,
        {
          baseURL: this.baseURL,
          headers: {
            Authorization: this.token,
          },
        }
      )

      if(response.status === 200) {
        return response.data.voted === 1
      }
    } catch (error) {
      throw new Error("Top.gg oy bilgisi kontrol edilirken hata oluştu.")
    }
  }

  async getBotInfo() {
    try {
      const response = await axios.get(`/bots/${this.botId}/`, {
        baseURL: this.baseURL,
        headers: {
          Authorization: this.token,
        },
      })

      if(response.status === 200) {
        return response.data
      }
    } catch (error) {
      console.error("Top.gg'den bot istatistikleri alınırken hata oluştu:", error)
      return null
    }
  }
}

module.exports = { TopGG }
