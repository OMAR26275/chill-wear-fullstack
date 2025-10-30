// Main JavaScript for Chill Wear Website

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Cart functionality
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const cart = localStorage.getItem('chillWearCart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart() {
        localStorage.setItem('chillWearCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    addItem(product, size, quantity = 1) {
        const existingItem = this.items.find(item => 
            item.id === product._id && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images && product.images[0] ? product.images[0] : 'default.jpg',
                size: size,
                quantity: quantity
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`);
    }

    removeItem(productId, size) {
        this.items = this.items.filter(item => 
            !(item.id === productId && item.size === size)
        );
        this.saveCart();
    }

    updateQuantity(productId, size, quantity) {
        const item = this.items.find(item => 
            item.id === productId && item.size === size
        );
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId, size);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #4cc9f0;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Product Gallery functionality
class ProductGallery {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelector('.gallery-slides');
        this.images = container.querySelectorAll('.gallery-slide');
        this.dots = container.querySelectorAll('.gallery-dot');
        this.prevBtn = container.querySelector('.prev-btn');
        this.nextBtn = container.querySelector('.next-btn');
        
        this.currentIndex = 0;
        this.totalSlides = this.images.length;

        if (this.totalSlides > 1) {
            this.init();
        }
    }

    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        this.updateDots();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.slides.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.updateDots();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(this.currentIndex);
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(this.currentIndex);
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
}

// API Service
class ApiService {
    static async fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                // If API fails, use sample data
                return this.getSampleProducts();
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            // Return sample data if API is not available
            return this.getSampleProducts();
        }
    }

    static getSampleProducts() {
        return [
            {
                _id: '1',
                name: 'BOSS Hoodie',
                description: 'Premium BOSS hoodie with comfortable fit and iconic branding.',
                price: 1299,
                images: ['boss-hoodie.jpg'],
                sizes: ['S', 'M', 'L', 'XL'],
                category: 'hoodies',
                featured: true
            },
            {
                _id: '2',
                name: 'Urban Denim Jacket',
                description: 'Classic denim jacket with modern fit, perfect for layering.',
                price: 1199,
                images: ['denim-jacket.jpg'],
                sizes: ['S', 'M', 'L', 'XL'],
                category: 'jackets',
                featured: true
            },
            {
                _id: '3',
                name: 'Premium Black Hoodie',
                description: 'Our signature hoodie made with premium cotton blend for ultimate comfort.',
                price: 899,
                images: ['black-hoodie.jpg'],
                sizes: ['S', 'M', 'L', 'XL'],
                category: 'hoodies',
                featured: true
            },
            {
                _id: '4',
                name: 'Classic White Tee',
                description: 'Essential cotton t-shirt for everyday wear.',
                price: 349,
                images: ['white-tee.jpg'],
                sizes: ['S', 'M', 'L', 'XL'],
                category: 'tshirts',
                featured: false
            }
        ];
    }

    static async fetchFeaturedProducts() {
        const products = await this.fetchProducts();
        return products.filter(product => product.featured).slice(0, 4);
    }
}

// Product rendering
class ProductRenderer {
    static renderProduct(product) {
        const hasMultipleImages = product.images && product.images.length > 1;
        
        return `
            <div class="product-card">
                <div class="product-gallery">
                    <div class="gallery-slides">
                        ${product.images && product.images.length > 0 ? 
                            product.images.map((image, index) => `
                                <div class="gallery-slide">
                                    <img src="${API_BASE_URL}/uploads/${image}" 
                                         alt="${product.name}" 
                                         class="product-image"
                                         onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                                </div>
                            `).join('') :
                            `<div class="gallery-slide">
                                <img src="https://via.placeholder.com/300x300?text=No+Image" 
                                     alt="${product.name}" 
                                     class="product-image">
                            </div>`
                        }
                    </div>
                    ${hasMultipleImages ? `
                        <div class="gallery-nav">
                            <button class="gallery-btn prev-btn">‹</button>
                            <button class="gallery-btn next-btn">›</button>
                        </div>
                        <div class="gallery-dots">
                            ${product.images.map((_, index) => `
                                <button class="gallery-dot ${index === 0 ? 'active' : ''}" 
                                        data-index="${index}"></button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">EGP ${product.price}</div>
                    <div class="size-selector">
                        <label>Size:</label>
                        <div class="size-options">
                            ${(product.sizes || ['S', 'M', 'L', 'XL']).map(size => `
                                <button class="size-option ${size === 'L' ? 'selected' : ''}" 
                                        data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="buy-btn" 
                                onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.images && product.images[0] ? product.images[0] : ''}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static initializeProductGalleries() {
        document.querySelectorAll('.product-gallery').forEach(gallery => {
            if (gallery.querySelectorAll('.gallery-slide').length > 1) {
                new ProductGallery(gallery);
            }
        });
    }

    static initializeSizeSelectors() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('size-option')) {
                const sizeOptions = e.target.closest('.size-options');
                sizeOptions.querySelectorAll('.size-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
            }
        });
    }
}

// Global function to add to cart
function addToCart(productId, productName, productPrice, productImage) {
    const product = {
        _id: productId,
        name: productName,
        price: productPrice,
        images: productImage ? [productImage] : []
    };
    
    // Get selected size from the product card
    const productCard = event.target.closest('.product-card');
    let size = 'L'; // default size
    
    if (productCard) {
        const selectedSizeOption = productCard.querySelector('.size-option.selected');
        if (selectedSizeOption) {
            size = selectedSizeOption.dataset.size;
        }
    }

    cart.addItem(product, size);
}

// Load featured products on homepage
async function loadFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredProducts');
    if (!featuredGrid) return;

    try {
        const products = await ApiService.fetchFeaturedProducts();
        
        if (products.length === 0) {
            featuredGrid.innerHTML = `
                <div class="loading">
                    <p>No featured products available at the moment.</p>
                    <a href="products.html" class="btn">Browse All Products</a>
                </div>
            `;
            return;
        }

        featuredGrid.innerHTML = products.map(product => 
            ProductRenderer.renderProduct(product)
        ).join('');

        ProductRenderer.initializeProductGalleries();
        ProductRenderer.initializeSizeSelectors();
    } catch (error) {
        featuredGrid.innerHTML = `
            <div class="loading">
                <p>Error loading products. Please try again later.</p>
            </div>
        `;
    }
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    initializeContactForm();
    
    // Initialize all product galleries and size selectors
    ProductRenderer.initializeProductGalleries();
    ProductRenderer.initializeSizeSelectors();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);
