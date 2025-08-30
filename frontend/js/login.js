// Login JavaScript

document.getElementById('login-form').onsubmit = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    const body = {
        email: form.email.value,
        password: form.password.value
    };
    
    try {
        const res = await fetch('http://localhost:3001/api/users/login', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Use the auth system to login
            if (typeof auth !== 'undefined') {
                auth.login(data.user);
            } else {
                // Fallback if auth system not loaded
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'index.html';
            }
        } else {
            document.getElementById('login-msg').style.color = '#db2c2c';
            document.getElementById('login-msg').textContent = data.error;
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-msg').style.color = '#db2c2c';
        document.getElementById('login-msg').textContent = 'Network error. Please try again.';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};