// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    initializeCheckoutForm();
});

// Display order summary
function displayOrderSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">
                    Size: ${item.size} | Qty: ${item.quantity}
                </div>
            </div>
            <div class="order-item-price">EGP ${item.price * item.quantity}</div>
        </div>
    `).join('');

    updateOrderTotals();
}

// Update order totals
function updateOrderTotals() {
    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    document.getElementById('orderSubtotal').textContent = `EGP ${subtotal}`;
    document.getElementById('orderShipping').textContent = `EGP ${shipping}`;
    document.getElementById('orderTotal').textContent = `EGP ${total}`;
}

// Initialize checkout form
function initializeCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        await processOrder();
    });

    // Real-time validation
    const inputs = checkoutForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    field.classList.remove('error');
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    switch (field.id) {
        case 'email':
            if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'phone':
            if (!isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
        case 'cardNumber':
            if (!isValidCardNumber(value)) {
                showFieldError(field, 'Please enter a valid card number');
                return false;
            }
            break;
        case 'expiryDate':
            if (!isValidExpiryDate(value)) {
                showFieldError(field, 'Please enter a valid expiry date (MM/YY)');
                return false;
            }
            break;
        case 'cvv':
            if (!isValidCVV(value)) {
                showFieldError(field, 'Please enter a valid CVV');
                return false;
            }
            break;
    }

    return true;
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        const event = new Event('blur');
        input.dispatchEvent(event);
        
        if (input.classList.contains('error')) {
            isValid = false;
        }
    });

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    `;
    
    field.parentNode.appendChild(errorElement);
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
}

function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, '');
    return /^\d{16}$/.test(cleaned);
}

function isValidExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) return false;

    const [month, year] = expiryDate.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;

    return true;
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

// Process order
async function processOrder() {
    const form = document.getElementById('checkoutForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
        // Show loading state
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;

        // Get form data
        const formData = {
            shipping: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zipCode: document.getElementById('zipCode').value
            },
            payment: {
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('cardName').value
            },
            items: JSON.parse(localStorage.getItem('chillWearCart') || '[]'),
            total: document.getElementById('orderTotal').textContent
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show success message
        showOrderSuccess(formData);

        // Clear cart
        localStorage.removeItem('chillWearCart');
        updateCartCount();

    } catch (error) {
        alert('There was an error processing your order. Please try again.');
        console.error('Order processing error:', error);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Show order success
function showOrderSuccess(orderData) {
    const orderNumber = 'CHW' + Date.now().toString().slice(-6);
    
    const successHTML = `
        <div class="order-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase, ${orderData.shipping.firstName}!</p>
            <div class="order-details">
                <div class="detail-item">
                    <strong>Order Number:</strong> ${orderNumber}
                </div>
                <div class="detail-item">
                    <strong>Total Amount:</strong> ${orderData.total}
                </div>
                <div class="detail-item">
                    <strong>Shipping to:</strong> ${orderData.shipping.address}, ${orderData.shipping.city}
                </div>
            </div>
            <p>You will receive an email confirmation shortly.</p>
            <div class="success-actions">
                <a href="products.html" class="btn">Continue Shopping</a>
                <a href="index.html" class="btn btn-outline">Return Home</a>
            </div>
        </div>
    `;

    // Replace checkout form with success message
    const checkoutContent = document.querySelector('.checkout-content');
    checkoutContent.innerHTML = successHTML;

    // Add success styles
    const style = document.createElement('style');
    style.textContent = `
        .order-success {
            text-align: center;
            padding: 3rem 2rem;
            grid-column: 1 / -1;
        }
        .success-icon {
            font-size: 4rem;
            color: #2ecc71;
            margin-bottom: 1rem;
        }
        .order-success h2 {
            color: #2ecc71;
            margin-bottom: 1rem;
        }
        .order-details {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 2rem 0;
            text-align: left;
        }
        .detail-item {
            margin-bottom: 0.5rem;
        }
        .success-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        @media (max-width: 768px) {
            .success-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('chillWearCart') || '[]');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(count => {
        count.textContent = totalItems;
    });
}
