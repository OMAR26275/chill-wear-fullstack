// Cart Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    updateCartSummary();
});

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');

    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
            <img src="http://localhost:5000/uploads/${item.image}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-size">Size: ${item.size}</div>
                <div class="cart-item-price">EGP ${item.price}</div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.size}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.size}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}', '${item.size}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update quantity
function updateQuantity(productId, size, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    
    if (newQuantity <= 0) {
        removeFromCart(productId, size);
        return;
    }

    const itemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );

    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('chillWearCart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId, size) {
    let cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    localStorage.setItem('chillWearCart', JSON.stringify(cart));
    displayCartItems();
    updateCartSummary();
    updateCartCount();
}

// Update cart summary
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over EGP 500
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `EGP ${subtotal}`;
    document.getElementById('shipping').textContent = `EGP ${shipping}`;
    document.getElementById('total').textContent = `EGP ${total}`;
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => {
        count.textContent = totalItems;
    });
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('chillWearCart');
        displayCartItems();
        updateCartCount();
    }
}
