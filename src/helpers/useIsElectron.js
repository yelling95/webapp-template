export default function useIsElectron() {
  if (window && window.process && window.process.type) {
    var userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.indexOf(' electron/') > -1) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
