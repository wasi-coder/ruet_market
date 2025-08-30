// Register JavaScript

document.getElementById('register-form').onsubmit = async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';
    
    const body = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        ruet_id: form.ruet_id.value,
        department: form.department.value,
        phone: form.phone.value || null
    };
    
    try {
        const res = await fetch('http://localhost:3001/api/users/register', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('register-msg').style.color = '#2ecc40';
            document.getElementById('register-msg').textContent = data.message;
            form.reset();
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            document.getElementById('register-msg').style.color = '#db2c2c';
            document.getElementById('register-msg').textContent = data.error;
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-msg').style.color = '#db2c2c';
        document.getElementById('register-msg').textContent = 'Network error. Please try again.';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};