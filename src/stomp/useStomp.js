import React from 'react'
import {StompContext} from './StompProvider'

export const useStomp = () => {
  const value = React.useContext(StompContext)
  const {stompClient, subscriptions, setSubscriptions} = value

  const send = (path, body, headers) => {
    stompClient?.publish({
      destination: path,
      headers,
      body: JSON.stringify(body),
    })
  }

  const subscribe = (path, callback) => {
    if (!stompClient) return
    if (subscriptions[path]) return

    const subscription = stompClient.subscribe(path, (message) => {
      const body = JSON.parse(message.body)
      callback(body)
    })
    setSubscriptions((prev) => {
      return {...prev, [path]: subscription}
    })
  }

  const unsubscribe = (path) => {
    const copy = {...subscriptions}
    copy[path].unsubscribe()
    delete copy[path]
    setSubscriptions((prev) => {
      return {...copy}
    })
  }

  const disconnect = () => {
    stompClient?.deactivate()
  }

  return {
    disconnect,
    subscribe,
    unsubscribe,
    subscriptions,
    send,
    isConnected: !!stompClient?.connected,
  }
}
