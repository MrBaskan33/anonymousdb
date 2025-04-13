const fs = require("fs")
const EventEmitter = require("events").EventEmitter
const { initCheckUpdates } = require("../checkUpdate.js")

const FileFixer = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    const fixedData = data.replace(/\}\s*$/, "")
    fs.writeFileSync(filePath, fixedData, "utf8")
    console.log("Unnecessary characters have been successfully removed.")
  } catch (error) {
    console.error("File fixing error:", error)
  }
}

class JsonDatabase extends EventEmitter {
  constructor(options) { 
    super()
    const { path, separator, useEmit, checkUpdate, minify, deleteEmptyObjects } = options
    this.path = path || "baskandb.json"
    this.separator = separator || "."
    this.useEmit = useEmit || false
    this.checkUpdate = checkUpdate || false
    this.minify = minify || false
    this.deleteEmptyObjects = deleteEmptyObjects || false

    if(typeof path !== "string" && path !== undefined) throw new Error("path must be string.")
    if(path === "baskandb.json" && path !== undefined) throw new Error("path must be not same as default. If you want to use default you do not have to identify.")
    if(typeof separator !== "string" && separator !== undefined) throw new Error("separator must be string.")
    if(separator === "." && separator !== undefined) throw new Error("separator must be not same as default. If you want to use default you do not have to identify.")
    if(typeof useEmit !== "boolean" && useEmit !== undefined) throw new Error("useEmit must be a boolean.")
    if(typeof checkUpdate !== "boolean" && checkUpdate !== undefined) throw new Error("checkUpdate must be a boolean.")
    if(typeof minify !== "boolean" && minify !== undefined) throw new Error("minify must be a boolean.")
    if(typeof deleteEmptyObjects !== "boolean" && deleteEmptyObjects !== undefined) throw new Error("deleteEmptyObjects must be a boolean.")
    if(this.checkUpdate) {
      initCheckUpdates()
    }
    if(!this.path.startsWith("./")) this.path = "./" + this.path
    if(!this.path.endsWith(".json")) this.path = this.path + ".json"
    if(!fs.existsSync(this.path)) {
      if(!fs.existsSync(this.path.substring(0, this.path.lastIndexOf("/")))) {
        fs.mkdirSync(this.path.substring(0, this.path.lastIndexOf("/")), { recursive: true })
      }
      this.save(this.path, {})
    }
  }

  read(file) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf-8"))
    } catch (error) {
      if(error.message.includes("Unexpected token }")) {
        return FileFixer(file)
      } else {
        throw error
      }
    }
  }

  save(file, data) {
    if(this.minify === false) {
      return fs.writeFileSync(file, JSON.stringify(data, null, 1))
    } else {
      return fs.writeFileSync(file, JSON.stringify(data));
    }
  }

  set(key, value) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    if(value === "" || value === undefined || value === null) throw new Error("Value not specified.", "ValueError")
    let db = this.read(this.path)
    let keyPath = key
    if(this.separator && key.includes(this.separator)) {
      const keySplit = key.split(this.separator)
      const lastKey = keySplit.pop()
      let current = db
      for(const currentKey of keySplit) {
        if(current[currentKey] === undefined) {
          current[currentKey] = {}
        }
        current = current[currentKey]
      }
      keyPath = lastKey
      current[lastKey] = value
    } else {
      db[key] = value
    }
    this.save(this.path, db)
    if(this.useEmit) { 
      this.emit("set", { key, value })
    }
    return value
  }

  fetch(key) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    let db = this.read(this.path)
    let result = db
    if(this.separator && key.includes(this.separator)) {
      const keySplit = key.split(this.separator)
      let current = db
      for(const currentKey of keySplit) {
        if(current[currentKey] === undefined) {
          return null
        }
        current = current[currentKey]
      }
      result = current
    } else {
      result = db[key]
    }
    return result
  }

  size() {
    let stats = (0, fs.statSync)(`${this.path}`)
    return { byte: stats.size, megabyte: stats.size / (1024 * 1024), kilobyte: stats.size / (1024) }
  }

  has(key) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    let db = this.read(this.path) 
    if(this.separator && key.includes(this.separator)) {
      const keySplit = key.split(this.separator)
      let current = db
      for(const currentKey of keySplit) {
        if(current[currentKey] === undefined) {
          return false
        }
        current = current[currentKey]
      }
    } else {
      if(!db[key]) return false
    }
    return true
  }

  clear() {
    this.save(this.path, {})
    if(this.useEmit) { 
      this.emit("clear", true)
    }
    return true
  }

  version(){
    return require("../package.json").version
  }

  backup(path = null, interval = null) {
    function renameFilePath(path) {
      const lastSlashIndex = path.lastIndexOf("/")
      const directory = path.substring(0, lastSlashIndex + 1)
      const fileName = path.substring(lastSlashIndex + 1)
      const newFileName = fileName.replace(".json", "-backup")
      return directory + newFileName
    } 
    if(path == null) path = renameFilePath(this.path)
    if(typeof path !== "string" && path !== null) throw new Error("Path must be string.")
    if(path === this.path && path !== null) throw new Error("filename cannot same as orjinal database name.")
    if(path.endsWith(".json") && path !== null) throw new Error("Do not include file extensions in your file name.")
    function convertToMilliseconds(input) {
      const regex = /^(\d+)([a-z]+)$/i
      const match = input.match(regex)
      if(!match) {
        return "Invalid entry!"
      }
      const value = parseInt(match[1], 10)
      const unit = match[2].toLowerCase()
      const units = {
        s: 1000,
        m: 60000,
        h: 3600000
      }  
      if(!units.hasOwnProperty(unit)) {
        return "Invalid unit!"
      }
      const milliseconds = value * units[unit]
      return milliseconds
    }
    if((convertToMilliseconds(interval) === "Invalid entry!" || convertToMilliseconds(interval) === "Invalid unit!") && interval !== null) throw new Error("interval must be number. Usage Example: **12m / 12h / 12s*")
    const db = JSON.parse(fs.readFileSync(this.path, "utf8"))
    if(interval !== null) {
      setInterval(() => {
        console.log("Auto backup successfully saved.")
        if(!fs.existsSync(path)) {
          if(!fs.existsSync(path.substring(0, path.lastIndexOf("/")))) {
            fs.mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true })
          }
          if(this.minify === false) {
            fs.writeFileSync(`${path}.json`, JSON.stringify(db, null, 1))
          } else {
            fs.writeFileSync(`${path}.json`, JSON.stringify(db))
          }
        }
      }, convertToMilliseconds(interval))
    } else {
      if(!fs.existsSync(path)) {
        if(!fs.existsSync(path.substring(0, path.lastIndexOf("/")))) {
          fs.mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true })
        }
        if(this.minify === false) {
          fs.writeFileSync(`${path}.json`, JSON.stringify(db, null, 1))
        } else {
          fs.writeFileSync(`${path}.json`, JSON.stringify(db))
        }
      }
    }
    if(this.useEmit) { 
      this.emit("backup", true)
    }
    return true
  }

  destroy() {
    fs.unlinkSync(this.path)
    if(this.useEmit) { 
      this.emit("destroy", true)
    }
    return true
  }

  get(key) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    return this.fetch(key)
  }

  type(key) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    let db = this.read(this.path)
    let keyPath = key
    if(this.separator && key.includes(this.separator)) {
      const keySplit = key.split(this.separator)
      const lastKey = keySplit.pop()
      let current = db
      for(const currentKey of keySplit) {
        if(current[currentKey] === undefined) {
          current[currentKey] = {}
        }
        current = current[currentKey]
      }
      keyPath = lastKey
      db = current
    }
    if(!db[keyPath]) return null
    if(Array.isArray(db[keyPath])) return "array"
    return typeof db[keyPath]
  }

  delete(key) {
    if(!key) throw new Error("Key not specified.", "KeyError")
    if(typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError")
    let db = this.read(this.path)
    let keyParts = key.split(this.separator)
    if(this.separator && keyParts.length > 1) {
      let obj = db
      for(let i = 0; i < keyParts.length - 1; i++) {
        obj = obj[keyParts[i]]
        if(!obj) return null
      }   
      delete obj[keyParts[keyParts.length - 1]]
      if(this.deleteEmptyObjects) {
        this.deleteEmptyObject(db, keyParts.slice(0, keyParts.length - 1))
      }
    } else {
      if(db[key] !== undefined) {
        delete db[key]
      } else {
        return null
      }
    }
    this.save(this.path, db)
    if(this.useEmit) {
      this.emit("delete", key)
    }
    return true
  }

  deleteEmptyObject(obj, keyParts) {
    if(keyParts.length === 0) return
    let currentObj = obj
    for(let i = 0; i < keyParts.length; i++) {
      if(!currentObj[keyParts[i]]) return
      currentObj = currentObj[keyParts[i]]
    }
    if(Object.keys(currentObj).length === 0) {
      let parentObj = obj
      for(let i = 0; i < keyParts.length - 1; i++) {
        parentObj = parentObj[keyParts[i]]
      }
      delete parentObj[keyParts[keyParts.length - 1]]
      this.deleteEmptyObject(obj, keyParts.slice(0, keyParts.length - 1))
    }
  }

  fetchAll() {
    return this.read(this.path)
  }

includesDelete(searchKey) {
if (!searchKey) throw new Error("Key not specified.", "KeyError");
if (typeof searchKey !== "string") throw new Error("Key needs to be a string.", "KeyError");
if(searchKey.includes(this.separator)) throw new Error("Key must not include separator", "KeyError");

const db = this.read(this.path);
let deletedCount = 0;

const deleteRecursive = (obj, searchKey) => {
for (const key in obj) {
if (key.includes(searchKey)) {

delete obj[key];
deletedCount++;
if (this.useEmit) {
this.emit('includesDelete', key);
}
} else if (typeof obj[key] === 'object' && obj[key] !== null) {

deleteRecursive(obj[key], searchKey);

if (Object.keys(obj[key]).length === 0) {
delete obj[key];
if(this.useEmit) { 
this.emit('includesDelete', key);
}
deletedCount++;
}
}
}
};

deleteRecursive(db, searchKey);

this.save(this.path, db);

return deletedCount > 0 ? true : null;
}

all(key = 'all') {
switch (key) {
case 'all':
return this.read(this.path)
case 'object':
return Object.entries(this.read(this.path))
case 'keys':
return Object.keys(this.read(this.path))
case 'values':
return Object.values(this.read(this.path))
}
}

length(key = 'all') {
switch (key) {
case 'all':
return this.all("object").length
case key:
return this.includes(key).length
}
}

startsWith(key) {
if (!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");

const db = this.read(this.path);
const array = [];


for (const id in db) {
const keys = { ID: id, data: db[id] };
array.push(keys);
}

const keyParts = key.split(this.separator);

return array.filter(x => {
const idStartsWith = keyParts.every(part => x.ID.startsWith(part));

const dataStartsWith = (typeof x.data === 'object') && Object.keys(x.data).some(subKey => {
return keyParts.some(part => subKey.startsWith(part));
});

return idStartsWith || dataStartsWith;
});
}

endsWith(key) {
if (!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");

const db = this.read(this.path);
const array = [];

for (const id in db) {
const keys = { ID: id, data: db[id] };
array.push(keys);
}

const keyParts = key.split(this.separator);

return array.filter(x => {
const idEndsWith = keyParts.every(part => x.ID.endsWith(part));

const dataEndsWith = (typeof x.data === 'object') && Object.keys(x.data).some(subKey => {
return keyParts.some(part => subKey.endsWith(part));
});

return idEndsWith || dataEndsWith;
});
}

includes(key) {
if (!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");

const db = this.read(this.path);
const array = [];

for (const id in db) {
const keys = { ID: id, data: db[id] };
array.push(keys);
}

const keyParts = key.split(this.separator);

return array.filter(x => {
const idIncludes = keyParts.every(part => x.ID.includes(part));

const dataIncludes = (typeof x.data === 'object') && Object.keys(x.data).some(subKey => subKey.includes(key));

return idIncludes || dataIncludes;
});
}

push(key, value) {
if(!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");
if (value === "" || value === undefined || value === null) throw new Error("Value not specified.", "ValueError");

let db = this.read(this.path);
let keyPath = key;

if (this.separator && key.includes(this.separator)) {
const keySplit = key.split(this.separator);
const lastKey = keySplit.pop();
let current = db;

for (const currentKey of keySplit) {
 if (current[currentKey] === undefined) {
 current[currentKey] = {};
 }

 current = current[currentKey];
}

keyPath = lastKey;
if (!Array.isArray(current[lastKey])) {
 current[lastKey] = [value];
} else {
 current[lastKey].push(value);
}
} else {
if (!Array.isArray(db[key])) {
 db[key] = [value];
} else {
 db[key].push(value);
}
}

this.save(this.path, db);
if(this.useEmit) { 
this.emit('push', { key, value });
}
return value;
}

pull(key, value) {
if(!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");
if (value === "" || value === undefined || value === null) throw new Error("Value not specified.", "ValueError");

let db = this.read(this.path);
let keyPath = key;
let found = false;

if (this.separator && key.includes(this.separator)) {
const keySplit = key.split(this.separator);
const lastKey = keySplit.pop();
let current = db;

for (const currentKey of keySplit) {
 if (current[currentKey] === undefined) {
 current[currentKey] = {};
 }

 current = current[currentKey];
}

keyPath = lastKey;
if (Array.isArray(current[lastKey])) {
 current[lastKey] = current[lastKey].filter((val) => {
 if (val === value) {
found = true;
return false;
 } else {
return true;
 }
 });
}
} else {
if (Array.isArray(db[key])) {
 db[key] = db[key].filter((val) => {
 if (val === value) {
found = true;
return false;
 } else {
return true;
 }
 });
}
}

if (!found) {
return null;
}

this.save(this.path, db);
if(this.useEmit) { 
this.emit('pull', { key, value });
}
return true;
}

add(key, value) {
if(!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");
if (value === "" || value === undefined || value === null) throw new Error("Value not specified.", "ValueError");
if (typeof value !== "number") throw new Error("Value must be a number.", "ValueError");

let db = this.read(this.path);

let keyParts = key.split(this.separator);

let obj = db;

for (let i = 0; i < keyParts.length - 1; i++) {
obj = obj[keyParts[i]] = obj[keyParts[i]] || {};
}

let lastKey = keyParts[keyParts.length - 1];

if (typeof obj[lastKey] === "undefined") {
obj[lastKey] = Number(value);
} else {
obj[lastKey] = Number(obj[lastKey]) + Number(value);
}

this.save(this.path, db);
if(this.useEmit) { 
this.emit('add', { key, value });
}
return obj[lastKey];
}

sub(key, value) {
if(!key) throw new Error("Key not specified.", "KeyError");
if (typeof key !== "string") throw new Error("Key needs to be a string.", "KeyError");
if (value === "" || value === undefined || value === null) throw new Error("Value not specified.", "ValueError");
if (typeof value !== "number") throw new Error("Value must be a number.", "ValueError");

let db = this.read(this.path);

let keyParts = key.split(this.separator);
let obj = db;

for (let i = 0; i < keyParts.length - 1; i++) {
obj = obj[keyParts[i]] = obj[keyParts[i]] || {};
}

let lastKey = keyParts[keyParts.length - 1];

if (typeof obj[lastKey] === "undefined") {
obj[lastKey] = -Number(value);
} else {
obj[lastKey] = Number(obj[lastKey]) - Number(value);
}

this.save(this.path, db);
if(this.useEmit) { 
this.emit('sub', { key, value });
}
return obj[lastKey];
}

}

module.exports = { JsonDatabase }
