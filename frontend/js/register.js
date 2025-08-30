document.getElementById('register-form').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const body = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        ruet_id: form.ruet_id.value
    };
    const res = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json();
    document.getElementById('register-msg').textContent = data.message || data.error;
    if (data.message) form.reset();
};