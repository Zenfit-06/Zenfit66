document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication check via localStorage
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

  initHealthDashboard(currentUser);
});

function initHealthDashboard(user) {
  setupUserInfo(user);
  setupSidebarToggle();
  setupSleepChart();
  setupHeightRuler();
  setupDropdown();
  setupLogout();
  setupBottomTabs();
}

/**
 * Setup sidebar toggle and backdrop
 */
function setupSidebarToggle() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop') || document.getElementById('sidebarOverlay');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn') || document.getElementById('sidebarClose');

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.add('sidebar-open');
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      document.body.classList.remove('sidebar-open');
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      document.body.classList.remove('sidebar-open');
    });
  }
}

/**
 * Setup user information in header and sidebar
 */
function setupUserInfo(user) {
  let rawName = user.fullName || user.name || user.email || 'User';
  if (rawName.includes('@')) {
    const parts = rawName.split('@');
    if (parts[0]) rawName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  const fullName = rawName;

  const avatarInitials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  // Header & Sidebar Initials
  const headerAvatarTextEl = document.getElementById('userAvatarBadgeText');
  if (headerAvatarTextEl) {
    headerAvatarTextEl.textContent = avatarInitials;
  } else {
    const headerAvatarEl = document.getElementById('userAvatarBadge');
    if (headerAvatarEl && headerAvatarEl.firstChild) headerAvatarEl.firstChild.textContent = avatarInitials;
  }

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) sidebarAvatarEl.textContent = avatarInitials;

  const sidebarNameEl = document.getElementById('sidebarUserName');
  if (sidebarNameEl) sidebarNameEl.textContent = fullName;

  const sidebarBadgeEl = document.getElementById('sidebarUserBadge');
  if (sidebarBadgeEl) {
    sidebarBadgeEl.textContent = '👑 Pro Member 👋';
    sidebarBadgeEl.style.color = '#FF7043';
    sidebarBadgeEl.style.fontWeight = '600';
  }

  // Dynamic Height
  const heightValEl = document.getElementById('heightValueText');
  const floatingBadge = document.getElementById('heightFloatingBadge');
  const userHeight = parseFloat(user.height) || 175;
  if (heightValEl) heightValEl.textContent = Math.round(userHeight);
  if (floatingBadge) {
    floatingBadge.textContent = Math.round(userHeight);
    const minHeight = 150;
    const maxHeight = 190;
    const pct = Math.max(0, Math.min(100, ((userHeight - minHeight) / (maxHeight - minHeight)) * 100));
    floatingBadge.style.left = `${pct}%`;
  }

  // Dynamic Weight
  const weightValEl = document.getElementById('weightValueText');
  const userWeight = parseFloat(user.weight) || 72.0;
  if (weightValEl) weightValEl.textContent = userWeight.toFixed(1);

  // Dynamic BMI Calculation
  let userBmi = parseFloat(user.bmi);
  if (!userBmi || isNaN(userBmi)) {
    const hM = userHeight / 100;
    userBmi = (userWeight / (hM * hM)).toFixed(1);
    user.bmi = userBmi;
  } else {
    userBmi = userBmi.toFixed(1);
  }

  const bmiValEl = document.getElementById('bmiValueText');
  if (bmiValEl) bmiValEl.textContent = userBmi;

  // BMI Category & Pointer Placement
  const bmiBadge = document.getElementById('bmiStatusBadge');
  const bmiPointer = document.getElementById('bmiPointer');
  let category = 'Normal';
  let badgeColor = '#15803D';
  let badgeBg = '#DCFCE7';
  let pct = 42;

  const bmiNum = parseFloat(userBmi);
  if (bmiNum < 18.5) {
    category = 'Underweight';
    badgeColor = '#1D4ED8';
    badgeBg = '#E0F2FE';
    pct = Math.max(5, (bmiNum / 18.5) * 20);
  } else if (bmiNum < 25) {
    category = 'Normal';
    badgeColor = '#15803D';
    badgeBg = '#DCFCE7';
    pct = 20 + ((bmiNum - 18.5) / (25 - 18.5)) * 40;
  } else if (bmiNum < 30) {
    category = 'Overweight';
    badgeColor = '#B45309';
    badgeBg = '#FEF3C7';
    pct = 60 + ((bmiNum - 25) / (30 - 25)) * 20;
  } else {
    category = 'Obese';
    badgeColor = '#B91C1C';
    badgeBg = '#FEE2E2';
    pct = Math.min(95, 80 + ((bmiNum - 30) / 10) * 15);
  }

  if (bmiBadge) {
    bmiBadge.textContent = category;
    bmiBadge.style.color = badgeColor;
    bmiBadge.style.backgroundColor = badgeBg;
  }

  if (bmiPointer) {
    bmiPointer.style.left = `${pct}%`;
  }
}

function openSidebar() {
  document.body.classList.add('sidebar-open');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
}

function setupSidebarToggle() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

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

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      closeSidebar();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });
}

/**
 * Render Sleep SVG Line Chart with gradient fill & Sunday highlight pill
 */
function setupSleepChart() {
  const chartContainer = document.getElementById('sleepChartContainer');
  if (!chartContainer) return;

  // Sleep Data (Hours)
  // Mon: 7h 20m (7.33), Tue: 6h 45m (6.75), Wed: 8h 10m (8.16), Thu: 6h 30m (6.5), Fri: 8h 50m (8.83), Sat: 9h 15m (9.25), Sun: 8h 12m (8.2)
  const sleepData = [
    { day: 'Mon', val: 7.33, label: '7h 20m' },
    { day: 'Tue', val: 6.75, label: '6h 45m' },
    { day: 'Wed', val: 8.16, label: '8h 10m' },
    { day: 'Thu', val: 6.5, label: '6h 30m' },
    { day: 'Fri', val: 8.83, label: '8h 50m' },
    { day: 'Sat', val: 9.25, label: '9h 15m' },
    { day: 'Sun', val: 8.2, label: '8h 12m', highlight: true }
  ];

  renderSleepGraph(sleepData);
}

function renderSleepGraph(data) {
  const container = document.getElementById('sleepChartContainer');
  if (!container) return;

  const width = 850;
  const height = 220;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 35;
  const paddingBottom = 30;

  const maxVal = 10; // 10h
  const minVal = 0;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const stepX = chartWidth / (data.length - 1);

  // Map values to coordinates
  const points = data.map((d, idx) => {
    const x = paddingLeft + idx * stepX;
    const y = paddingTop + chartHeight - (d.val / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG Path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const controlX = (p1.x + p2.x) / 2;
    pathD += ` C ${controlX} ${p1.y}, ${controlX} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  // Area Fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Grid Lines Y
  const yTicks = [10, 8, 6, 4, 2, 0];
  let gridSvg = '';
  yTicks.forEach(tick => {
    const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
    gridSvg += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="0" />
      <text x="${paddingLeft - 18}" y="${y + 4}" fill="#94A3B8" font-size="11" font-weight="500" text-anchor="end">${tick}h</text>
    `;
  });

  // Markers & Labels SVG
  let pointsSvg = '';
  points.forEach((p, idx) => {
    // Adjust text alignment for the first data point to keep it clear of Y-axis ticks
    let textAnchor = 'middle';
    let textX = p.x;
    if (idx === 0) {
      textAnchor = 'start';
      textX = p.x - 5;
    } else if (idx === points.length - 1 && !p.highlight) {
      textAnchor = 'end';
      textX = p.x + 5;
    }

    // Value text floating above dot if defined
    let valueText = `
      <text x="${textX}" y="${p.y - 10}" fill="${p.highlight ? '#00838F' : '#64748B'}" font-size="11" font-weight="${p.highlight ? '700' : '600'}" text-anchor="${textAnchor}">${p.label}</text>
    `;

    // Sunday Callout Badge
    if (p.highlight) {
      valueText = `
        <g transform="translate(${p.x}, ${p.y - 28})">
          <rect x="-30" y="-12" width="60" height="22" rx="11" fill="#00838F" />
          <text x="0" y="3" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle">${p.label}</text>
        </g>
      `;
    }

    pointsSvg += `
      ${valueText}
      <circle cx="${p.x}" cy="${p.y}" r="${p.highlight ? 6 : 5}" fill="${p.highlight ? '#00838F' : '#00BCD4'}" stroke="#FFFFFF" stroke-width="2.5" />
    `;
  });

  const svgContent = `
    <svg viewBox="0 0 ${width} ${height}" class="sleep-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00BCD4" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#00BCD4" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Grid -->
      ${gridSvg}

      <!-- Gradient Area -->
      <path d="${areaD}" fill="url(#sleepGradient)" />

      <!-- Smooth Curve Line -->
      <path d="${pathD}" fill="none" stroke="#00BCD4" stroke-width="3" stroke-linecap="round" />

      <!-- Data Points & Callout Badges -->
      ${pointsSvg}
    </svg>
  `;

  container.innerHTML = svgContent;
}

/**
 * Height Ruler Slider Interaction
 */
function setupHeightRuler() {
  const rulerTrack = document.getElementById('rulerTrack');
  const heightValEl = document.getElementById('heightValueText');
  const floatingBadge = document.getElementById('heightFloatingBadge');

  if (!rulerTrack || !heightValEl || !floatingBadge) return;

  const minHeight = 150;
  const maxHeight = 190;

  function updateHeightFromX(clientX) {
    const rect = rulerTrack.getBoundingClientRect();
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));

    const currentHeight = Math.round(minHeight + percentage * (maxHeight - minHeight));

    heightValEl.textContent = currentHeight;
    floatingBadge.textContent = currentHeight;
    floatingBadge.style.left = `${percentage * 100}%`;

    // Recalculate BMI dynamically
    const wKg = 72; // default if not available
    const hM = currentHeight / 100;
    const newBmi = (wKg / (hM * hM)).toFixed(1);
    
    const bmiValEl = document.getElementById('bmiValueText');
    if (bmiValEl) bmiValEl.textContent = newBmi;

    const bmiBadge = document.getElementById('bmiStatusBadge');
    const bmiPointer = document.getElementById('bmiPointer');
    const bmiNum = parseFloat(newBmi);
    let category = 'Normal';
    let badgeColor = '#15803D';
    let badgeBg = '#DCFCE7';
    let pct = 42;

    if (bmiNum < 18.5) {
      category = 'Underweight';
      badgeColor = '#1D4ED8';
      badgeBg = '#E0F2FE';
      pct = Math.max(5, (bmiNum / 18.5) * 20);
    } else if (bmiNum < 25) {
      category = 'Normal';
      badgeColor = '#15803D';
      badgeBg = '#DCFCE7';
      pct = 20 + ((bmiNum - 18.5) / (25 - 18.5)) * 40;
    } else if (bmiNum < 30) {
      category = 'Overweight';
      badgeColor = '#B45309';
      badgeBg = '#FEF3C7';
      pct = 60 + ((bmiNum - 25) / (30 - 25)) * 20;
    } else {
      category = 'Obese';
      badgeColor = '#B91C1C';
      badgeBg = '#FEE2E2';
      pct = Math.min(95, 80 + ((bmiNum - 30) / 10) * 15);
    }

    if (bmiBadge) {
      bmiBadge.textContent = category;
      bmiBadge.style.color = badgeColor;
      bmiBadge.style.backgroundColor = badgeBg;
    }
    if (bmiPointer) bmiPointer.style.left = `${pct}%`;

    // Persist updated height and BMI directly to localStorage
    try {
      const currentUser = JSON.parse(localStorage.getItem('zenfit_user') || '{}');
      currentUser.height = currentHeight;
      currentUser.bmi = newBmi;
      localStorage.setItem('zenfit_user', JSON.stringify(currentUser));

      try {
        const prof = JSON.parse(localStorage.getItem('zenfitProfile') || '{}');
        prof.height = currentHeight;
        prof.bmi = newBmi;
        localStorage.setItem('zenfitProfile', JSON.stringify(prof));
      } catch (e) {}

      const users = JSON.parse(localStorage.getItem('zenfit_users') || '[]');
      const idx = users.findIndex(u => u.id === currentUser.id || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase()));
      if (idx !== -1) {
        users[idx].height = currentHeight;
        users[idx].bmi = newBmi;
        localStorage.setItem('zenfit_users', JSON.stringify(users));
      }
    } catch (e) {
      console.error('Error persisting height:', e);
    }
  }

  let isDragging = false;

  rulerTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateHeightFromX(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateHeightFromX(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support for mobile
  rulerTrack.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateHeightFromX(e.touches[0].clientX);
  });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) updateHeightFromX(e.touches[0].clientX);
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/**
 * Dropdown Filter Selector
 */
function setupDropdown() {
  const dropdownBtn = document.getElementById('sleepTimeframeBtn');
  if (!dropdownBtn) return;

  const timeframes = ['This Week', 'Last Week', 'This Month'];
  let currentIndex = 0;

  dropdownBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % timeframes.length;
    const labelSpan = dropdownBtn.querySelector('span');
    if (labelSpan) labelSpan.textContent = timeframes[currentIndex];

    // Update sleep graph data slightly for realism
    if (currentIndex === 1) {
      renderSleepGraph([
        { day: 'Mon', val: 6.5, label: '6h 30m' },
        { day: 'Tue', val: 7.2, label: '7h 12m' },
        { day: 'Wed', val: 7.5, label: '7h 30m' },
        { day: 'Thu', val: 8.0, label: '8h 00m' },
        { day: 'Fri', val: 6.8, label: '6h 48m' },
        { day: 'Sat', val: 8.5, label: '8h 30m' },
        { day: 'Sun', val: 7.8, label: '7h 48m', highlight: true }
      ]);
    } else if (currentIndex === 2) {
      renderSleepGraph([
        { day: 'W1', val: 7.5, label: '7h 30m' },
        { day: 'W2', val: 8.1, label: '8h 06m' },
        { day: 'W3', val: 7.8, label: '7h 48m' },
        { day: 'W4', val: 8.2, label: '8h 12m', highlight: true }
      ]);
    } else {
      setupSleepChart();
    }
  });
}

/**
 * Logout Handler
 */
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('zenfit_user');
      window.location.href = 'login.html';
    });
  }
}

function setupBottomTabs() {
  const dailyTab = document.getElementById('tab-daily');
  if (dailyTab) {
    dailyTab.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
  const athletesTab = document.getElementById('tab-athletes');
  if (athletesTab) {
    athletesTab.addEventListener('click', () => {
      window.location.href = 'athletes.html';
    });
  }
  const yogaTab = document.getElementById('tab-yoga');
  if (yogaTab) {
    yogaTab.addEventListener('click', () => {
      window.location.href = 'yoga.html';
    });
  }
  const nutritionTab = document.getElementById('tab-nutrition');
  if (nutritionTab) {
    nutritionTab.addEventListener('click', () => {
      window.location.href = 'nutrition.html';
    });
  }
}
