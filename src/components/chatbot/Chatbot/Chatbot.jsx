import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Minimize2, Bot, User } from 'lucide-react'
import { useChatbot } from '../../../contexts/ChatbotContext'
import ChatMessage from '../ChatMessage/ChatMessage'
import ChatbotToggle from '../ChatbotToggle/ChatbotToggle'
import styles from './Chatbot.module.css'

const Chatbot = () => {
  const {
    isChatbotOpen,
    messages,
    isTyping,
    sendMessage,
    closeChatbot,
    getQuickReplies
  } = useChatbot()

  const [inputMessage, setInputMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isChatbotOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isChatbotOpen])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleQuickReply = (reply) => {
    sendMessage(reply)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  if (!isChatbotOpen) {
    return <ChatbotToggle />
  }

  return (
    <>
      <ChatbotToggle />
      
      <div className={`${styles.chatbot} ${isMinimized ? styles.minimized : ''}`}>
        {/* Chatbot Header */}
        <div className={styles.chatbotHeader}>
          <div className={styles.chatbotInfo}>
            <div className={styles.botAvatar}>
              <Bot size={20} />
            </div>
            <div>
              <h3 className={styles.chatbotTitle}>AVR Craft Assistant</h3>
              <p className={styles.chatbotSubtitle}>
                {isTyping ? 'Typing...' : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          
          <div className={styles.chatbotActions}>
            <button 
              className={styles.headerButton}
              onClick={handleMinimize}
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              <Minimize2 size={16} />
            </button>
            <button 
              className={styles.headerButton}
              onClick={closeChatbot}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className={styles.chatbotMessages}>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className={styles.typingText}>AVR Assistant is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && !isTyping && (
              <div className={styles.quickReplies}>
                <p className={styles.quickRepliesTitle}>Quick questions:</p>
                <div className={styles.quickRepliesGrid}>
                  {getQuickReplies().map((reply, index) => (
                    <button
                      key={index}
                      className={styles.quickReply}
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className={styles.chatbotInput}>
              <div className={styles.inputContainer}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={styles.messageInput}
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
}

export default Chatbot