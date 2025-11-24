import React from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useChatbot } from '../../../contexts/ChatbotContext'
import styles from './ChatbotToggle.module.css'

const ChatbotToggle = () => {
  const { isChatbotOpen, toggleChatbot } = useChatbot()

  return (
    <button 
      className={`${styles.chatbotToggle} ${isChatbotOpen ? styles.open : ''}`}
      onClick={toggleChatbot}
      aria-label={isChatbotOpen ? 'Close chatbot' : 'Open chatbot'}
    >
      {isChatbotOpen ? (
        <X size={24} />
      ) : (
        <>
          <MessageCircle size={24} />
          <span className={styles.notificationDot}></span>
        </>
      )}
    </button>
  )
}

export default ChatbotToggle