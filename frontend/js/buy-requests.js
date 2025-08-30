fetch('http://localhost:3001/api/buy-requests')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('buy-requests');
    data.forEach(req => {
      const div = document.createElement('div');
      div.className = 'buy-request-card';
      div.innerHTML = `
        <h3>${req.title}</h3>
        <p>${req.description}</p>
        <p><b>Requested by:</b> ${req.requester_name}</p>
      `;
      container.appendChild(div);
    });
  });