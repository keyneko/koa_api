const { exec } = require('child_process')

function startScript() {
  const child = exec('npm run start:prod')

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error('Script crashed. Restarting...')
      startScript() // 重新启动脚本
    }
  })
}

startScript()
