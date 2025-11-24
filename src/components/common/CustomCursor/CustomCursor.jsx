import React, { useState, useEffect } from 'react'
import styles from './CustomCursor.module.css'

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const updateCursorPosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateCursorType = () => {
      const hoveredElement = document.elementFromPoint(position.x, position.y)
      if (hoveredElement) {
        const computedStyle = window.getComputedStyle(hoveredElement)
        const isClickable = 
          hoveredElement.tagName === 'BUTTON' ||
          hoveredElement.tagName === 'A' ||
          computedStyle.cursor === 'pointer' ||
          hoveredElement.closest('button') ||
          hoveredElement.closest('a')
        
        setIsPointer(isClickable)
      }
    }

    document.addEventListener('mousemove', updateCursorPosition)
    document.addEventListener('mousemove', updateCursorType)

    return () => {
      document.removeEventListener('mousemove', updateCursorPosition)
      document.removeEventListener('mousemove', updateCursorType)
    }
  }, [position])

  return (
    <>
      <div 
        className={`${styles.cursor} ${isPointer ? styles.pointer : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div 
        className={`${styles.cursorFollower} ${isPointer ? styles.pointer : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}

export default CustomCursor