import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'

const processes = [
  spawn(npmCommand, ['run', 'dev:backend'], {
    stdio: 'inherit',
    shell: isWindows,
  }),
  spawn(npmCommand, ['run', 'dev:frontend'], {
    stdio: 'inherit',
    shell: isWindows,
  }),
]

let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM')
  }

  process.exit(code)
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (!shuttingDown && code) shutdown(code)
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
