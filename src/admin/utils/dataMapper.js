// src/utils/dataMapper.js

/**
 * Converts old project data to new project format
 * @param {Array} oldData - JSON data from old project
 * @returns {Array} - Mapped data for new project
 */
export function mapOldProductsToNew(oldData) {
    return oldData.map(oldProduct => {
        const newProduct = {
            // Direct mappings
            name: oldProduct.title || '',
            description: oldProduct.description || '',
            category: oldProduct.category || 'Books',
            price: oldProduct.price || 0,
            originalPrice: oldProduct.maxPrice || null,
            stock: oldProduct.stock || 0,

            // Image mapping
            images: oldProduct.images || [],
            imageUrl: oldProduct.images?.[0] || '',

            // Navigation flags based on category
            isBestseller: false, // Default, can be calculated from rating
            isFiction: oldProduct.category === 'Fiction',
            isNonFiction: oldProduct.category === 'Non-Fiction',
            isChildrens: oldProduct.category === "Children's Books" || false,
            isStationery: oldProduct.category === 'Stationery',
            isGift: oldProduct.category === 'Gifts',

            // Additional flags from old data
            isChristmas: oldProduct.productTypes?.includes('christmas') || false,
            isHighlight: oldProduct.featured || false,
            isGame: oldProduct.category === 'Games',
            isNew: oldProduct.productTypes?.includes('newArrivals') || false,
            isActive: true, // Default active

            // Tags from old data
            tags: [],
            author: '' // Default, can be extracted from description if needed
        };

        // Add subcategory to tags
        if (oldProduct.subcategory) {
            newProduct.tags.push(oldProduct.subcategory);
        }

        // Add productTypes to tags
        if (oldProduct.productTypes && Array.isArray(oldProduct.productTypes)) {
            oldProduct.productTypes.forEach(type => {
                if (!newProduct.tags.includes(type)) {
                    newProduct.tags.push(type);
                }
            });
        }

        // Set bestseller if rating is high
        if (oldProduct.rating && oldProduct.rating >= 4) {
            newProduct.isBestseller = true;
            newProduct.tags.push('bestseller');
        }

        // Set trending
        if (oldProduct.trending) {
            newProduct.tags.push('trending');
        }

        // Add timestamp if exists
        if (oldProduct.createdAt && oldProduct.createdAt._seconds) {
            newProduct.createdAt = {
                seconds: oldProduct.createdAt._seconds,
                nanoseconds: oldProduct.createdAt._nanoseconds || 0
            };
        }

        if (oldProduct.updatedAt && oldProduct.updatedAt._seconds) {
            newProduct.updatedAt = {
                seconds: oldProduct.updatedAt._seconds,
                nanoseconds: oldProduct.updatedAt._nanoseconds || 0
            };
        }

        return newProduct;
    });
}

/**
 * Validates if a product has all required fields
 * @param {Object} product - Product object
 * @returns {boolean} - True if valid
 */
export function validateProduct(product, isUpdate = false) {
    const isValid = product.name &&
        product.category &&
        typeof product.price === 'number' &&
        typeof product.stock === 'number';

    if (isUpdate) {
        return isValid && product.id;
    }

    return isValid;
}