document.getElementById('login-form').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
        email: form.email.value,
        password: form.password.value
    };
    const res = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json();
    document.getElementById('login-msg').textContent = data.error || "Login successful!";
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => window.location.href = "index.html", 1000);
    }
};