// Product Details JavaScript

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
    alert('No product ID provided');
    window.location.href = 'index.html';
}

// Load product details
async function loadProductDetails() {
    try {
        const response = await fetch(`http://localhost:3001/api/products/${productId}`);
        const product = await response.json();
        
        if (!product) {
            alert('Product not found');
            window.location.href = 'index.html';
            return;
        }
        
        displayProductDetails(product);
        
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productDetail').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc2626;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Error loading product details. Please try again later.</p>
            </div>
        `;
    }
}

// Display product details
function displayProductDetails(product) {
    const productDetail = document.getElementById('productDetail');
    const imageUrl = product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDUwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
    const price = parseFloat(product.price).toFixed(2);
    const type = product.type === 'rent' ? 'For Rent' : 'For Sale';
    const statusClass = product.type === 'rent' ? 'status-rent' : 'status-sell';
    
    productDetail.innerHTML = `
        <div class="product-grid">
            <div class="product-image-section">
                <img src="${imageUrl}" alt="${product.title}" class="product-image">
            </div>
            
            <div class="product-info-section">
                <div class="status-badge ${statusClass}">${type}</div>
                <h1 class="product-title">${product.title}</h1>
                <div class="product-price">৳${price}</div>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${product.category || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-building"></i>
                        <span>${product.department || 'N/A'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>${product.condition_rating || 'Good'}</span>
                    </div>
                </div>
                
                <div class="product-description">
                    ${product.description}
                </div>
                
                <div class="seller-info">
                    <h3><i class="fas fa-user"></i> Seller Information</h3>
                    <div class="seller-details">
                        <div class="seller-detail">
                            <i class="fas fa-user-circle"></i>
                            <span>${product.seller_name || 'N/A'}</span>
                        </div>
                        <div class="seller-detail">
                            <i class="fas fa-building"></i>
                            <span>${product.seller_department || 'N/A'}</span>
                        </div>
                        <div class="seller-detail">
                            <i class="fas fa-phone"></i>
                            <span>${product.contact_phone || product.seller_phone || 'N/A'}</span>
                        </div>
                        <div class="seller-detail">
                            <i class="fas fa-id-card"></i>
                            <span>RUET ID: ${product.seller_ruet_id || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <a href="checkout.html?id=${product.id}" class="btn btn-primary">
                        <i class="fas fa-shopping-cart"></i>
                        Contact Seller
                    </a>
                    <a href="tel:${product.contact_phone || product.seller_phone || ''}" 
                       class="btn btn-success" 
                       ${!product.contact_phone && !product.seller_phone ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                        <i class="fas fa-phone"></i>
                        Call Now
                    </a>
                    <button class="btn btn-outline" onclick="copyContactInfo('${product.seller_name || 'N/A'}', '${product.seller_department || 'N/A'}', '${product.contact_phone || product.seller_phone || 'N/A'}')">
                        <i class="fas fa-copy"></i>
                        Copy Contact Info
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Copy contact information
function copyContactInfo(sellerName, sellerDept, sellerPhone) {
    const contactInfo = `Seller: ${sellerName}\nDepartment: ${sellerDept}\nPhone: ${sellerPhone}`;
    
    navigator.clipboard.writeText(contactInfo).then(() => {
        alert('Contact information copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = contactInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Contact information copied to clipboard!');
    });
}

// Load product details when page loads
document.addEventListener('DOMContentLoaded', loadProductDetails);