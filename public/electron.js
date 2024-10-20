const {app, BrowserWindow, dialog, Menu} = require('electron')
const ProgressBar = require('electron-progressbar')

const path = require('path')
const isDev = require('electron-is-dev')

const {autoUpdater} = require('electron-updater')
const log = require('electron-log')

const remote = require('@electron/remote/main')
remote.initialize()

let mainWindow
let progressBar

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  })

  const isMac = process.platform === 'darwin'
  const template = [
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              {role: 'about'},
              {label: `Version ${app.getVersion()}`, enabled: false},
              {type: 'separator'},
              {role: 'services'},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideothers'},
              {role: 'unhide'},
              {type: 'separator'},
              {role: 'quit'},
            ],
          },
        ]
      : []),
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forceReload'},
        {role: 'toggleDevTools'},
        {type: 'separator'},
        {role: 'resetZoom'},
        {role: 'zoomIn'},
        {role: 'zoomOut'},
        {type: 'separator'},
        {role: 'togglefullscreen'},
      ],
    },
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        ...(isMac
          ? [{type: 'separator'}, {role: 'front'}, {type: 'separator'}, {role: 'window'}]
          : [{role: 'close'}]),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`,
  )

  if (isDev) {
    mainWindow.webContents.openDevTools({mode: 'detach'})
  }
  remote.enable(mainWindow.webContents)
}

/* Updater ======================================================*/
autoUpdater.autoDownload = false
autoUpdater.setFeedURL('https://xg-electron-publish.s3.ap-northeast-2.amazonaws.com/webapp')

autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...')
})
autoUpdater.on('update-available', (info) => {
  dialog
    .showMessageBox({
      type: 'info',
      title: '업데이트 가능합니다.',
      message: '새로운 버전으로 업데이트 가능합니다. 업데이트 하시겠습니까?',
      buttons: ['업데이트', '나중에'],
    })
    .then((result) => {
      const buttonIndex = result.response

      if (buttonIndex === 0) autoUpdater.downloadUpdate()
    })
})
autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.')
})
autoUpdater.on('error', (err) => {
  log.info('에러가 발생하였습니다. 에러내용 : ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = '다운로드 속도: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  log.info(log_message)
  mainWindow.setProgressBar(progressObj.percent / 100)
})

autoUpdater.once('download-progress', (progressObj) => {
  progressBar = new ProgressBar({
    text: '다운로드 중...',
    detail: '다운로드 중입니다. 잠시만기다려 주세요.',
  })

  progressBar
    .on('completed', function () {
      console.info(`completed...`)
      progressBar.detail = 'Task completed. Exiting...'
    })
    .on('aborted', function () {
      console.info(`aborted...`)
    })
})

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.setProgressBar(1 * -1)
  progressBar.setCompleted()
  log.info('업데이트가 완료되었습니다.')
  dialog
    .showMessageBox({
      type: 'info',
      buttons: ['재시작', '종료'],
      title: '업데이트 중입니다.',
      message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
      detail:
        '새로운 버전이 다운로드 되었습니다. 애플리케이션을 재시작하여 업데이트를 적용해 주세요.',
    })
    .then((result) => {
      const buttonIndex = result.response
      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall()
      } else {
        app.quit()
        app.exit()
      }
    })
})

/* Electron =====================================================*/

/** 초기화가 끝나게 되면 실행 */
app.on('ready', () => {
  // 메인 창 생성
  createWindow()

  // 자동 업데이트 등록
  autoUpdater.checkForUpdates()
})

/** [생명주기] 모든 창이 닫히면 자동으로 앱 종료 */
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('activate', function () {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })
