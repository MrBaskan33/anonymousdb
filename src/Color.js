const colors = {
  black: "\x1b[30m \x1b[1m",
  red: "\x1b[31m \x1b[1m",
  green: "\x1b[32m \x1b[1m",
  yellow: "\x1b[33m \x1b[1m",
  blue: "\x1b[34m \x1b[1m",
  magenta: "\x1b[35m \x1b[1m",
  cyan: "\x1b[36m \x1b[1m",
  white: "\x1b[37m \x1b[1m",
  gray: "\x1b[90m \x1b[1m",
  reset: "\x1b[0m \x1b[1m"
}

const originalLog = console.log
console.log = function (colorOrMessage, ...messages) {
  if(typeof colorOrMessage === 'string' && colors[colorOrMessage]) {
    originalLog(`${colors[colorOrMessage]}${messages.join(" ")}${colors.reset}`)
  } else {
    originalLog(`${colors.white}${colorOrMessage}${colors.reset}`, ...messages)
  }
}

module.exports = console.log
