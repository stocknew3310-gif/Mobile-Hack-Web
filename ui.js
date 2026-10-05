/**
 * Ahsan Rat Monitor - UI Logic
 * Version 3.0 - Enhanced with Toast Notifications & Animations
 */

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

function createToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info', duration = 3000) {
    const container = createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#06b6d4',
        warning: '#f59e0b'
    };
    
    toast.innerHTML = `
        <div style="
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${colors[type]}20;
            color: ${colors[type]};
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
        ">${icons[type]}</div>
        <div style="
            flex: 1;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
            line-height: 1.4;
        ">${message}</div>
        <button style="
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            border-radius: 6px;
            font-size: 12px;
            transition: all 0.2s;
            flex-shrink: 0;
        " onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
}

// Override alert with toast
window.showAlert = showToast;

// ============================================
// MOBILE SIDEBAR
// ============================================

function initMobileSidebar() {
    const toggleBtn = document.querySelector(".mobile-toggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!toggleBtn || !sidebar) return;

    // Remove existing listeners
    const newToggle = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);

    newToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    });

    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });
    }

    // Close on nav link click (mobile)
    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
                if (overlay) overlay.classList.remove("active");
            }
        });
    });
}

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================

function initPageAnimations() {
    // Fade in cards
    const cards = document.querySelectorAll('.card, .stat-card, .info-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 80);
    });
    
    // Fade in table rows
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 30);
    });
}

// ============================================
// CONFIRM DIALOG (Beautiful)
// ============================================

window.showConfirm = function(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        modal.innerHTML = `
            <div class="admin-content" style="max-width: 400px;">
                <div class="admin-header" style="background: var(--gradient-primary);">
                    <h2><i class="fas fa-question-circle"></i> ${title}</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9375rem;">${message}</p>
                    <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                        <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
                        <button class="btn btn-gradient-red" id="confirm-ok">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-cancel').onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        modal.querySelector('#confirm-ok').onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };
    });
};

// ============================================
// INITIALIZE
// ============================================

function initUI() {
    initMobileSidebar();
    
    // Page animations after a small delay
    setTimeout(initPageAnimations, 100);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
} else {
    initUI();
}

// Re-init animations when content changes
window.refreshAnimations = initPageAnimations;