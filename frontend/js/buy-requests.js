fetch('http://localhost:3001/api/buy-requests')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('buy-requests');
    container.innerHTML = ''; // Clear loading

    if (data.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">No buy requests found. Be the first to post one!</p>';
      return;
    }

    data.forEach(req => {
      const div = document.createElement('div');
      div.className = 'buy-request-card';
      div.style.cssText = `
        background: #1a1a1a;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.7);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border: 1px solid #333;
      `;

      const imageHtml = req.image ? `<img src="http://localhost:3001${req.image}" alt="${req.title}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem; border: 2px solid #333;">` : '';

      div.innerHTML = `
        ${imageHtml}
        <h3 style="color: #e0e0e0; margin-bottom: 0.5rem; font-size: 1.25rem; font-family: 'Press Start 2P', cursive; text-shadow: 1px 1px 0px #000;">${req.title}</h3>
        <p style="color: #aaa; margin-bottom: 1rem; line-height: 1.6;">${req.description}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span style="font-weight: 600; color: #4682B4; font-family: 'Press Start 2P', cursive; font-size: 0.7rem;">Category: ${req.category}</span>
          ${req.max_price ? `<span style="font-weight: 600; color: #5a9bd4; font-family: 'Press Start 2P', cursive; font-size: 0.7rem;">Max: ৳${req.max_price}</span>` : ''}
        </div>
        <p style="color: #888; font-size: 0.8rem; margin-bottom: 1rem; font-family: 'Press Start 2P', cursive;"><b>By:</b> ${req.requester_name}</p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <button class="reply-btn" data-request-id="${req.id}" style="
            background: #4682B4;
            color: white;
            border: 2px solid #333;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.6rem;
            box-shadow: 2px 2px 0px #000;
            transition: all 0.2s ease;
          ">Reply</button>
          <button class="show-replies-btn" data-request-id="${req.id}" style="
            background: #333;
            color: #e0e0e0;
            border: 2px solid #555;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.6rem;
            box-shadow: 2px 2px 0px #000;
            transition: all 0.2s ease;
          ">Show Replies (0)</button>
        </div>
        <div class="replies-container" data-request-id="${req.id}" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #333;"></div>
      `;
      container.appendChild(div);
    });

    // Add event listeners for reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const requestId = this.getAttribute('data-request-id');
        handleReply(requestId);
      });
    });

    // Add event listeners for show replies buttons
    document.querySelectorAll('.show-replies-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const requestId = this.getAttribute('data-request-id');
        toggleReplies(requestId);
      });
    });

    // Load reply counts for all requests
    data.forEach(req => {
      loadReplyCount(req.id);
    });
  })
  .catch(err => {
    const container = document.getElementById('buy-requests');
    container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #ef4444;">Error loading buy requests. Please try again later.</p>';
    console.error('Error fetching buy requests:', err);
  });

async function handleReply(requestId) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    alert('Please login to reply to buy requests.');
    window.location.href = 'login.html';
    return;
  }

  const message = prompt('Enter your offer message (e.g., "I have a used calculator for ৳800"):');
  if (message) {
    try {
      const response = await fetch(`http://localhost:3001/api/buy-requests/${requestId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replier_id: user.id,
          message: message
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Your offer has been sent! The buyer will be notified.');
        loadReplyCount(requestId); // Refresh reply count
      } else {
        alert('Error sending reply: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    }
  }
}

async function loadReplyCount(requestId) {
  try {
    const response = await fetch(`http://localhost:3001/api/buy-requests/${requestId}/replies`);
    const replies = await response.json();
    const showRepliesBtn = document.querySelector(`.show-replies-btn[data-request-id="${requestId}"]`);
    if (showRepliesBtn) {
      showRepliesBtn.textContent = `Show Replies (${replies.length})`;
    }
  } catch (error) {
    console.error('Error loading reply count:', error);
  }
}

async function toggleReplies(requestId) {
  const repliesContainer = document.querySelector(`.replies-container[data-request-id="${requestId}"]`);
  const showRepliesBtn = document.querySelector(`.show-replies-btn[data-request-id="${requestId}"]`);

  if (repliesContainer.style.display === 'none') {
    // Load and show replies
    try {
      const response = await fetch(`http://localhost:3001/api/buy-requests/${requestId}/replies`);
      const replies = await response.json();

      repliesContainer.innerHTML = '';
      if (replies.length === 0) {
        repliesContainer.innerHTML = '<p style="color: #888; font-style: italic; font-family: \'Press Start 2P\', cursive; font-size: 0.6rem;">No replies yet. Be the first to offer!</p>';
      } else {
        replies.forEach(reply => {
          const replyDiv = document.createElement('div');
          replyDiv.style.cssText = `
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            box-shadow: 1px 1px 0px #000;
          `;
          replyDiv.innerHTML = `
            <p style="color: #e0e0e0; margin: 0; font-size: 0.8rem; line-height: 1.4;">${reply.message}</p>
            <p style="color: #888; font-size: 0.6rem; margin: 0.5rem 0 0 0; font-family: 'Press Start 2P', cursive;">By: ${reply.replier_name} • ${new Date(reply.created_at).toLocaleDateString()}</p>
          `;
          repliesContainer.appendChild(replyDiv);
        });
      }

      repliesContainer.style.display = 'block';
      showRepliesBtn.textContent = `Hide Replies (${replies.length})`;
    } catch (error) {
      console.error('Error loading replies:', error);
      repliesContainer.innerHTML = '<p style="color: #ef4444; font-size: 0.7rem;">Error loading replies.</p>';
      repliesContainer.style.display = 'block';
    }
  } else {
    // Hide replies
    repliesContainer.style.display = 'none';
    const replyCount = showRepliesBtn.textContent.match(/\((\d+)\)/)?.[1] || '0';
    showRepliesBtn.textContent = `Show Replies (${replyCount})`;
  }
}