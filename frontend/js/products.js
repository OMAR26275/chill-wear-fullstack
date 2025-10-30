// Products Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllProducts();
});

// Load all products
async function loadAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        
        const response = await fetch('http://localhost:5000/api/products');
        let products;
        
        if (!response.ok) {
            // If API fails, use sample data
            products = getSampleProducts();
        } else {
            products = await response.json();
        }
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="loading">
                    <p>No products available at the moment.</p>
                    <a href="index.html" class="btn">Return Home</a>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-gallery">
                    <div class="gallery-slides">
                        ${product.images && product.images.length > 0 ? 
                            product.images.map((image, index) => `
                                <div class="gallery-slide">
                                    <img src="http://localhost:5000/uploads/${image}" 
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
                    ${product.images && product.images.length > 1 ? `
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
        `).join('');

        // Initialize galleries for the displayed products
        initializeProductGalleries();
        initializeSizeSelectors();
        
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="loading">
                <p>Error loading products. Please try again later.</p>
                <button onclick="loadAllProducts()" class="btn">Retry</button>
            </div>
        `;
    }
}

// Sample products data for fallback
function getSampleProducts() {
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
            featured: false
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
        },
        {
            _id: '5',
            name: 'Grey Jogger Pants',
            description: 'Comfortable jogger pants with modern fit.',
            price: 599,
            images: ['jogger-pants.jpg'],
            sizes: ['S', 'M', 'L', 'XL'],
            category: 'pants',
            featured: false
        },
        {
            _id: '6',
            name: 'Navy Blue Hoodie',
            description: 'Classic navy blue hoodie with premium fabric.',
            price: 849,
            images: ['navy-hoodie.jpg'],
            sizes: ['S', 'M', 'L', 'XL'],
            category: 'hoodies',
            featured: false
        }
    ];
}

// Initialize product galleries
function initializeProductGalleries() {
    document.querySelectorAll('.product-gallery').forEach(gallery => {
        if (gallery.querySelectorAll('.gallery-slide').length > 1) {
            new ProductGallery(gallery);
        }
    });
}

// Initialize size selectors
function initializeSizeSelectors() {
    document.querySelectorAll('.size-options').forEach(container => {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('size-option')) {
                container.querySelectorAll('.size-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
            }
        });
    });
}

// Product Gallery class
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

        this.init();
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
