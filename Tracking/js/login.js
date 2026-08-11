// ========================================
//  ZENFIT — Login / Signup Scripts (Pure localStorage)
// ========================================

// In-memory user store
let usersDB = [];

/**
 * Load users from localStorage (pre-seeding from data/users.json if empty)
 */
async function loadUsers() {
    try {
        const storedUsers = localStorage.getItem('zenfit_users');
        if (storedUsers) {
            usersDB = JSON.parse(storedUsers);
            return;
        }
    } catch (err) {
        console.warn('Error reading zenfit_users from localStorage:', err);
    }

    // Pre-seed from static data/users.json file if localStorage is empty
    try {
        const response = await fetch('data/users.json');
        if (response.ok) {
            const data = await response.json();
            usersDB = data.users || [];
        }
    } catch (err) {
        console.warn('Could not load users.json, starting with default user store:', err);
        usersDB = [
            { id: 1, fullName: 'Akshat Sharma', email: 'akshat@zenfit.com', password: 'akshat123' },
            { id: 2, fullName: 'Demo User', email: 'demo@zenfit.com', password: 'demo1234' }
        ];
    }

    try {
        localStorage.setItem('zenfit_users', JSON.stringify(usersDB));
    } catch (e) {
        console.warn('Could not save initial users to localStorage:', e);
    }
}

// ========================================
//  VIEW TOGGLING (Signup ↔ Login)
// ========================================

/**
 * Switch to the Login view
 */
function showLogin(event) {
    if (event) event.preventDefault();

    // Hide signup, show login
    document.getElementById('signupView').style.display = 'none';
    document.getElementById('loginView').style.display = 'block';

    // Swap headings
    document.getElementById('signupHeading').style.display = 'none';
    document.getElementById('loginHeading').style.display = 'block';

    // Re-trigger fade-in animation
    replayAnimation('loginView');
    replayAnimation('loginHeading');

    // Re-bind focus animations for new inputs
    initInputAnimations();
}

/**
 * Switch to the Signup view
 */
function showSignup(event) {
    if (event) event.preventDefault();

    // Hide login, show signup
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('signupView').style.display = 'block';

    // Swap headings
    document.getElementById('loginHeading').style.display = 'none';
    document.getElementById('signupHeading').style.display = 'block';

    // Re-trigger fade-in animation
    replayAnimation('signupView');
    replayAnimation('signupHeading');

    // Re-bind focus animations for new inputs
    initInputAnimations();
}

/**
 * Replay CSS animation on an element by briefly removing it from the DOM flow
 */
function replayAnimation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.animation = 'none';
    // Trigger reflow
    void el.offsetHeight;
    el.style.animation = '';
}

// ========================================
//  PASSWORD TOGGLE
// ========================================

/**
 * Toggle password field visibility
 * @param {string} inputId - The ID of the password input
 * @param {HTMLElement} btn - The toggle button element
 */
function togglePasswordVisibility(inputId, btn) {
    const passwordInput = document.getElementById(inputId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// ========================================
//  STATUS TOAST
// ========================================

let toastTimeout = null;

/**
 * Show a status toast message
 * @param {string} message - Text to display
 * @param {'success'|'error'} type - Toast variant
 */
function showToast(message, type) {
    const toast = document.getElementById('statusToast');
    if (!toast) return;

    // Clear any existing timeout
    if (toastTimeout) clearTimeout(toastTimeout);

    // Reset classes
    toast.className = 'status-toast';
    toast.textContent = message;

    // Force reflow then add classes
    void toast.offsetHeight;
    toast.classList.add(type, 'visible');

    // Auto-hide after 3 seconds
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ========================================
//  SIGNUP HANDLER
// ========================================

/**
 * Handle signup form submission
 * Validates and saves new user directly into localStorage
 */
async function handleSignup(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;

    clearErrors();

    // Refresh users from localStorage
    try {
        const stored = localStorage.getItem('zenfit_users');
        if (stored) usersDB = JSON.parse(stored);
    } catch (e) {}

    // Check if email exists
    const exists = usersDB.find(u => u.email && u.email.toLowerCase() === email);
    if (exists) {
        markError('signupEmail');
        showToast('This email is already registered. Try signing in!', 'error');
        return;
    }

    const newUser = {
        id: usersDB.length > 0 ? Math.max(...usersDB.map(u => u.id || 0)) + 1 : 1,
        fullName: fullName,
        email: email,
        password: password,
        createdTime: new Date().toISOString()
    };

    usersDB.push(newUser);

    try {
        localStorage.setItem('zenfit_users', JSON.stringify(usersDB));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }

    showToast('Account created successfully! Switching to login...', 'success');

    setTimeout(() => {
        showLogin(null);
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) loginEmailInput.value = email;
    }, 1500);
}

// ========================================
//  LOGIN HANDLER
// ========================================

/**
 * Handle login form submission
 * Validates credentials via localStorage store
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    // Clear previous error states
    clearErrors();

    // Refresh users from localStorage
    try {
        const stored = localStorage.getItem('zenfit_users');
        if (stored) usersDB = JSON.parse(stored);
    } catch (e) {}

    const matched = usersDB.find(u => u.email && u.email.toLowerCase() === email);
    if (!matched) {
        markError('loginEmail');
        showToast('No account found with this email.', 'error');
        return;
    }

    if (matched.password !== password) {
        markError('loginPassword');
        showToast('Incorrect password.', 'error');
        return;
    }

    // Save active session in localStorage
    localStorage.setItem('zenfit_user', JSON.stringify(matched));
    localStorage.setItem('zenfitProfile', JSON.stringify({
        name: matched.fullName || matched.name || "User",
        email: matched.email || "",
        gender: matched.gender || "Male",
        age: matched.age || "25",
        height: matched.height || "175",
        weight: matched.weight || "70",
        goal: matched.fitnessGoal || matched.goal || "Maintain Fitness",
        bmi: matched.bmi || "22.9"
    }));
    localStorage.setItem("currentUserEmail", matched.email || "");
    showToast(`Welcome back, ${matched.fullName || 'User'}!`, 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1200);
}

// ========================================
//  ERROR HELPERS
// ========================================

/**
 * Add error styling to an input's parent group
 */
function markError(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.closest('.input-group').classList.add('error');
    }
}

/**
 * Remove all error states from input groups
 */
function clearErrors() {
    document.querySelectorAll('.input-group.error').forEach(group => {
        group.classList.remove('error');
    });
}

// ========================================
//  GOOGLE SIGN IN (placeholder)
// ========================================

function handleGoogleSignIn() {
    console.log('Google Sign In clicked — Add your OAuth configuration');
    showToast('Google Sign In coming soon!', 'error');
}

// ========================================
//  INPUT FOCUS ANIMATIONS
// ========================================

function initInputAnimations() {
    document.querySelectorAll('.input-group input').forEach(input => {
        // Remove existing listeners to avoid duplicates
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('blur', handleInputBlur);

        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });
}

function handleInputFocus() {
    this.closest('.input-group').classList.add('focused');
    this.closest('.input-group').classList.remove('error');
}

function handleInputBlur() {
    this.closest('.input-group').classList.remove('focused');
}

// ========================================
//  INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load users from localStorage / static JSON
    await loadUsers();

    // Init input animations
    initInputAnimations();
});

