// ===== Check login =====
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Please login first to post a product!');
    window.location.href = 'login.html';
}

// ===== Update Navbar =====
const navAuth = document.querySelector('.nav-auth');
if (navAuth && currentUser) {
    navAuth.innerHTML = `
        <span style="margin-right: 1rem;">Hello, ${currentUser.name}</span>
        <button id="logoutBtn" class="btn btn-outline">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// ===== Post Product =====
const productForm = document.getElementById('post-product-form');
const productsGrid = document.getElementById('productsGrid');
let allProducts = []; // store products for immediate update

async function loadProducts() {
    try {
        const res = await fetch('http://localhost:3001/api/products');
        allProducts = await res.json();
        displayProducts(allProducts);
    } catch (err) {
        console.error('Error loading products:', err);
        productsGrid.innerHTML = '<p class="no-products">Error loading products</p>';
    }
}

// Display products
function displayProducts(products) {
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `<div class="no-products">
            <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>No products found.</p>
        </div>`;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${product.title}" class="product-image">
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">৳${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-meta">
                    <span><i class="fas fa-user"></i> ${product.seller_name || currentUser.name}</span>
                    <span><i class="fas fa-building"></i> ${product.department || 'N/A'}</span>
                </div>
                <div class="product-meta">
                    <span><i class="fas fa-tag"></i> ${product.type === 'rent' ? 'For Rent' : 'For Sale'}</span>
                    <span><i class="fas fa-star"></i> ${product.category}</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-outline" onclick="event.stopPropagation(); viewProduct(${product.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// View product details
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Load products initially
loadProducts();

productForm.onsubmit = async function(e) {
    e.preventDefault();

    const submitBtn = productForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting Product...';

    const body = {
        user_id: currentUser.id,
        title: productForm.title.value,
        description: productForm.description.value,
        price: productForm.price.value,
        type: productForm.type.value,
        category: productForm.category.value,
        department: productForm.department.value,
        condition: productForm.condition.value,
        contactPhone: productForm.contactPhone.value,
        image: productForm.image.value || null
    };

    const messageDiv = document.getElementById('post-msg');

    try {
        const res = await fetch('http://localhost:3001/api/products', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });

        const data = await res.json();
        console.log('POST response:', data); // ✅ log what you get from server

        if (res.ok) {
            // Check if data.product exists, otherwise use data directly
            const newProduct = data.product || data;

            // Add new product to list and update display
            allProducts.push(newProduct);
            displayProducts(allProducts);

            // Send product notification
            await sendProductNotification(newProduct.id, newProduct.title, 'posted');

            messageDiv.style.color = '#059669';
            messageDiv.textContent = 'Product posted successfully!';

            // Reset form
            productForm.reset();
        } else {
            messageDiv.style.color = '#db2c2c';
            messageDiv.textContent = data.error || 'Failed to post product';
        }
    } catch (err) {
        console.error('Post product error:', err);
        messageDiv.style.color = '#db2c2c';
        messageDiv.textContent = 'Network error. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};


// ===== Send product notification =====
async function sendProductNotification(productId, productTitle, updateType) {
    try {
        const response = await fetch('http://localhost:3001/api/notifications/product-update', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({userId: currentUser.id, productTitle, updateType})
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Product notification sent: ${result.notificationsSent} notifications`);
        }
    } catch (error) {
        console.error('Error sending product notification:', error);
    }
}

// ===== Phone number formatting =====
document.getElementById('contactPhone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.startsWith('880')) value = '+' + value;
        else if (value.startsWith('0')) value = '+88' + value;
        else if (!value.startsWith('+')) value = '+880' + value;
    }
    e.target.value = value;
});

// ===== Form validation =====
productForm.addEventListener('input', function() {
    const submitBtn = productForm.querySelector('button[type="submit"]');
    const requiredFields = productForm.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) isValid = false;
         console.log(`Field ${field.id} is empty`);
    });
    
    submitBtn.disabled = !isValid;
});
