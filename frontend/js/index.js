fetch('http://localhost:3001/api/products')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('products');
    data.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <h3>${product.title}</h3>
        <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.title}" width="150">
        <p>${product.description}</p>
        <p><b>Price:</b> ${product.price} BDT</p>
        <p><b>Type:</b> ${product.type}</p>
        <p><b>Seller:</b> ${product.seller_name}</p>
        <a href="product.html?id=${product.id}">View Details</a>
      `;
      container.appendChild(div);
    });
  });