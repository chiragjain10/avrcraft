// src/components/common/ScrollToTop/ScrollToTop.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // instant scroll to top
    window.scrollTo(0, 0)
    // If you want smooth behavior, use:
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}
