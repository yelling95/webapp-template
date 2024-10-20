import axios from 'axios'
import APIConfig from '../services/api.config'
import {storage, useIsElectron} from '.'

export default class Axios {
  static instance = null

  constructor() {
    this.isElectron = useIsElectron()
    this.session = axios.create()

    this.session.interceptors.response.use(
      (response) => {
        return response
      },
      async (err) => {
        const originalConfig = err.config
        if (err.response) {
          // accessToken 만료
          // (_retry = true) : 다시호출한 액션인데 401 에러가 나는 경우는 에러로 떨어져서 redux 미들웨어에서 걸리게 한다
          if (err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true

            const response = await axios.post(
              `${APIConfig.url}/auth/reissue`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${this.refreshToken}`,
                },
              },
            )

            if (response.data.code === 200) {
              const {accessToken, refreshToken} = response.data.data
              storage.set('accessToken', accessToken)
              storage.set('refreshToken', refreshToken)
              this.deleteToken()

              originalConfig.headers.Authorization = `Bearer ${accessToken}`
              return axios(originalConfig)
            } else {
              storage.clear()
              Axios.instance.goLogout()
            }
          }
        }

        return Promise.reject(err)
      },
    )
  }

  static getInstance(type = null) {
    if (Axios.instance === null) {
      // instance 가 없는 경우 새롭게 세팅
      Axios.instance = new Axios()
      if (type === 'deleteHeader') {
        Axios.instance.deleteFileHeader()
      } else {
        if (Axios.instance.getToken()) {
          if (type === 'file') {
            Axios.instance.setFileHeader()
          }
          if (type === 'refresh') {
            Axios.instance.setRefreshToken()
          }
          Axios.instance.setToken()
        } else {
          Axios.instance.deleteToken()
        }
      }
    } else {
      if (!!type) {
        // instance 는 있으나 type 에 따라 새로 세팅
        switch (type) {
          case 'deleteHeader':
            Axios.instance.deleteFileHeader()
            break
          case 'file':
            Axios.instance.setFileHeader()
            break
          case 'refresh':
            Axios.instance.setRefreshToken()
          default:
            break
        }
      }
    }

    return this.instance
  }

  getToken = () => {
    this.token = storage.get('accessToken')
    this.refreshToken = storage.get('refreshToken')
    return !!this.token
  }

  setToken = (token) => {
    if (token) {
      this.token = token
    }
    this.session.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
  }

  deleteToken = () => {
    delete this.session.defaults.headers.common['Authorization']
    Axios.instance = null
  }

  setRefreshToken = (refreshToken) => {
    if (refreshToken) {
      this.refreshToken = refreshToken
    }
    this.session.defaults.headers.common['Refresh'] = `Bearer ${this.refreshToken}`
  }

  deleteRefreshToken = () => {
    delete this.session.defaults.headers.common['Refresh']
  }

  setFileHeader = () => {
    this.session.defaults.headers.common['Content-Type'] = 'multipart/form-data'
  }

  deleteFileHeader = () => {
    delete this.session.defaults.headers.common['Content-Type']
  }

  setCache = (params) => {
    const url = params[0]
    if (url) {
      // const cache = session.get('cache') ? session.get('cache') : []
      const bypassCache = ['mapi.companywe.co.kr']
      const isBypass = bypassCache.filter((bypass) => url.indexOf(bypass) > -1).length > 0
      // const isNoCache = _.indexOf(cache, url) < 0

      if (!isBypass) {
        this.session.defaults.headers['Cache-Control'] = 'no-cache'
        // cache.push(url)
        // session.set('cache', cache)
      } else {
        delete this.session.defaults.headers['Cache-Control']
      }
    }
    return this.session
  }

  deleteCache = () => {
    session.remove('cache')
  }

  goLogout = () => {
    if (this.isElectron) {
      window.location.hash = '#/logout'
    } else {
      window.location.href = '/logout'
    }
  }

  get = (...params) => this.session.get(...params)
  post = (...params) => this.session.post(...params)
  put = (...params) => this.session.put(...params)
  patch = (...params) => this.session.patch(...params)
  delete = (...params) => this.session.delete(...params)
}
