import React from 'react'
import TopBar from './TopBar'
import MainBar from './MainBar'
import Navigation from './Navigation'
import styles from './Header.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <TopBar />
      <MainBar />
      <Navigation />
    </header>
  )
}

export default Header