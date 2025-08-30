document.getElementById('product-form').onsubmit = async function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        document.getElementById('product-msg').textContent = "Please login first.";
        return;
    }
    const form = e.target;
    const body = {
        user_id: user.id,
        title: form.title.value,
        description: form.description.value,
        price: form.price.value,
        type: form.type.value,
        image: form.image.value
    };
    const res = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
    });
    const data = await res.json();
    document.getElementById('product-msg').textContent = data.message || data.error;
    if (data.message) form.reset();
};