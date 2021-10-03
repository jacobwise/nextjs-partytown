import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
// import { pageview } from '../lib/gtm'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  // useEffect(() => {
  //   router.events.on('routeChangeComplete', () => {
  //     console.log('routeChangeComplete on')
  //     pageview
  //   })
  //   return () => {
  //     router.events.off('routeChangeComplete', () => {
  //       console.log('routeChangeComplete off')
  //       pageview
  //     })
  //   }
  // }, [router.events])
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
