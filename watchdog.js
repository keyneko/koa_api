const { exec } = require('child_process')
let childProcess

function startScript() {
  childProcess = exec('npm run start:prod')

  childProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('Script crashed. Restarting...')
      startScript() // 重新启动脚本
    }
  })
}

function stopScript() {
  if (childProcess) {
    childProcess.kill('SIGTERM') // 尝试优雅地停止
    childProcess = null
  }
}

// 监听 SIGTERM 信号
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping child process...')
  stopScript()
  process.exit(0) // 退出 watchdog.js 进程
})

startScript()
