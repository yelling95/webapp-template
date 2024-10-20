import React from 'react'

export default function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState([0, 0])
  const updateWindowSize = () => {
    setWindowSize([window.innerWidth, window.innerHeight])
  }
  React.useLayoutEffect(() => {
    window.addEventListener('resize', updateWindowSize)
    updateWindowSize()
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])
  return [windowSize[0], windowSize[1]]
}
