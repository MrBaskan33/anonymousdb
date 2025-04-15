- # Yüklemek için
```
npm install anonymousdb@latest
```
___
- # Nasıl kullanılır
```javascript
const { JsonDatabase } = require("anonymousdb")
const db = new JsonDatabase({ path: "./database/anonymousdb.json" })

________________________________
|                              |        
| db.set("key", "value")       |
| db.delete("key")             |
| db.fetch("key")              |
| db.has("key")                |
| db.get("key")                |
| db.all()                     |
| db.fetchAll()                |  
| db.add("number", 1)          |
| db.sub("number", 1)          |
| db.push("array", "value")    |
| db.pull("array", "value")    |
| db.length("key")             |
| db.size()                    |
| db.version()                 |
| db.type("key")               |
| db.startsWith("key")         |
| db.endsWith("key")           |
| db.includes("key")           |
| db.includesDelete("key")     |
| db.clear()                   |
| db.destroy()                 |
| db.backup("./backupdb.json") |
|______________________________|
```
