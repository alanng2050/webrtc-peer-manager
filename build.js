const { exec } = require('node:child_process')
const path = require('node:path')

const build = async () => {
  console.log('Building...')
  exec('tsc', () => {
    console.log('Replacing path alias...')
    exec('tsc-alias', () => {
      console.log('Finished')
    })
  })
}

const distDir = path.resolve(__dirname, 'dist')
exec(`rm -rf ${distDir}`, (err) => {
  if (err) console.log(err)
  else {
    build()
  }
})
