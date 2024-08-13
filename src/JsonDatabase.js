const fs = require('fs')
class JsonDatabase {
  constructor({path}) {
    this.path = path
    this.logEnabled = false
    this.load()
  }
  
  load() {
    if(fs.existsSync(this.path)) {
      const fileContent = fs.readFileSync(this.path)
      this.data = JSON.parse(fileContent)
    } else {
      this.data = {}
    }
  }
  
  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
  }
  
  log(enable) {
    this.logEnabled = enable
  }
  
  logMessage(message) {
    if(this.logEnabled) {
      console.log(message)
    }
  }

  set(key, value) {
    if(!key || value === undefined) {
      this.logMessage("Anahtar veya değer belirtilmemiş.")
      return
    }
    this.data[key] = value
    this.save()
    this.logMessage(`Veri başarıyla eklendi: ${key} -> ${JSON.stringify(value)}`)
  }

  fetch(key) {
    if(!key) {
      this.logMessage("Anahtar belirtilmemiş.")
      return null
    }
    return this.data[key]
  }

  delete(key) {
    if(!key) {
      this.logMessage("Anahtar belirtilmemiş.")
      return
    }
    delete this.data[key]
    this.save()
    this.logMessage(`Veri başarıyla silindi: ${key}`)
  }

  has(key) {
    if(!key) {
      this.logMessage("Anahtar belirtilmemiş.")
      return false
    }
    return this.data.hasOwnProperty(key)
  }

  deleteAll() {
    this.data = {}
    this.save()
    this.logMessage("Tüm veriler başarıyla silindi.")
  }

  push(key, value) {
    if(!key || value === undefined) {
      this.logMessage("Anahtar veya değer belirtilmemiş.")
      return
    }
    if(!Array.isArray(this.data[key])) {
      this.data[key] = []
    }
    this.data[key].push(value)
    this.save()
    this.logMessage(`Veri başarıyla eklendi: ${key} -> ${JSON.stringify(this.data[key])}`)
  }

  unpush(key, value) {
    if(!key || value === undefined) {
      this.logMessage("Anahtar veya değer belirtilmemiş.")
      return
    }
    if(!Array.isArray(this.data[key])) {
      this.logMessage("Veri bir dizi değil.")
      return
    }
    this.data[key] = this.data[key].filter(item => item !== value)
    this.save()
    this.logMessage(`Veri başarıyla çıkarıldı: ${key} -> ${JSON.stringify(this.data[key])}`)
  }

  add(key, amount) {
    if(!key || amount === undefined) {
      this.logMessage("Anahtar veya miktar belirtilmemiş.")
      return
    }
    if(typeof this.data[key] !== 'number') {
      this.data[key] = 0
    }
    this.data[key] += amount
    this.save()
    this.logMessage(`Değer başarıyla artırıldı: ${key} -> ${this.data[key]}`)
  }

  substract(key, amount) {
    if(!key || amount === undefined) {
      this.logMessage("Anahtar veya miktar belirtilmemiş.")
      return
    }
    if(typeof this.data[key] !== 'number') {
      this.data[key] = 0
    }
    this.data[key] -= amount;
    this.save()
    this.logMessage(`Değer başarıyla azaltıldı: ${key} -> ${this.data[key]}`)
  }
  
  all() {
    return this.data
  }
  
  startsWith(key) {
    if(!key) {
      this.logMessage("Anahtar veya miktar belirtilmemiş.")
      return null
    }
    const result = {}
    for(const output in this.data) {
      if(output.startsWith(key)) {
        result[key] = this.data[output]
      }
    }
    return result
  }
  
  endsWith(key) {
    if(!key) {
      this.logMessage("Anahtar veya miktar belirtilmemiş.")
      return null
    }
    const result = {}
    for(const output in this.data) {
      if(output.endsWith(key)) {
        result[key] = this.data[output]
      }
    }
    return result
  }

  version() {
    return require('../package.json').version
  }

  backup({path}) {
    if(!path) {
      this.logMessage("Yedekleme dosya yolu belirtilmemiş.")
      return
    }
    try {
      fs.copyFileSync(this.path, path)
      this.logMessage(`Veri başarıyla yedeklendi: ${path}`)
    } catch (error) {
      this.logMessage(`Yedekleme sırasında hata oluştu: ${error.message}`)
    }
  }
}

module.exports = { JsonDatabase }
