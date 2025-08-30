// Authentication System for RUET Marketplace

class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    // Get current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Initialize authentication
    init() {
        this.updateNavigation();
        this.checkAuthStatus();
    }

    // Update navigation based on auth status
    updateNavigation() {
        const navAuth = document.getElementById('navAuth');
        if (!navAuth) return;

        if (this.currentUser) {
            navAuth.innerHTML = `
                <div class="user-profile">
                    <div class="notification-bell" onclick="auth.toggleNotificationMenu()">
                        <i class="fas fa-bell"></i>
                        <span class="notification-badge" id="notificationBadge" style="display: none;"></span>
                    </div>
                    <div class="user-avatar">
                        <img src="${this.currentUser.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSI4IiB5PSIxMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPgo8L3N2Zz4KPC9zdmc+'}"
                             alt="${this.currentUser.name}"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyNTYzZWIiLz4KPHN2ZyB4PSI4IiB5PSIxMCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPgo8L3N2Zz4KPC9zdmc+'">
                    </div>
                    <div class="user-info">
                        <span class="user-name">${this.currentUser.name}</span>
                        <span class="user-dept">${this.currentUser.department}</span>
                    </div>
                    <div class="user-menu">
                        <button class="profile-dropdown" onclick="auth.toggleProfileMenu()">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="dropdown-menu" id="profileDropdown">
                            <a href="profile.html" class="dropdown-item">
                                <i class="fas fa-user"></i> Profile
                            </a>
                            <a href="my-products.html" class="dropdown-item">
                                <i class="fas fa-box"></i> My Products
                            </a>
                            <a href="settings.html" class="dropdown-item">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item" onclick="auth.logout()">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    </div>
                    <div class="notification-menu" id="notificationMenu">
                        <div class="notification-header">
                            <h4>Notifications</h4>
                            <button onclick="auth.markAllAsRead()" class="mark-read-btn">Mark all read</button>
                        </div>
                        <div class="notification-list" id="notificationList">
                            <div class="notification-item">
                                <p>Loading notifications...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load notifications
            this.loadNotifications();
        } else {
            navAuth.innerHTML = `
                <a href="login.html" class="btn btn-outline">Login</a>
                <a href="register.html" class="btn btn-primary">Register</a>
            `;
        }
    }

    // Toggle profile dropdown menu
    toggleProfileMenu() {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // Check authentication status
    checkAuthStatus() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-profile')) {
                const profileDropdown = document.getElementById('profileDropdown');
                if (profileDropdown) {
                    profileDropdown.classList.remove('show');
                }
                const notificationMenu = document.getElementById('notificationMenu');
                if (notificationMenu) {
                    notificationMenu.classList.remove('show');
                }
            }
        });
    }

    // Login user
    login(userData) {
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.updateNavigation();
        
        // Redirect to home or intended page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirectUrl;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        
        // Redirect to home
        window.location.href = 'index.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user ID
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }

    // Require authentication for protected pages
    requireAuth() {
        if (!this.isLoggedIn()) {
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = `login.html?redirect=${currentPage}`;
            return false;
        }
        return true;
    }

    // Toggle notification menu
    toggleNotificationMenu() {
        const menu = document.getElementById('notificationMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
        // Close profile dropdown if open
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileDropdown) {
            profileDropdown.classList.remove('show');
        }
    }

    // Load notifications from server
    async loadNotifications() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`http://localhost:3001/api/notifications/history/${this.currentUser.id}`);
            const notifications = await response.json();

            this.displayNotifications(notifications);
            this.updateNotificationBadge(notifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Display notifications in the menu
    displayNotifications(notifications) {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="notification-item"><p>No notifications yet</p></div>';
            return;
        }

        notificationList.innerHTML = notifications.slice(0, 10).map(notification => `
            <div class="notification-item ${notification.read_status ? '' : 'unread'}">
                <p>${notification.message}</p>
                <small>${new Date(notification.sent_at).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    // Update notification badge
    updateNotificationBadge(notifications) {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const unreadCount = notifications.filter(n => !n.read_status).length;
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        if (!this.currentUser) return;

        try {
            // This would require a backend endpoint to mark all as read
            // For now, just reload notifications
            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }
}

// Initialize authentication
const auth = new Auth();

// Add CSS for user profile
const style = document.createElement('style');
style.textContent = `
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        position: relative;
    }

    .user-avatar img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e2e8f0;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .user-name {
        font-weight: 600;
        color: #e0e0e0;
        font-size: 0.9rem;
        text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
    }

    .user-dept {
        font-size: 0.75rem;
        color: #aaa;
        text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
    }

    .profile-dropdown {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: color 0.3s ease;
    }

    .profile-dropdown:hover {
        color: #2563eb;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        min-width: 200px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    }

    .dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: #374151;
        text-decoration: none;
        transition: background 0.3s ease;
        border-radius: 4px;
        margin: 0.25rem;
    }

    .dropdown-item:hover {
        background: #f8fafc;
        color: #2563eb;
    }

    .dropdown-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 0.5rem 0;
    }

    .notification-bell {
        position: relative;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background 0.3s ease;
        margin-right: 0.5rem;
    }

    .notification-bell:hover {
        background: rgba(37, 99, 235, 0.1);
    }

    .notification-bell i {
        font-size: 1.2rem;
        color: #64748b;
    }

    .notification-badge {
        position: absolute;
        top: 0;
        right: 0;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }

    .notification-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        min-width: 350px;
        max-width: 400px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        max-height: 400px;
        overflow: hidden;
    }

    .notification-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .notification-header h4 {
        margin: 0;
        color: #1e293b;
        font-size: 1rem;
    }

    .mark-read-btn {
        background: none;
        border: none;
        color: #2563eb;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    .mark-read-btn:hover {
        background: #f8fafc;
    }

    .notification-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .notification-item {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
        transition: background 0.3s ease;
    }

    .notification-item:hover {
        background: #f8fafc;
    }

    .notification-item.unread {
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
    }

    .notification-item p {
        margin: 0 0 0.5rem 0;
        color: #374151;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .notification-item small {
        color: #6b7280;
        font-size: 0.75rem;
    }

    @media (max-width: 768px) {
        .user-info {
            display: block;
        }

        .user-name {
            font-size: 0.8rem;
        }

        .user-dept {
            font-size: 0.7rem;
        }

        .dropdown-menu {
            right: -50px;
        }

        .notification-menu {
            right: -50px;
            min-width: 300px;
        }
    }

    @media (max-width: 480px) {
        .user-info {
            display: none;
        }
    }
`;
document.head.appendChild(style);
