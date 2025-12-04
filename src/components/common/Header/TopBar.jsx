// src/components/Header/TopBar.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.css'

const TopBar = () => {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 992
  })

  useEffect(() => {
    const onResize = () => {
      setIsCompact(window.innerWidth < 992)
    }

    // listen for resizes
    window.addEventListener('resize', onResize)
    // ensure state is correct on mount (handles SSR / hydration)
    onResize()
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Full set of links
  const leftLinks = [
    { to: '', label: '', id: 'blank' },
    { to: 'mailto:info@avrcarft.com', label: 'info@avrcarft.com', id: 'mail' },
  ]

  const rightLinks = [
    { to: '/admin', label: 'account', id: 'account', prefix: 'Q' },
    { to: '/join', label: 'JOIN plus', id: 'join', prefix: '@' },
    { to: '/wishlist', label: 'wish list', id: 'wishlist', prefix: '@' }
  ]

  // Compact mode: only show these four (order: Help, Wishlist, Blog, Gift Cards)
  const compactOrder = [
    { to: '/help', label: 'HELP', id: 'help' },
    { to: '/wishlist', label: 'wish list', id: 'wishlist', prefix: '@' },
    { to: '/blog', label: 'BLOG', id: 'blog' },
    { to: '/gift-cards', label: 'GIFT CARDS', id: 'gift-cards' }
  ]

  return (
    <div className={styles.topBar} role="region" aria-label="Top information bar">
      {isCompact ? (
        // Compact layout: show only the 4 links (split left/right for visual balance)
        <>
          <div className={styles.topBarLeft}>
            {/* show first two compact links on left */}
            {compactOrder.slice(0, 2).map(link => (
              <Link key={link.id} to={link.to} className={styles.topBarLink}>
                {link.prefix ? <span className={styles.icon} aria-hidden="true">{link.prefix}</span> : null}
                <span className={styles.topBarText}>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className={styles.topBarRight}>
            {/* show remaining two compact links on right */}
            {compactOrder.slice(2).map(link => (
              <Link key={link.id} to={link.to} className={styles.topBarLink}>
                {link.prefix ? <span className={styles.icon} aria-hidden="true">{link.prefix}</span> : null}
                <span className={styles.topBarText}>{link.label}</span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        // Full layout (desktop)
        <>
          <div className={styles.topBarLeft}>
            {leftLinks.map(l => (
              <Link key={l.id} to={l.to} className={styles.topBarLink}>{l.label}</Link>
            ))}
          </div>

          <div className={styles.topBarRight}>
            {rightLinks.map(l => (
              <Link key={l.id} to={l.to} className={styles.topBarLink}>
                {l.prefix ? <span className={styles.icon} aria-hidden="true">{l.prefix}</span> : null}
                <span className={styles.topBarText}>{l.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default TopBar
