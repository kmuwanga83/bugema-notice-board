// Load notices from localStorage
let notices = JSON.parse(localStorage.getItem('bugemaNotices')) || [];

// DOM Elements
const noticeForm = document.getElementById('noticeForm');
const noticeList = document.getElementById('noticeList');
const titleInput = document.getElementById('title');
const messageInput = document.getElementById('message');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('category');

// Set default date to today
dateInput.value = new Date().toISOString().split('T')[0];

// Display notices
function displayNotices() {
    if (notices.length === 0) {
        noticeList.innerHTML = `
            <div class="empty-state">
                <p>📋 No notices posted yet. Be the first to post!</p>
            </div>
        `;
        return;
    }

    // Sort notices by date (newest first)
    const sortedNotices = [...notices].sort((a, b) => new Date(b.date) - new Date(a.date));

    noticeList.innerHTML = sortedNotices.map((notice, index) => `
        <div class="notice-card">
            <h3>${escapeHtml(notice.title)}</h3>
            <div class="meta">
                <span class="category">${escapeHtml(notice.category)}</span>
                <span>📅 ${formatDate(notice.date)}</span>
                <span>🕐 ${notice.time || 'Just now'}</span>
            </div>
            <p>${escapeHtml(notice.message)}</p>
            <button class="delete-btn" onclick="deleteNotice(${index})">Delete</button>
        </div>
    `).join('');
}

// Delete notice
function deleteNotice(index) {
    if (confirm('Are you sure you want to delete this notice?')) {
        notices.splice(index, 1);
        localStorage.setItem('bugemaNotices', JSON.stringify(notices));
        displayNotices();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Add new notice
noticeForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newNotice = {
        title: titleInput.value.trim(),
        message: messageInput.value.trim(),
        date: dateInput.value,
        category: categorySelect.value,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    notices.push(newNotice);
    localStorage.setItem('bugemaNotices', JSON.stringify(notices));
    
    // Reset form
    noticeForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    
    displayNotices();
    alert('✅ Notice posted successfully!');
});

// Initial display
displayNotices();
