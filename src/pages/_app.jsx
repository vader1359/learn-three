import { useRouter } from 'next/router'
import useStore from '@/helpers/store'
import { useEffect, Children } from 'react'
import Header from '../config'
import dynamic from 'next/dynamic'
import Dom from '@/components/layout/_dom'
import { createGlobalStyle } from 'styled-components'

import '@/styles/index.css'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`

let LCanvas = null
if (process.env.NODE_ENV === 'production') {
  LCanvas = dynamic(() => import('@/components/layout/_canvas'), {
    ssr: false,
  })
} else {
  LCanvas = require('@/components/layout/_canvas').default
}

function Layout({ dom }) {
  return (
    <>
      <Header />
      {dom && <Dom>{dom}</Dom>}
    </>
  )
}

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  let r3fArr = []
  let compArr = []

  Children.forEach(Component(pageProps).props.children, (child) => {
    if (child.props && child.props.r3f) {
      r3fArr.push(child)
    } else {
      compArr.push(child)
    }
  })

  useEffect(() => {
    useStore.setState({ router })
  }, [router])

  return (
    <>
      <GlobalStyle />
      {compArr && <Layout dom={compArr} />}
      {r3fArr && <LCanvas>{r3fArr}</LCanvas>}
    </>
  )
}

export default MyApp
