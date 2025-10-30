// Products Page JavaScript

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;

// Initialize products page
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllProducts();
    initializeFilters();
    initializeSorting();
});

// Load all products
async function loadAllProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
        
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        updateLoadMoreButton();
        
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

// Display products with pagination
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(0, endIndex);

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="loading">
                <p>No products found matching your criteria.</p>
                <button onclick="clearFilters()" class="btn">Clear Filters</button>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = productsToShow.map(product => `
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

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

// Apply filters and sorting
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    // Filter by category
    const selectedCategory = categoryFilter.value;
    filteredProducts = allProducts.filter(product => 
        selectedCategory === 'all' || product.category === selectedCategory
    );

    // Sort products
    const sortBy = sortFilter.value;
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    currentPage = 1;
    displayProducts();
    updateLoadMoreButton();
}

// Clear all filters
function clearFilters() {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('sortFilter').value = 'newest';
    applyFilters();
}

// Initialize sorting
function initializeSorting() {
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

// Load more products
function loadMoreProducts() {
    currentPage++;
    displayProducts();
    updateLoadMoreButton();
}

// Update load more button visibility
function updateLoadMoreButton() {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadMoreContainer && loadMoreBtn) {
        const hasMoreProducts = filteredProducts.length > currentPage * productsPerPage;
        
        if (hasMoreProducts) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.onclick = loadMoreProducts;
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Product Gallery class (same as in main.js but included for completeness)
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
