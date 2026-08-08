/**
 * ZENFIT Fitness Dashboard — Main Script
 * Handles auth, greeting, animations, heatmap, sparkline, map, navigation.
 */

const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '3000' ? '' : 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Check via localStorage
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('zenfit_user') || 'null');
    } catch (e) {
        currentUser = null;
    }

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    initDashboard(currentUser);
    showProfileModal(currentUser);
});

// ========================================
//  INIT
// ========================================

function initDashboard(user) {
    setupUserInfo(user);
    requestAnimationFrame(() => {
        animateProgressBars();
        animateCircularRing();
        generateSparkline();
        generateHeatmap();
        generateActivityMap();
        setupSidebarToggle();
        setupNavigation();
        setupBottomTabs();
        setupLogout();
        triggerEntranceAnimations();
    });
}

// ========================================
//  USER INFO & GREETING
// ========================================

function setupUserInfo(user) {
    const hour = new Date().getHours();
    let greetingText = 'Good Evening';
    if (hour < 12) greetingText = 'Good Morning';
    else if (hour < 18) greetingText = 'Good Afternoon';

    const fullName = user.fullName || user.name || 'User';
    const firstName = fullName.split(' ')[0];

    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        greetingEl.textContent = `${greetingText}, ${firstName}! 👋`;
    }

    const avatarInitials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const sidebarAvatarEl = document.getElementById('userAvatar');
    if (sidebarAvatarEl) {
        sidebarAvatarEl.textContent = avatarInitials;
    }

    const headerAvatarEl = document.getElementById('headerAvatarText');
    if (headerAvatarEl) {
        headerAvatarEl.textContent = avatarInitials;
    }

    const sidebarNameEl = document.getElementById('userName');
    if (sidebarNameEl) {
        sidebarNameEl.textContent = fullName;
    }
}

// ========================================
//  PROGRESS BARS
// ========================================

function animateProgressBars() {
    const bars = document.querySelectorAll('.progress-bar, .weekly-bar');
    bars.forEach(bar => {
        const target = bar.style.getPropertyValue('--progress');
        if (target) {
            bar.style.width = '0%';
            void bar.offsetWidth; // Force reflow
            requestAnimationFrame(() => {
                bar.style.width = target;
            });
        }
    });
}

// ========================================
//  CIRCULAR PROGRESS RING
// ========================================

function animateCircularRing() {
    const ring = document.querySelector('.ring-progress');
    if (!ring) return;

    const radius = parseFloat(ring.getAttribute('r')) || 34;
    const circumference = 2 * Math.PI * radius;
    const percent = 0.92; // 92%
    const targetOffset = circumference * (1 - percent);

    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;

    void ring.getBoundingClientRect(); // Force reflow

    requestAnimationFrame(() => {
        ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        ring.style.strokeDashoffset = `${targetOffset}`;
    });
}

// ========================================
//  SPARKLINE
// ========================================

function generateSparkline() {
    const container = document.getElementById('sparkline');
    if (!container) return;

    const data = [60, 65, 58, 72, 68, 75, 80, 78, 85, 88, 92];
    const width = 120;
    const height = 32;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height * 0.75) - (height * 0.1);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    container.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
            <defs>
                <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <polygon points="0,${height} ${points} ${width},${height}" fill="url(#sparkFill)"/>
            <polyline points="${points}" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

// ========================================
//  ACTIVITY HEATMAP
// ========================================

function generateHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;

    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cols = 31;
    const headerPositions = [1, 5, 10, 15, 20, 25, 31];

    let html = '<div style="display:flex;flex-direction:column;gap:2.5px;width:100%;">';

    // Column numbers header
    html += '<div style="display:flex;gap:2.5px;margin-bottom:2px;">';
    html += '<div style="width:26px;"></div>';
    for (let i = 1; i <= cols; i++) {
        const label = headerPositions.includes(i) ? i : '';
        html += `<div style="width:9px;text-align:center;font-size:7.5px;color:#94a3b8;font-weight:500;">${label}</div>`;
    }
    html += '</div>';

    // Heatmap Rows (Mon to Sun)
    for (let r = 0; r < 7; r++) {
        html += '<div style="display:flex;gap:2.5px;align-items:center;">';
        html += `<div style="width:26px;font-size:8px;color:#64748b;text-align:right;padding-right:3px;font-weight:500;">${days[r]}</div>`;

        for (let c = 1; c <= cols; c++) {
            const level = Math.floor(Math.random() * 5);
            const color = colors[level];
            const delay = (r * cols + c) * 2;
            html += `<div style="width:9px;height:9px;border-radius:2px;background:${color};opacity:0;animation:heatmapFadeIn 0.3s ease forwards ${delay}ms;" title="Day ${c}: ${level} workouts"></div>`;
        }
        html += '</div>';
    }
    html += '</div>';

    if (!document.getElementById('heatmap-anim')) {
        const style = document.createElement('style');
        style.id = 'heatmap-anim';
        style.textContent = `
            @keyframes heatmapFadeIn {
                from { opacity: 0; transform: scale(0.6); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = html;
}

// ========================================
//  ACTIVITY MAP (SVG Route)
// ========================================

function generateActivityMap() {
    const container = document.getElementById('activityMap');
    if (!container) return;

    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" style="display:block;">
            <!-- Light map background roads -->
            <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" stroke-width="2"/>
            <line x1="0" y1="75" x2="400" y2="75" stroke="#e2e8f0" stroke-width="2"/>
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e2e8f0" stroke-width="2"/>
            <line x1="80" y1="0" x2="80" y2="150" stroke="#e2e8f0" stroke-width="2"/>
            <line x1="200" y1="0" x2="200" y2="150" stroke="#e2e8f0" stroke-width="2"/>
            <line x1="320" y1="0" x2="320" y2="150" stroke="#e2e8f0" stroke-width="2"/>

            <!-- Route line -->
            <polyline points="30,120 70,100 110,110 160,65 210,75 260,40 310,55 370,35"
                      fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
                      style="filter:drop-shadow(0 2px 4px rgba(14,165,233,0.3));"
                      stroke-dasharray="600" stroke-dashoffset="600">
                <animate attributeName="stroke-dashoffset" from="600" to="0" dur="1.5s" fill="freeze" begin="0.3s"/>
            </polyline>

            <!-- Start marker -->
            <circle cx="30" cy="120" r="6" fill="#22c55e" stroke="#fff" stroke-width="2" opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="0.4s"/>
            </circle>

            <!-- End marker -->
            <circle cx="370" cy="35" r="6" fill="#ef4444" stroke="#fff" stroke-width="2" opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" begin="1.8s"/>
            </circle>
        </svg>
    `;
}

// ========================================
//  SIDEBAR TOGGLE (Mobile)
// ========================================

function openSidebar() {
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

function setupSidebarToggle() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.body.classList.contains('sidebar-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeSidebar();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// ========================================
//  SIDEBAR NAVIGATION
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {

        item.addEventListener('click', () => {

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            closeSidebar();

        });

    });
}
// ========================================
//  BOTTOM TAB BAR
// ========================================

function setupBottomTabs() {
    const tabs = document.querySelectorAll('.bottom-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.id === 'tab-health') {
                window.location.href = 'health.html';
            } else if (tab.id === 'tab-athletes') {
                window.location.href = 'athletes.html';
            } else if (tab.id === 'tab-yoga') {
                window.location.href = 'yoga.html';
            }
        });
    });
}

// ========================================
//  LOGOUT
// ========================================

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Log out of ZENFIT?')) {
                localStorage.removeItem('zenfit_user');
                window.location.href = 'login.html';
            }
        });
    }
}


function triggerEntranceAnimations() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        card.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`;

        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
}


function showProfileModal(user) {
    const modal = document.getElementById("profileModal");
    if (!modal) return;

    // Only show if age, gender, height, or weight are missing
    if (!user || !user.age || !user.gender || !user.height || !user.weight) {
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }
}

const saveProfileBtn = document.getElementById("saveProfile");
if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", () => {

        const age = document.getElementById("age");
        const gender = document.getElementById("gender");
        const height = document.getElementById("height");
        const weight = document.getElementById("weight");

        // Reset
        document.querySelectorAll(".error").forEach(e => e.textContent = "");
        document.querySelectorAll("input,select").forEach(e => e.classList.remove("input-error"));

        let valid = true;

        const ageVal = parseFloat(age.value);
        const heightVal = parseFloat(height.value);
        const weightVal = parseFloat(weight.value);

        if (isNaN(ageVal) || ageVal <= 0 || ageVal > 120) {
            document.getElementById("ageError").textContent = "Please enter a valid age (1 - 120)";
            age.classList.add("input-error");
            valid = false;
        }

        if (gender.value === "") {
            document.getElementById("genderError").textContent = "Please select gender";
            gender.classList.add("input-error");
            valid = false;
        }

        if (isNaN(heightVal) || heightVal < 50 || heightVal > 300) {
            document.getElementById("heightError").textContent = "Please enter a valid height in cm (50 - 300)";
            height.classList.add("input-error");
            valid = false;
        }

        if (isNaN(weightVal) || weightVal < 10 || weightVal > 500) {
            document.getElementById("weightError").textContent = "Please enter a valid weight in kg (10 - 500)";
            weight.classList.add("input-error");
            valid = false;
        }

        if (!valid) return;

        const heightInMeter = heightVal / 100;
        const bmiVal = (weightVal / (heightInMeter * heightInMeter)).toFixed(1);

        const updates = {
            age: age.value,
            gender: gender.value,
            height: height.value,
            weight: weight.value,
            bmi: bmiVal
        };

        const currentUser = JSON.parse(localStorage.getItem('zenfit_user') || '{}');
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('zenfit_user', JSON.stringify(updatedUser));
        setupUserInfo(updatedUser);

        // Also update usersDB list in localStorage
        try {
            const users = JSON.parse(localStorage.getItem('zenfit_users') || '[]');
            const idx = users.findIndex(u => u.id === updatedUser.id || (u.email && u.email.toLowerCase() === updatedUser.email?.toLowerCase()));
            if (idx !== -1) {
                users[idx] = { ...users[idx], ...updates };
                localStorage.setItem('zenfit_users', JSON.stringify(users));
            }
        } catch (e) {}

        document.getElementById("profileModal").style.display = "none";
    });
}






