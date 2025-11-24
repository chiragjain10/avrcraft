@echo off
echo Creating AVR Craft project structure...

mkdir avr-craft
cd avr-craft
mkdir public\artisan-icons
mkdir public\images\hero
mkdir public\images\products
mkdir public\images\categories
mkdir public\images\artisans

mkdir src\components\common\Header
mkdir src\components\common\Footer
mkdir src\components\common\CustomCursor
mkdir src\components\common\Loading
mkdir src\components\common\buttons

mkdir src\components\home\Hero
mkdir src\components\home\Categories
mkdir src\components\home\TrendingProducts
mkdir src\components\home\ArtisanSpotlight
mkdir src\components\home\Newsletter

mkdir src\components\products\ProductGrid
mkdir src\components\products\ProductFilters
mkdir src\components\products\ProductDetail
mkdir src\components\products\Search

mkdir src\components\cart\CartSidebar
mkdir src\components\cart\CartItem
mkdir src\components\cart\Checkout

mkdir src\components\auth\Login
mkdir src\components\auth\Register
mkdir src\components\auth\Profile

mkdir src\components\chatbot\Chatbot
mkdir src\components\chatbot\ChatbotToggle

mkdir src\pages\Home
mkdir src\pages\Shop
mkdir src\pages\ProductDetail
mkdir src\pages\About
mkdir src\pages\Contact
mkdir src\pages\Cart
mkdir src\pages\Auth

mkdir src\contexts
mkdir src\hooks
mkdir src\utils\firebase
mkdir src\utils\constants
mkdir src\utils\helpers
mkdir src\utils\services
mkdir src\styles

echo Creating files...
for /r %%f in (*.jsx *.js *.css *.json *.config.js) do type nul > "%%f"

echo Project structure created successfully!
pause