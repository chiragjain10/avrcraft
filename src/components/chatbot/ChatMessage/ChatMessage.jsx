import React from 'react'
import { User, Bot, Clock } from 'lucide-react'
import styles from './ChatMessage.module.css'

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot'
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className={`${styles.message} ${isBot ? styles.botMessage : styles.userMessage}`}>
      <div className={styles.messageAvatar}>
        {isBot ? (
          <div className={styles.botAvatar}>
            <Bot size={16} />
          </div>
        ) : (
          <div className={styles.userAvatar}>
            <User size={16} />
          </div>
        )}
      </div>
      
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <p className={styles.messageText}>{message.text}</p>
        </div>
        
        <div className={styles.messageTime}>
          <Clock size={12} />
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage