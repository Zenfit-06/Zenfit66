/**
 * ZENFIT — Yoga Dashboard Script
 * Handles authentication check, user profile info, sidebar drawer toggle,
 * practice timer modal, and bookmark interactions.
 */

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

  initYogaDashboard(currentUser);
});

function initYogaDashboard(user) {
  setupUserInfo(user);
  setupSidebarToggle();
  setupLogout();
  setupBottomTabs();
  setupPracticeModal();
  setupBookmarks();
}

function setupUserInfo(user) {
  const fullName = user.fullName || user.name || 'User';
  const avatarInitials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const headerAvatarEl = document.getElementById('headerAvatarText');
  if (headerAvatarEl) {
    headerAvatarEl.textContent = avatarInitials;
  }

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) {
    sidebarAvatarEl.textContent = avatarInitials;
  }

  const sidebarNameEl = document.getElementById('sidebarUserName');
  if (sidebarNameEl) {
    sidebarNameEl.textContent = fullName;
  }
}

/* ================= SIDEBAR TOGGLE ================= */
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

/* ================= LOGOUT ================= */
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

/* ================= BOTTOM TABS ================= */
function setupBottomTabs() {
  const tabs = document.querySelectorAll('.bottom-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

/* ================= PRACTICE MODAL ================= */
let practiceInterval = null;
let secondsRemaining = 60;

function setupPracticeModal() {
  const modal = document.getElementById('practiceModal');
  const modalTitle = document.getElementById('modalPoseTitle');
  const modalClose = document.getElementById('modalCloseBtn');
  const startBtns = document.querySelectorAll('.btn-start-practice');
  const timerDisplay = document.getElementById('timerDisplay');
  const toggleTimerBtn = document.getElementById('toggleTimerBtn');

  if (!modal) return;

  startBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.pose-card');
      const poseName = card ? card.querySelector('.pose-name').textContent : 'Yoga Practice';
      if (modalTitle) modalTitle.textContent = poseName;

      resetTimer();
      modal.classList.add('show');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      clearInterval(practiceInterval);
      modal.classList.remove('show');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      clearInterval(practiceInterval);
      modal.classList.remove('show');
    }
  });

  if (toggleTimerBtn) {
    toggleTimerBtn.addEventListener('click', () => {
      if (practiceInterval) {
        clearInterval(practiceInterval);
        practiceInterval = null;
        toggleTimerBtn.textContent = 'Resume Timer';
      } else {
        startTimer();
        toggleTimerBtn.textContent = 'Pause Timer';
      }
    });
  }

  function startTimer() {
    practiceInterval = setInterval(() => {
      if (secondsRemaining > 0) {
        secondsRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(practiceInterval);
        practiceInterval = null;
        if (timerDisplay) timerDisplay.textContent = 'Done! 🧘';
        if (toggleTimerBtn) toggleTimerBtn.textContent = 'Restart Timer';
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(practiceInterval);
    practiceInterval = null;
    secondsRemaining = 60;
    updateTimerDisplay();
    if (toggleTimerBtn) toggleTimerBtn.textContent = 'Start Timer';
  }

  function updateTimerDisplay() {
    if (!timerDisplay) return;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

/* ================= BOOKMARKS ================= */
function setupBookmarks() {
  const bookmarkBtns = document.querySelectorAll('.btn-bookmark');
  bookmarkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });
}
