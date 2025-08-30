// Post Product JavaScript

document.getElementById('post-product-form').onsubmit = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting Product...';
    
    const body = {
        title: form.title.value,
        description: form.description.value,
        price: form.price.value,
        type: form.type.value,
        category: form.category.value,
        department: form.department.value,
        condition: form.condition.value,
        contactPhone: form.contactPhone.value,
        image: form.image.value || null
    };
    
    try {
        const res = await fetch('http://localhost:3001/api/products', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Send product update notification
            await sendProductNotification(data.product.id, data.product.title, 'posted');
            
            document.getElementById('post-msg').style.color = '#059669';
            document.getElementById('post-msg').textContent = 'Product posted successfully!';
            
            // Redirect to products page after a short delay
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);
        } else {
            document.getElementById('post-msg').style.color = '#db2c2c';
            document.getElementById('post-msg').textContent = data.error;
        }
    } catch (error) {
        console.error('Post product error:', error);
        document.getElementById('post-msg').style.color = '#db2c2c';
        document.getElementById('post-msg').textContent = 'Network error. Please try again.';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};

// Send product notification
async function sendProductNotification(productId, productTitle, updateType) {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;
        
        const response = await fetch('http://localhost:3001/api/notifications/product-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                productTitle: productTitle,
                updateType: updateType
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Product notification sent: ${result.notificationsSent} notifications`);
        }
    } catch (error) {
        console.error('Error sending product notification:', error);
    }
}

// Phone number formatting
document.getElementById('contactPhone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.startsWith('880')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+88' + value;
        } else if (!value.startsWith('+')) {
            value = '+880' + value;
        }
    }
    e.target.value = value;
});

// Form validation
document.getElementById('post-product-form').addEventListener('input', function() {
    const form = this;
    const submitBtn = form.querySelector('button[type="submit"]');
    const requiredFields = form.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
        }
    });
    
    submitBtn.disabled = !isValid;
});