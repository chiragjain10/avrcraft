import React, { createContext, useContext, useState, useCallback } from 'react'

const ChatbotContext = createContext()

export const useChatbot = () => {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}

export const ChatbotProvider = ({ children }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AVR Craft assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const openChatbot = useCallback(() => {
    setIsChatbotOpen(true)
  }, [])

  const closeChatbot = useCallback(() => {
    setIsChatbotOpen(false)
  }, [])

  const toggleChatbot = useCallback(() => {
    setIsChatbotOpen(prev => !prev)
  }, [])

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
    }])
  }, [])

  const sendMessage = useCallback(async (messageText) => {
    // Add user message
    addMessage({
      text: messageText,
      sender: 'user',
    })

    // Simulate bot typing
    setIsTyping(true)

    // Simulate API call delay
    setTimeout(() => {
      let botResponse = "I understand you're interested in our artisan products. "

      // Simple response logic based on keywords
      if (messageText.toLowerCase().includes('price') || messageText.toLowerCase().includes('cost')) {
        botResponse += "Our prices vary based on the artisan and materials used. Would you like to browse our collections?"
      } else if (messageText.toLowerCase().includes('shipping') || messageText.toLowerCase().includes('delivery')) {
        botResponse += "We offer worldwide shipping. Standard delivery takes 7-10 business days. Express options are available."
      } else if (messageText.toLowerCase().includes('return') || messageText.toLowerCase().includes('refund')) {
        botResponse += "We offer 30-day returns on all products. Items must be in original condition. Please contact support for returns."
      } else if (messageText.toLowerCase().includes('artisan') || messageText.toLowerCase().includes('handmade')) {
        botResponse += "All our products are handmade by skilled artisans using traditional techniques. Each piece is unique and eco-friendly."
      } else if (messageText.toLowerCase().includes('material') || messageText.toLowerCase().includes('eco')) {
        botResponse += "We use only eco-friendly materials including organic textiles, natural dyes, and sustainable resources."
      } else {
        botResponse += "You can browse our collections, learn about our artisans, or contact customer support for specific questions."
      }

      addMessage({
        text: botResponse,
        sender: 'bot',
      })
      
      setIsTyping(false)
    }, 1500)
  }, [addMessage])

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AVR Craft assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      }
    ])
  }, [])

  const getQuickReplies = useCallback(() => {
    return [
      "What are your shipping options?",
      "Tell me about your artisans",
      "How eco-friendly are your products?",
      "What's your return policy?",
    ]
  }, [])

  const value = {
    isChatbotOpen,
    messages,
    isTyping,
    openChatbot,
    closeChatbot,
    toggleChatbot,
    sendMessage,
    clearMessages,
    getQuickReplies,
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}