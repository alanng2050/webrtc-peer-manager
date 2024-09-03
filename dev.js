const { exec } = require('node:child_process')
const path = require('node:path')

const distDir = path.resolve(__dirname, 'dist')

const buildWatch = () => {
  exec('tsc --watch')
  console.log('tsc: Watching files...')

  exec('tsc-alias --watch')
  console.log(`tsc-alias: Watching files...`)
}

exec(`rm -rf ${distDir}`, (err) => {
  if (err) console.log(err)
  else {
    buildWatch()
  }
})
