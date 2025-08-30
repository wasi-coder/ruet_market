const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
fetch(`http://localhost:3001/api/products/${id}`)
  .then(res => res.json())
  .then(product => {
    const container = document.getElementById('product-detail');
    container.innerHTML = `
      <h2>${product.title}</h2>
      <img src="${product.image || 'https://via.placeholder.com/150'}" width="200" />
      <p>${product.description}</p>
      <p><b>Price:</b> ${product.price} BDT</p>
      <p><b>Type:</b> ${product.type}</p>
      <p><b>Seller:</b> ${product.seller_name}</p>
    `;
  });