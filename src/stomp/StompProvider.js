import React from 'react'
import SockJS from 'sockjs-client'
import {Client} from '@stomp/stompjs'
import {storage} from '../helpers'
import APIConfig from '../services/api.config'

const defaultValue = {
  isConnected: false,
  stompClient: null,
  subscriptions: {},
  setSubscriptions: () => {},
}

export const StompContext = React.createContext(defaultValue)
export const StompProvider = ({children, config, onConnected}) => {
  const [stompClient, setStompClient] = React.useState(
    () =>
      new Client({
        // brokerURL: 'wss://data-api.webappdev.xergy.ai/ws', //ws://~ wss://~ // 웹소켓 서버로 직접 접속
        webSocketFactory: () => new SockJS('https://data-api.webappdev.xergy.ai' + `/ws`), // proxy를 통한 접속
        connectHeaders: {
          Authorization: storage.get('accessToken') ? `Bearer ${storage.get('accessToken')}` : '',
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (frame) => {
          console.log(frame)
        },
        onUnhandledMessage: () => {
          console.log('unhandle')
        },
        ...config,
      }),
  )
  const [subscriptions, setSubscriptions] = React.useState({})

  React.useEffect(() => {
    stompClient?.activate()
    onConnected?.(stompClient)
    return () => {
      stompClient?.deactivate()
    }
  }, [stompClient])

  return (
    <StompContext.Provider
      value={{
        stompClient,
        subscriptions,
        setSubscriptions,
      }}>
      {children}
    </StompContext.Provider>
  )
}
