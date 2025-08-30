// ===== Check login =====
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Please login first to post a product!');
    window.location.href = 'login.html';
}

// ===== Check for edit mode =====
const urlParams = new URLSearchParams(window.location.search);
const editProductId = urlParams.get('edit');
let isEditMode = false;
let editProductData = null;

if (editProductId) {
    isEditMode = true;
    editProductData = JSON.parse(localStorage.getItem('editProduct'));

    if (!editProductData) {
        alert('Product data not found. Redirecting to product list.');
        window.location.href = 'my-products.html';
    }
}

// Navbar is now handled by navbar.js

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
    submitBtn.textContent = isEditMode ? 'Updating Product...' : 'Posting Product...';

    // Create FormData for file upload
    const formData = new FormData();
    if (!isEditMode) {
        formData.append('user_id', currentUser.id);
    }
    formData.append('title', productForm.title.value);
    formData.append('description', productForm.description.value);
    formData.append('price', productForm.price.value);
    formData.append('type', productForm.type.value);
    formData.append('category', productForm.category.value);
    formData.append('department', productForm.department.value);
    formData.append('condition', productForm.condition.value);
    formData.append('contactPhone', productForm.contactPhone.value);

    // Handle image upload
    const imageFile = document.getElementById('imageFile').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    } else if (isEditMode && editProductData.image) {
        // Keep existing image if no new file uploaded in edit mode
        formData.append('image', editProductData.image);
    }

    const messageDiv = document.getElementById('post-msg');

    try {
        const url = isEditMode
            ? `http://localhost:3001/api/products/${editProductId}`
            : 'http://localhost:3001/api/products';

        const res = await fetch(url, {
            method: isEditMode ? 'PUT' : 'POST',
            body: formData
        });

        const data = await res.json();
        console.log(isEditMode ? 'PUT' : 'POST', 'response:', data);

        if (res.ok) {
            const product = data.product || data;

            if (isEditMode) {
                // Update product in the list
                const index = allProducts.findIndex(p => p.id == editProductId);
                if (index !== -1) {
                    allProducts[index] = product;
                }
            } else {
                // Add new product to list
                allProducts.push(product);
            }

            displayProducts(allProducts);

            // Send product notification
            await sendProductNotification(product.id, product.title, isEditMode ? 'updated' : 'posted');

            messageDiv.style.color = '#4ecdc4';
            messageDiv.textContent = isEditMode ? 'Product updated successfully!' : 'Product posted successfully!';

            if (isEditMode) {
                // Clear edit data and redirect after a short delay
                localStorage.removeItem('editProduct');
                setTimeout(() => {
                    window.location.href = 'my-products.html';
                }, 1500);
            } else {
                // Reset form and image preview
                productForm.reset();
                clearImagePreview();
            }
        } else {
            messageDiv.style.color = '#ff6b6b';
            messageDiv.textContent = data.error || `Failed to ${isEditMode ? 'update' : 'post'} product`;
        }
    } catch (err) {
        console.error(isEditMode ? 'Update' : 'Post', 'product error:', err);
        messageDiv.style.color = '#ff6b6b';
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

// ===== Price input validation =====
document.getElementById('price').addEventListener('input', function(e) {
    // Remove any non-digit characters except decimal point
    this.value = this.value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = this.value.split('.');
    if (parts.length > 2) {
        this.value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        this.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
});

// Prevent non-numeric keys in price field
document.getElementById('price').addEventListener('keypress', function(e) {
    // Allow: backspace, delete, tab, escape, enter, and .
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode === 90 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // Let it happen
        return;
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
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

// ===== Pre-fill form for edit mode =====
if (isEditMode && editProductData) {
    // Update page title and header
    document.querySelector('.post-header h1').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.querySelector('.post-header p').textContent = 'Update your product details';
    document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update Product';

    // Pre-fill form fields
    productForm.title.value = editProductData.title || '';
    productForm.description.value = editProductData.description || '';
    productForm.price.value = editProductData.price || '';
    productForm.type.value = editProductData.type || '';
    productForm.category.value = editProductData.category || '';
    productForm.department.value = editProductData.department || '';
    productForm.condition.value = editProductData.condition_rating || 'Good';
    productForm.contactPhone.value = editProductData.contact_phone || '';

    // Handle image preview
    if (editProductData.image) {
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const imageUploadArea = document.getElementById('imageUploadArea');

        previewImg.src = editProductData.image.startsWith('http')
            ? editProductData.image
            : `http://localhost:3001${editProductData.image}`;

        imagePreview.style.display = 'block';
        imageUploadArea.style.display = 'none';
    }
}

// ===== Image Upload Functionality =====
const imageUploadArea = document.getElementById('imageUploadArea');
const imageFileInput = document.getElementById('imageFile');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');

// Click to browse files
imageUploadArea.addEventListener('click', () => {
    imageFileInput.click();
});

// File input change
imageFileInput.addEventListener('change', handleFileSelect);

// Drag and drop events
imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
});

imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('dragover');
});

imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, or GIF).');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        imageUploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove image
removeImageBtn.addEventListener('click', clearImagePreview);

function clearImagePreview() {
    imageFileInput.value = '';
    imagePreview.style.display = 'none';
    imageUploadArea.style.display = 'block';
    previewImg.src = '';
}
