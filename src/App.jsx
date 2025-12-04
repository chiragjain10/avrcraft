import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './router'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatbotProvider } from './contexts/ChatbotContext'
import { WishlistProvider } from './contexts/WishlistContext'
import { SearchProvider } from './contexts/SearchContext'
import CustomCursor from './components/common/CustomCursor/CustomCursor'
import Chatbot from './components/chatbot/Chatbot/Chatbot'
import Layout from './components/common/Layout/Layout'
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <ChatbotProvider>
                  <ScrollToTop />
                  <Layout key={location.pathname}>
                    <div className="App">
                      <CustomCursor />
                      <main>
                        <AppRouter />
                      </main>
                      <Chatbot />
                    </div>
                  </Layout>
                </ChatbotProvider>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App