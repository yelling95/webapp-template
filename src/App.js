import React from 'react'
import {useIsElectron} from './helpers'
import {MainView} from './pages'
import {createHashRouter, createBrowserRouter, RouterProvider} from 'react-router-dom'

// webapp의 라우팅은 해시url 사용해야함 createHashRouter
// web 일때 createBrowserRouter 사용
export default function App(props) {
  const isElectron = useIsElectron()

  const routerData = [
    {
      path: '/',
      element: <MainView />,
    },
  ]

  const router = isElectron ? createHashRouter(routerData) : createBrowserRouter(routerData)
  return <RouterProvider router={router} />
}
