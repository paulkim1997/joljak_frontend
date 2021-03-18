import io from 'socket.io-client'

let socketManager = null
const ipAddress = process.env.NODE_ENV == 'production' ? 'http://000.000.000.000:10001' : 'http://localhost:10001/'

function initEcarListHandler(movePlatformReply, reqOutEmtpyCar, reqOnlineYn, refreshEcarList) {
  socketManager = io.connect(ipAddress)
  socketManager.on('movePlatformReply', movePlatformReply)
  socketManager.on('reqOutEmtpyCar', reqOutEmtpyCar)
  socketManager.on('reqOnlineYn', reqOnlineYn)
  socketManager.on('refreshEcarList', refreshEcarList)
}

function initOcarListHandler(refreshOcarList) {
  socketManager = io.connect(ipAddress)
  socketManager.on('refreshOcarList', refreshOcarList)
}

function emit(command, data) {
  socketManager.emit(command, data)
}

function disconnect() {
  socketManager.disconnect()
}

export default {
  initEcarListHandler,
  initOcarListHandler,
  emit,
  disconnect,
}
