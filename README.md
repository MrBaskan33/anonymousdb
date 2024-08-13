- # Yüklemek için
___
```
npm install baskan.db
```

- # Nasıl kullanılır
___
```javascript
const { JsonDatabase } = require("baskan.db")
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

- # İletişim
___
**[Discord Profilim](https://discord.com/users/873182701061021696) | [Discord Serveri](https://discord.com/invite/Mr8Dp2Bwk2)**
