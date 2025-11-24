import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './router'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatbotProvider } from './contexts/ChatbotContext'
import CustomCursor from './components/common/CustomCursor/CustomCursor'
import Chatbot from './components/chatbot/Chatbot/Chatbot'
import { WishlistProvider } from './contexts/WishlistContext'
import Layout from './components/common/Layout/Layout'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ChatbotProvider>
                <Layout>
                  <div className="App">
                    <CustomCursor />
                    <main>
                      <AppRouter />
                    </main>
                    <Chatbot />
                  </div>
                </Layout>
              </ChatbotProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App