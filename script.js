// ===== DATA STORE =====
let users = JSON.parse(localStorage.getItem('bugemaUsers')) || [];
let notices = JSON.parse(localStorage.getItem('bugemaNotices')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('bugemaCurrentUser')) || null;

// ===== INITIALIZATION =====
function initApp() {
    // Create default admin if no users exist
    if (users.length === 0) {
        users.push({
            id: 'admin-001',
            name: 'Administrator',
            email: 'admin@bugema.ac.ug',
            studentId: 'ADMIN-001',
            password: 'admin123',
            role: 'admin',
            joined: new Date().toISOString()
        });
        localStorage.setItem('bugemaUsers', JSON.stringify(users));
    }

    // Check if user is logged in
    if (currentUser) {
        showApp();
    } else {
        showAuthModal();
    }
}

// ===== AUTHENTICATION =====
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function showApp() {
    hideAuthModal();
    document.getElementById('app').style.display = 'block';
    updateUserUI();
    displayNotices();
    updateStats();
}

function switchAuth(form) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if (form === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
    }
}

function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        sessionStorage.setItem('bugemaCurrentUser', JSON.stringify(user));
        showApp();
        alert(`Welcome back, ${user.name}! 👋`);
    } else {
        alert('❌ Invalid email or password. Please try again.');
    }
}

function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const studentId = document.getElementById('regStudentId').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validation
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('❌ Email already registered!');
        return;
    }

    if (users.find(u => u.studentId === studentId)) {
        alert('❌ Student ID already registered!');
        return;
    }

    // Create new user (default role: student)
    const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        studentId: studentId,
        password: password,
        role: 'student',
        joined: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('bugemaUsers', JSON.stringify(users));

    // Auto-login
    currentUser = newUser;
    sessionStorage.setItem('bugemaCurrentUser', JSON.stringify(newUser));
    showApp();
    alert('✅ Account created successfully! Welcome to Bugema!');
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        sessionStorage.removeItem('bugemaCurrentUser');
        showAuthModal();
        document.getElementById('userMenu').classList.remove('show');
    }
}

// ===== USER INTERFACE =====
function updateUserUI() {
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.name;
        document.getElementById('userRoleDisplay').textContent = currentUser.role.toUpperCase();
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        
        // Show admin menu if user is admin
        if (currentUser.role === 'admin') {
            document.getElementById('adminMenuItem').style.display = 'block';
        } else {
            document.getElementById('adminMenuItem').style.display = 'none';
        }
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const profile = document.querySelector('.user-profile');
    if (profile && !profile.contains(e.target)) {
        document.getElementById('userMenu').classList.remove('show');
    }
});

// ===== PROFILE =====
function viewProfile() {
    document.getElementById('profileModal').style.display = 'flex';
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileStudentId').textContent = currentUser.studentId;
    document.getElementById('profileRole').textContent = currentUser.role.toUpperCase();
    document.getElementById('profileJoined').textContent = new Date(currentUser.joined).toLocaleDateString();
    document.getElementById('userMenu').classList.remove('show');
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

// ===== ADMIN PANEL =====
function showAdminPanel() {
    if (currentUser.role !== 'admin') {
        alert('❌ Access denied. Admin privileges required.');
        return;
    }
    
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('userMenu').classList.remove('show');
    updateAdminPanel();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function updateAdminPanel() {
    // Update stats
    document.getElementById('adminTotalUsers').textContent = users.length;
    document.getElementById('adminTotalNotices').textContent = notices.length;
    const today = new Date().toISOString().split('T')[0];
    const todayNotices = notices.filter(n => n.date === today);
    document.getElementById('adminTodayNotices').textContent = todayNotices.length;

    // User list
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
        <div class="admin-user-item">
            <div class="user-info">
                <strong>${user.name}</strong>
                <div style="font-size:0.9rem;color:#666;">
                    ${user.email} | ${user.studentId} | Role: ${user.role}
                </div>
            </div>
            <div class="user-actions">
                ${user.role !== 'admin' ? `
                    <button class="btn-sm btn-edit" onclick="makeAdmin('${user.id}')">Make Admin</button>
                    <button class="btn-sm btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
                ` : '<span style="color:var(--bugema-gold);font-weight:600;">👑 Admin</span>'}
            </div>
        </div>
    `).join('');

    // Notice list for admin
    const adminNoticeList = document.getElementById('adminNoticeList');
    adminNoticeList.innerHTML = notices.map((notice, index) => `
        <div class="admin-notice-item">
            <div class="notice-info">
                <strong>${notice.title}</strong>
                <div style="font-size:0.9rem;color:#666;">
                    ${notice.category} | ${notice.date} | By: ${notice.author || 'Unknown'}
                </div>
            </div>
            <div class="notice-actions">
                <button class="btn-sm btn-delete" onclick="deleteNotice(${index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ===== ADMIN FUNCTIONS =====
function makeAdmin(userId) {
    if (currentUser.role !== 'admin') {
        alert('❌ Access denied.');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = 'admin';
        localStorage.setItem('bugemaUsers', JSON.stringify(users));
        updateAdminPanel();
        alert(`✅ ${user.name} is now an admin!`);
    }
}

function deleteUser(userId) {
    if (currentUser.role !== 'admin') {
        alert('❌ Access denied.');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('bugemaUsers', JSON.stringify(users));
        updateAdminPanel();
        alert('✅ User deleted successfully!');
    }
}

// ===== NOTICE FUNCTIONS =====
function displayNotices(noticesToShow = null) {
    let filteredNotices = noticesToShow || notices;
    
    // Apply search filter
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredNotices = filteredNotices.filter(notice => 
            notice.title.toLowerCase().includes(searchTerm) ||
            notice.message.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
    if (categoryFilter !== 'all') {
        filteredNotices = filteredNotices.filter(notice => 
            notice.category === categoryFilter
        );
    }
    
    const noticeList = document.getElementById('noticeList');
    
    if (filteredNotices.length === 0) {
        noticeList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📋</span>
                <h3>No Notices Found</h3>
                <p>${notices.length === 0 ? 'Be the first to post a notice!' : 'Try adjusting your search or filter.'}</p>
            </div>
        `;
        return;
    }

    // Sort notices by date (newest first)
    const sortedNotices = [...filteredNotices].sort((a, b) => new Date(b.date) - new Date(a.date));

    noticeList.innerHTML = sortedNotices.map((notice, index) => `
        <div class="notice-card">
            <h3>${escapeHtml(notice.title)}</h3>
            <div class="meta">
                <span class="category">${getCategoryIcon(notice.category)} ${escapeHtml(notice.category)}</span>
                <span>📅 ${formatDate(notice.date)}</span>
                <span>🕐 ${notice.time || 'Just now'}</span>
                ${notice.author ? `<span class="notice-author">👤 ${escapeHtml(notice.author)}</span>` : ''}
            </div>
            <div class="notice-message">
                ${escapeHtml(notice.message)}
            </div>
            ${(currentUser && (currentUser.role === 'admin' || currentUser.id === notice.userId)) ? `
                <button class="delete-btn" onclick="deleteNotice(${notices.indexOf(notice)})">🗑️ Delete</button>
            ` : ''}
        </div>
    `).join('');
}

function deleteNotice(index) {
    if (!currentUser) {
        alert('Please login to delete notices.');
        return;
    }
    
    const notice = notices[index];
    if (currentUser.role !== 'admin' && currentUser.id !== notice.userId) {
        alert('❌ You can only delete your own notices.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this notice?')) {
        notices.splice(index, 1);
        localStorage.setItem('bugemaNotices', JSON.stringify(notices));
        displayNotices();
        updateStats();
        if (document.getElementById('adminPanel').style.display === 'block') {
            updateAdminPanel();
        }
    }
}

function clearAllNotices() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('❌ Only admins can clear all notices.');
        return;
    }
    
    if (notices.length === 0) {
        alert('No notices to clear!');
        return;
    }
    
    if (confirm('⚠️ Delete ALL notices? This cannot be undone!')) {
        notices = [];
        localStorage.setItem('bugemaNotices', JSON.stringify(notices));
        displayNotices();
        updateStats();
        if (document.getElementById('adminPanel').style.display === 'block') {
            updateAdminPanel();
        }
        alert('All notices cleared successfully!');
    }
}

// ===== UTILITY FUNCTIONS =====
function getCategoryIcon(category) {
    const icons = {
        'Academic': '📚',
        'Administrative': '📋',
        'Events': '🎉',
        'Announcement': '📢',
        'Spiritual': '🙏',
        'Sports': '⚽',
        'Career': '💼',
        'Other': '📌'
    };
    return icons[category] || '📌';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function updateStats() {
    document.getElementById('noticeCount').textContent = notices.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayNotices = notices.filter(n => n.date === today);
    document.getElementById('todayCount').textContent = todayNotices.length;
    
    const categories = new Set(notices.map(n => n.category));
    document.getElementById('categoryCount').textContent = categories.size || 0;
    document.getElementById('userCount').textContent = users.length;
}

// ===== POST NOTICE =====
document.getElementById('noticeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to post a notice.');
        return;
    }

    const title = document.getElementById('title').value.trim();
    const message = document.getElementById('message').value.trim();
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    if (!title || !message || !date) {
        alert('Please fill in all required fields.');
        return;
    }

    const newNotice = {
        id: 'notice-' + Date.now(),
        title: title,
        message: message,
        date: date,
        category: category,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        author: currentUser.name,
        userId: currentUser.id,
        timestamp: new Date().toISOString()
    };

    notices.push(newNotice);
    localStorage.setItem('bugemaNotices', JSON.stringify(notices));
    
    // Reset form
    this.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    displayNotices();
    updateStats();
    alert('✅ Notice posted successfully!');
});

// ===== SEARCH & FILTER =====
document.getElementById('searchInput')?.addEventListener('input', function() {
    displayNotices();
});

document.getElementById('filterCategory')?.addEventListener('change', function() {
    displayNotices();
});

// ===== CLOSE MODALS ON ESCAPE =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProfile();
        closeAdminPanel();
        document.getElementById('userMenu').classList.remove('show');
    }
});

// ===== START APPLICATION =====
initApp();
