import React from 'react'
import mqtt from 'mqtt/dist/mqtt'

import './Main.scss'

function MainView(props) {
  const [client, setClient] = React.useState(null)
  const [connectStatus, setConnectStatus] = React.useState(null)
  const [payload, setPayload] = React.useState(null)

  // const mqttConnect = (host, mqttOption) => {
  //   setConnectStatus('Connecting')
  //   setClient(mqtt.connect(host, mqttOption))
  // }

  // const mqttPublish = (context) => {
  //   if (client) {
  //     const {topic, qos, payload} = context
  //     client.publish(topic, payload, {qos}, (error) => {
  //       if (error) {
  //         console.log('Publish error: ', error)
  //       }
  //     })
  //   }
  // }

  // React.useEffect(() => {
  //   if (client) {
  //     client.on('connect', () => {
  //       setConnectStatus('Connected')
  //     })
  //     client.on('error', (err) => {
  //       console.error('Connection error: ', err)
  //       client.end()
  //     })
  //     client.on('reconnect', () => {
  //       setConnectStatus('Reconnecting')
  //     })
  //     client.on('message', (topic, message) => {
  //       const payload = {topic, message: message.toString()}
  //       setPayload(payload)
  //     })
  //   }
  // }, [client])

  // React.useEffect(() => {
  //   const host = 'broker.emqx.io'
  //   const port = 8083

  //   const url = `ws://${host}:${port}/mqtt`
  //   const options = {
  //     clientId: 'test1234',
  //     keepalive: 60,
  //     protocolId: 'MQTT',
  //     protocolVersion: 4,
  //     clean: true,
  //     reconnectPeriod: 1000,
  //     connectTimeout: 30 * 1000,
  //     will: {
  //       topic: 'WillMsg',
  //       payload: 'Connection Closed abnormally..!',
  //       qos: 0,
  //       retain: false,
  //     },
  //     rejectUnauthorized: false,
  //   }
  //   // options.username = username;
  //   // options.password = password;

  //   mqttConnect(url, options)
  // }, [])

  return (
    <div className="main_container">
      <p>HI ::: {connectStatus}</p>
      <div>payload ::: {payload}</div>
      <button
        onClick={() => {
          mqttPublish({
            topic: 'test1',
            qos: 0,
            payload: 'JSON',
          })
        }}>
        test
      </button>
    </div>
  )
}

export default MainView
