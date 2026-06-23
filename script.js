// ===== DATA STORE =====
let users = JSON.parse(localStorage.getItem('bukUsers')) || [];
let notices = JSON.parse(localStorage.getItem('bukNotices')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('bukCurrentUser')) || null;

// ===== USER ROLES =====
const ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student'
};

// ===== INITIALIZATION =====
function initApp() {
    // Create default users if no users exist
    if (users.length === 0) {
        // Create Admin Account
        users.push({
            id: 'admin-001',
            name: 'BUK Administrator',
            email: 'admin@bugema.ac.ug',
            studentId: 'BUK-ADMIN-001',
            password: 'admin123',
            role: ROLES.ADMIN,
            joined: new Date().toISOString(),
            profile: {
                avatar: '👑',
                department: 'Administration',
                phone: '+256-XXX-XXX-XXX'
            }
        });
        
        // Create Default Student Account (View-Only)
        users.push({
            id: 'student-001',
            name: 'John Student',
            email: 'student@bugema.ac.ug',
            studentId: 'BUK-2024-001',
            password: 'student123',
            role: ROLES.STUDENT,
            joined: new Date().toISOString(),
            profile: {
                avatar: '👤',
                department: 'Computer Science',
                phone: '+256-XXX-XXX-XXX'
            }
        });
        
        localStorage.setItem('bukUsers', JSON.stringify(users));
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
    checkUserPermissions();
    updateUIForRole();
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
        sessionStorage.setItem('bukCurrentUser', JSON.stringify(user));
        showApp();
        
        // Role-specific welcome message
        const welcomeMsg = user.role === ROLES.ADMIN 
            ? `Welcome back, Admin ${user.name}! 👑` 
            : `Welcome to BUK, ${user.name}! 👋 You have view-only access.`;
        alert(welcomeMsg);
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

    // Create new user (default role: student - VIEW ONLY)
    const newUser = {
        id: 'buk-user-' + Date.now(),
        name: name,
        email: email,
        studentId: studentId,
        password: password,
        role: ROLES.STUDENT,
        joined: new Date().toISOString(),
        profile: {
            avatar: '👤',
            department: 'Not Set',
            phone: 'Not Set'
        }
    };

    users.push(newUser);
    localStorage.setItem('bukUsers', JSON.stringify(users));

    // Auto-login
    currentUser = newUser;
    sessionStorage.setItem('bukCurrentUser', JSON.stringify(newUser));
    showApp();
    alert('✅ Account created successfully! Welcome to BUK! You have view-only access.');
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        sessionStorage.removeItem('bukCurrentUser');
        showAuthModal();
        document.getElementById('userMenu').classList.remove('show');
    }
}

// ===== USER PERMISSIONS =====
function checkUserPermissions() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isStudent = currentUser.role === ROLES.STUDENT;
    
    // Show/hide admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Show/hide student-only elements
    document.querySelectorAll('.student-only').forEach(el => {
        el.style.display = isStudent ? 'block' : 'none';
    });
    
    // Update role badge
    const roleBadge = document.getElementById('userRoleDisplay');
    if (roleBadge) {
        roleBadge.textContent = isAdmin ? '👑 ADMIN' : '👁️ VIEWER';
        roleBadge.style.color = isAdmin ? '#c9a84c' : '#003366';
    }
}

// ===== UPDATE UI FOR ROLE =====
function updateUIForRole() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isStudent = currentUser.role === ROLES.STUDENT;
    
    // Hide Notice Form for Students (View-Only)
    const noticeForm = document.getElementById('notice-form');
    if (noticeForm) {
        if (isStudent) {
            noticeForm.style.display = 'none';
            // Show a message to students
            const viewOnlyMessage = document.createElement('div');
            viewOnlyMessage.id = 'viewOnlyMessage';
            viewOnlyMessage.className = 'view-only-banner';
            viewOnlyMessage.innerHTML = `
                <div class="view-only-container">
                    <span class="view-only-icon">👁️</span>
                    <div>
                        <h3>View-Only Mode</h3>
                        <p>You are in view-only mode. Only administrators can post, edit, or delete notices.</p>
                    </div>
                </div>
            `;
            // Insert after stats bar
            const statsBar = document.querySelector('.stats-bar');
            if (statsBar && !document.getElementById('viewOnlyMessage')) {
                statsBar.parentNode.insertBefore(viewOnlyMessage, statsBar.nextSibling);
            }
        } else {
            noticeForm.style.display = 'block';
            // Remove view-only message if exists
            const viewOnlyMsg = document.getElementById('viewOnlyMessage');
            if (viewOnlyMsg) {
                viewOnlyMsg.remove();
            }
        }
    }
    
    // Hide Post/Edit/Delete buttons for students
    if (isStudent) {
        // Remove any existing post form
        document.querySelectorAll('.student-post-controls').forEach(el => el.remove());
    }
}

// ===== USER INTERFACE =====
function updateUserUI() {
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.name;
        document.getElementById('userRoleDisplay').textContent = currentUser.role.toUpperCase();
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        
        // Show admin menu if user is admin
        if (currentUser.role === ROLES.ADMIN) {
            document.getElementById('adminMenuItem').style.display = 'block';
        } else {
            document.getElementById('adminMenuItem').style.display = 'none';
        }
        
        // Update role-specific profile info
        updateProfileInfo();
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
    
    // Show role-specific profile info
    const roleSpecificInfo = document.getElementById('roleSpecificInfo');
    if (currentUser.role === ROLES.ADMIN) {
        roleSpecificInfo.innerHTML = `
            <div class="role-badge admin-badge">👑 Administrator</div>
            <p><strong>Department:</strong> ${currentUser.profile?.department || 'Administration'}</p>
            <p><strong>Access Level:</strong> Full System Access</p>
            <p><strong>Permissions:</strong> Post, Edit, Delete Notices | Manage Users | System Settings</p>
        `;
    } else {
        roleSpecificInfo.innerHTML = `
            <div class="role-badge student-badge">👁️ View-Only</div>
            <p><strong>Department:</strong> ${currentUser.profile?.department || 'Not Set'}</p>
            <p><strong>Access Level:</strong> View-Only Access</p>
            <p><strong>Permissions:</strong> View Notices Only</p>
            <p style="color:#666;font-style:italic;margin-top:10px;">⚠️ Students cannot post, edit, or delete notices.</p>
        `;
    }
    
    document.getElementById('userMenu').classList.remove('show');
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function updateProfileInfo() {
    // Update profile avatar based on role
    const avatar = document.getElementById('userAvatar');
    if (currentUser.role === ROLES.ADMIN) {
        avatar.textContent = '👑';
    } else {
        avatar.textContent = '👁️';
    }
}

// ===== ADMIN PANEL =====
function showAdminPanel() {
    if (currentUser.role !== ROLES.ADMIN) {
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

    // User list with role indicators
    const userList = document.getElementById('userList');
    userList.innerHTML = users.map(user => `
        <div class="admin-user-item ${user.role === ROLES.ADMIN ? 'admin-user' : 'student-user'}">
            <div class="user-info">
                <strong>${user.role === ROLES.ADMIN ? '👑' : '👁️'} ${user.name}</strong>
                <div style="font-size:0.9rem;color:#666;">
                    📧 ${user.email} | 🎓 ${user.studentId} 
                    <span class="role-tag ${user.role}">${user.role.toUpperCase()}</span>
                </div>
            </div>
            <div class="user-actions">
                ${user.role !== ROLES.ADMIN ? `
                    <button class="btn-sm btn-edit" onclick="makeAdmin('${user.id}')">⬆️ Make Admin</button>
                    <button class="btn-sm btn-delete" onclick="deleteUser('${user.id}')">🗑️ Delete</button>
                ` : `
                    <span style="color:var(--buk-gold);font-weight:700;">👑 Administrator</span>
                `}
            </div>
        </div>
    `).join('');

    // Notice list for admin with author role
    const adminNoticeList = document.getElementById('adminNoticeList');
    adminNoticeList.innerHTML = notices.map((notice, index) => {
        const isAdminNotice = notice.role === ROLES.ADMIN || notice.author === 'BUK Administrator' || notice.author === 'Admin';
        return `
        <div class="admin-notice-item">
            <div class="notice-info">
                <strong>${notice.title}</strong>
                <div style="font-size:0.9rem;color:#666;">
                    ${notice.category} | ${notice.date} 
                    ${isAdminNotice ? '👑 Admin' : '👤 Student'} 
                    By: ${notice.author || 'Unknown'}
                </div>
            </div>
            <div class="notice-actions">
                <button class="btn-sm btn-delete" onclick="deleteNotice(${index})">🗑️ Delete</button>
            </div>
        </div>
    `}).join('');
}

// ===== ADMIN FUNCTIONS =====
function makeAdmin(userId) {
    if (currentUser.role !== ROLES.ADMIN) {
        alert('❌ Access denied.');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = ROLES.ADMIN;
        user.profile = user.profile || {};
        user.profile.avatar = '👑';
        localStorage.setItem('bukUsers', JSON.stringify(users));
        updateAdminPanel();
        alert(`✅ ${user.name} is now a BUK Admin!`);
    }
}

function deleteUser(userId) {
    if (currentUser.role !== ROLES.ADMIN) {
        alert('❌ Access denied.');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('bukUsers', JSON.stringify(users));
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
                <p>${notices.length === 0 ? 'No notices have been posted yet.' : 'Try adjusting your search or filter.'}</p>
            </div>
        `;
        return;
    }

    // Sort notices by date (newest first)
    const sortedNotices = [...filteredNotices].sort((a, b) => new Date(b.date) - new Date(a.date));

    noticeList.innerHTML = sortedNotices.map((notice, index) => {
        // Determine if notice is from admin
        const isAdminNotice = notice.role === ROLES.ADMIN || 
                            notice.author === 'BUK Administrator' || 
                            notice.author === 'Admin' ||
                            (notice.author && notice.author.includes('Admin'));
        
        const isAdmin = currentUser && currentUser.role === ROLES.ADMIN;
        const isStudent = currentUser && currentUser.role === ROLES.STUDENT;
        
        // Only admins can delete notices
        const canDelete = isAdmin;
        const canEdit = isAdmin;
        
        return `
        <div class="notice-card ${isAdminNotice ? 'admin-notice' : 'student-notice'}">
            <div class="notice-header">
                <h3>${escapeHtml(notice.title)}</h3>
                ${isAdminNotice ? '<span class="admin-badge">👑 ADMIN</span>' : '<span class="student-badge">👤 STUDENT</span>'}
            </div>
            <div class="meta">
                <span class="category">${getCategoryIcon(notice.category)} ${escapeHtml(notice.category)}</span>
                <span>📅 ${formatDate(notice.date)}</span>
                <span>🕐 ${notice.time || 'Just now'}</span>
                <span class="notice-author">
                    ${isAdminNotice ? '👑' : '👤'} ${escapeHtml(notice.author || 'Unknown')}
                    ${isAdminNotice ? '<span class="admin-tag">Admin</span>' : ''}
                </span>
            </div>
            <div class="notice-message">
                ${escapeHtml(notice.message)}
            </div>
            <div class="notice-actions">
                ${canDelete ? `
                    <button class="delete-btn" onclick="deleteNotice(${notices.indexOf(notice)})">🗑️ Delete</button>
                ` : ''}
                ${canEdit ? `
                    <button class="edit-btn" onclick="editNotice(${notices.indexOf(notice)})">✏️ Edit</button>
                ` : ''}
                <button class="view-btn" onclick="viewNoticeDetails(${notices.indexOf(notice)})">👁️ View Details</button>
                ${isStudent ? '<span class="view-only-tag">🔒 View Only</span>' : ''}
            </div>
            ${isStudent ? `
                <div class="view-only-notice">
                    <span>🔒</span> Students can view but not interact with notices.
                </div>
            ` : ''}
        </div>
    `}).join('');
}

function deleteNotice(index) {
    if (!currentUser) {
        alert('Please login to delete notices.');
        return;
    }
    
    // Only admins can delete
    if (currentUser.role !== ROLES.ADMIN) {
        alert('❌ Only administrators can delete notices.');
        return;
    }
    
    const notice = notices[index];
    if (confirm(`Are you sure you want to delete "${notice.title}"?`)) {
        notices.splice(index, 1);
        localStorage.setItem('bukNotices', JSON.stringify(notices));
        displayNotices();
        updateStats();
        if (document.getElementById('adminPanel').style.display === 'block') {
            updateAdminPanel();
        }
        alert('✅ Notice deleted successfully!');
    }
}

function clearAllNotices() {
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
        alert('❌ Only BUK Admins can clear all notices.');
        return;
    }
    
    if (notices.length === 0) {
        alert('No notices to clear!');
        return;
    }
    
    if (confirm('⚠️ Delete ALL BUK notices? This cannot be undone!')) {
        notices = [];
        localStorage.setItem('bukNotices', JSON.stringify(notices));
        displayNotices();
        updateStats();
        if (document.getElementById('adminPanel').style.display === 'block') {
            updateAdminPanel();
        }
        alert('All BUK notices cleared successfully!');
    }
}

// ===== EDIT NOTICE (Admin Only) =====
function editNotice(index) {
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
        alert('❌ Only administrators can edit notices.');
        return;
    }
    
    const notice = notices[index];
    if (!notice) return;
    
    const newTitle = prompt('Edit Title:', notice.title);
    if (newTitle === null) return;
    const newMessage = prompt('Edit Message:', notice.message);
    if (newMessage === null) return;
    
    if (newTitle.trim() && newMessage.trim()) {
        notice.title = newTitle.trim();
        notice.message = newMessage.trim();
        localStorage.setItem('bukNotices', JSON.stringify(notices));
        displayNotices();
        alert('✅ Notice updated successfully!');
    }
}

// ===== VIEW NOTICE DETAILS =====
function viewNoticeDetails(index) {
    const notice = notices[index];
    if (!notice) return;
    
    const isAdminNotice = notice.role === ROLES.ADMIN || 
                         notice.author === 'BUK Administrator' || 
                         notice.author === 'Admin';
    
    alert(`
📌 NOTICE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Title: ${notice.title}
📂 Category: ${notice.category}
📅 Date: ${formatDate(notice.date)}
🕐 Time: ${notice.time || 'Just now'}
👤 Author: ${notice.author || 'Unknown'}
👑 Role: ${isAdminNotice ? '👑 Administrator' : '👤 Student'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Message:
${notice.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔖 ID: ${notice.id || 'N/A'}
    `);
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

// ===== POST NOTICE (Admin Only) =====
document.getElementById('noticeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to post a notice.');
        return;
    }
    
    // Only admins can post
    if (currentUser.role !== ROLES.ADMIN) {
        alert('❌ Only administrators can post notices. Students have view-only access.');
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
        id: 'buk-notice-' + Date.now(),
        title: title,
        message: message,
        date: date,
        category: category,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        author: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        timestamp: new Date().toISOString()
    };

    notices.push(newNotice);
    localStorage.setItem('bukNotices', JSON.stringify(notices));
    
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

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.switchAuth = switchAuth;
window.toggleUserMenu = toggleUserMenu;
window.viewProfile = viewProfile;
window.closeProfile = closeProfile;
window.showAdminPanel = showAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.makeAdmin = makeAdmin;
window.deleteUser = deleteUser;
window.deleteNotice = deleteNotice;
window.clearAllNotices = clearAllNotices;
window.editNotice = editNotice;
window.viewNoticeDetails = viewNoticeDetails;
