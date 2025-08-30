// ===== Universal Navbar Updater =====
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.querySelector('.nav-container');
    if (!navContainer) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Clear previous user nav if exists
    const existingUserNav = document.getElementById('userNav');
    if (existingUserNav) existingUserNav.remove();

    if (currentUser) {
        const userNav = document.createElement('div');
        userNav.id = 'userNav';
        userNav.style.display = 'flex';
        userNav.style.alignItems = 'center';
        userNav.style.gap = '1rem';

        userNav.innerHTML = `
            <span>Hello, ${currentUser.name}</span>
            <button id="logoutBtn" class="btn btn-outline">Logout</button>
        `;

        navContainer.appendChild(userNav);

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
});
