import {configureStore, isRejectedWithValue} from '@reduxjs/toolkit'
import rootReducer from '../actions'
import {authActions} from '../actions/auth.action'
import {useIsElectron} from '.'

export const handleError = (api) => (next) => (action) => {
  // api 요청 전 토큰 유효기간 확인 (1분전)
  // api 요청 후 뒷단에서 엑세스 토큰 관련 에러가 날 경우 로그아웃 처리
  //  -> (요청 전 유효기간은 확인 했음으로 토큰이 일치 하지 않을 가능성 높음)
  const isElectron = useIsElectron()
  if (isRejectedWithValue(action)) {
    if (action.payload.code === 401) {
      api.dispatch(authActions.resetAuthState())

      if (isElectron) {
        window.location.hash = '#/logout'
      } else {
        window.location.href = '/logout'
      }
    }
  }

  return next(action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({serializableCheck: false}).concat(handleError),
})
