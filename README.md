- # Yüklemek için
___
```
npm install baskan.js
```

- # Nasıl kullanılır
___
```javascript
const { JsonDatabase } = require("baskan.js")
const db = new JsonDatabase({path: "./database.json"})
_________________________
|                       |        
| db.set("examlple", 1) |
| db.delete("example")  |
| db.fetch("example")   |
| db.has("example")     |
| db.get("example")     |
|_______________________|
  
________________________
|                      |
| db.all()             |
| db.deleteAll()       |
|______________________|
  
________________________________
|                              |        
| db.add("examlple", 1)        |
| db.substract("example", 1)   |
| db.push("example", "data")   |
| db.unpush("example", "data") |
|______________________________|
  
  
________________________
|                      |
| db.startsWith("e")   |
| db.endsWith("e")     |
|______________________|
  
_______________________________|
|                              |
| db.backup("./database.json") |
|______________________________|
  
```

- # Nasıl kullanılır ( Top.gg api )
___
```javascript
const { TopGG } = require("baskan.js")
const topgg = new TopGG("dbl_token", "bot_id")

async function voteControl(userId) {
  topgg.isVoted(userId).then(voted => {
    console.log(voted)
  })
}
voteControl("user_id")

async function botInfo() {
  try {
    const botInfo = await topgg.getBotInfo()
    if(botInfo) {
      console.log(`Botun toplam oy sayısı: ${botInfo.points}`)
      console.log(`Botun bu ayda ki oy sayısı: ${botInfo.monthlyPoints}`)
    } else {
      console.log("Bot istatistikleri bulunamadı.")
    }
  } catch (error) {
    console.error("Bot istatistiklerini alırken hata oluştu:", error)
  }
}
botInfo()
```

- # Nasıl kullanılır ( Renkli konsol mesajı )
___
```javascript
require("baskan.js")

console.log("renk", "mesaj")

// Desteklenen renkler: black, red, green, yellow, blue, magenta, cyan, white, gray
```

- # İletişim
___
**[Discord Profilim](https://discord.com/users/873182701061021696) | [Discord Serveri](https://discord.com/invite/Mr8Dp2Bwk2)**
