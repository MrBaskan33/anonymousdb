const { Hercai } = require("hercai")
const ai = new Hercai()

class BaskanAI {
  
  async chat(content) {
    try {
      const response = await ai.question({ model: "v3", content: content })
      return response.reply
    } catch (error) {
      throw new Error("Sohbet yanıtı oluşturulurken bir hata oluştu.")
    }
  }

  async image(prompt) {
    try {
      const response = await ai.drawImage({ model: "v3", prompt: prompt })
      return response.url
    } catch (error) {
      throw new Error("Resim oluşturulurken bir hata oluştu.")
    }
  }
}

module.exports = { BaskanAI }
