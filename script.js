// =============================================
//   STUDENT EXPENSE TRACKER — MAIN SCRIPT
// =============================================


// =============================================
//   LANDING PAGE — NAVBAR SCROLL EFFECT
//   Adds a frosted-glass background to the
//   navbar once the user scrolls past 50px
// =============================================
const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    // Toggle .scrolled class — CSS handles the visual change
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}


// =============================================
//   LANDING PAGE — MOBILE HAMBURGER TOGGLE
//   Toggles .open on the nav-links list
// =============================================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close the mobile menu when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// =============================================
//   DASHBOARD APP — MOBILE SIDEBAR DRAWER
// =============================================
const appSidebarToggle = document.getElementById('sidebarToggle');
const floatingSidebar = document.querySelector('.floating-sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (appSidebarToggle && floatingSidebar && sidebarOverlay) {
  appSidebarToggle.addEventListener('click', () => {
    floatingSidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  });

  const closeSidebar = () => {
    floatingSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  sidebarOverlay.addEventListener('click', closeSidebar);
  floatingSidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeSidebar));
}

// =============================================
//   SMOOTH SCROLL
//   Only intercepts anchor (#) links where the
//   target element actually exists on this page.
//   Skips preventDefault if target not found,
//   so cross-page links like login.html work fine.
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;           // bare # links — do nothing
    const target = document.querySelector(href);
    if (!target) return;               // target not on this page — let browser handle it
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// =============================================
//   FADE-IN ON SCROLL
//   Uses IntersectionObserver to add .visible
//   when elements enter the viewport.
//   Also immediately marks any .fade-in element
//   already visible on page load (auth pages).
// =============================================
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.05 }
  );
  fadeEls.forEach(el => observer.observe(el));
  setTimeout(() => {
    fadeEls.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible'); });
  }, 50);
}


// =============================================
//   FINTRACK GLOBAL APP LOGIC
// =============================================
const isAppPage = document.querySelector('.lifestyle-body:not(.auth-page)');
const isAuthPage = document.querySelector('.auth-page');

// --- API & HELPERS ---
const API_BASE_URL =
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://fintrack-student-expense-tracker.onrender.com';

/**
 * Shows a toast notification at the bottom of the screen.
 * @param {string} message The message to display.
 * @param {'success'|'error'} type The type of toast.
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  
  Object.assign(toast.style, {
    position: 'fixed', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)', padding: '12px 20px',
    borderRadius: '8px', color: '#fff',
    backgroundColor: type === 'error' ? '#ef4444' : '#22c55e',
    zIndex: '10000', opacity: '0',
    transition: 'opacity 0.3s, bottom 0.3s', fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  });

  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '1'; toast.style.bottom = '40px'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.bottom = '20px';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * A reusable fetch wrapper for the FinTrack API.
 * @param {string} endpoint The API endpoint (e.g., '/transactions').
 * @param {object} options The options for the fetch call.
 * @returns {Promise<any>} The JSON response from the API.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('fintrack_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401 && isAppPage) {
      localStorage.removeItem('fintrack_token');
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    showToast(error.message, 'error');
    throw error;
  }
}

// --- AUTHENTICATION ---

async function handleLogin(email, password, submitBtn, errorEl) {
  submitBtn.classList.add('btn-loading');
  submitBtn.textContent = 'Logging in...';
  errorEl.textContent = '';

  try {
    const data = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data && data.token) {
      localStorage.setItem('fintrack_token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      errorEl.textContent = 'Login failed. No token received.';
    }
  } catch (error) {
    errorEl.textContent = error.message;
  } finally {
    submitBtn.classList.remove('btn-loading');
    submitBtn.textContent = 'Login';
  }
}

async function handleRegister(fullName, email, password, submitBtn, errorEl) {
  submitBtn.classList.add('btn-loading');
  submitBtn.textContent = 'Creating Account...';
  errorEl.textContent = '';

  try {
    const data = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, email, password }),
    });
    if (data && data.token) {
      localStorage.setItem('fintrack_token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      errorEl.textContent = 'Signup failed. No token received.';
    }
  } catch (error) {
    errorEl.textContent = error.message;
  } finally {
    submitBtn.classList.remove('btn-loading');
    submitBtn.textContent = 'Create Account';
  }
}

function handleLogout() {
  localStorage.removeItem('fintrack_token');
  window.location.href = 'login.html';
}

// --- APP LOGIC (for authenticated pages) ---

if (isAppPage) {
  if (!localStorage.getItem('fintrack_token')) {
    window.location.href = 'login.html';
  }

  const state = { user: null, transactions: [], friends: [], settings: null };

  const catIcons = { 'Food & Snacks': 'fa-burger', 'College Life': 'fa-book-open', 'Online & Random': 'fa-box-open', 'Commute': 'fa-train-subway', 'Social': 'fa-users', 'Friend Settlement': 'fa-handshake' };
  const catColors = { 'Food & Snacks': 'var(--cat-food)', 'College Life': 'var(--cat-college)', 'Online & Random': 'var(--cat-shopping)', 'Commute': 'var(--cat-travel)', 'Social': 'var(--cat-entertainment)', 'Friend Settlement': '#60a5fa' };
  const payIcons = { 'UPI': 'fa-mobile', 'Cash': 'fa-money-bill', 'Bank Transfer': 'fa-building-columns', 'UPI / GPay': 'fa-mobile', 'PhonePe': 'fa-mobile', 'Paytm': 'fa-mobile', 'Bank Account': 'fa-building-columns' };
  const sassyLabels = { 'Food & Snacks': 'Late-night cravings dominating', 'College Life': 'Assignment printing trauma', 'Social': 'Group math survivor', 'Online & Random': 'Impulse decision', 'Commute': 'Surge pricing victim', 'Friend Settlement': 'Honoring debts' };

  // --- API CALLS ---
  async function fetchAllData() {
    try {
      const [userData, txData, friendsData, settingsData] = await Promise.all([
        apiFetch('/api/v1/auth/me'),
        apiFetch('/api/v1/transactions'),
        apiFetch('/api/v1/friends'),
        apiFetch('/api/v1/settings')
      ]);
      
      state.user = userData.user || userData.data || userData;
      state.transactions = Array.isArray(txData) ? txData : (txData.data || []);
      state.friends = Array.isArray(friendsData) ? friendsData : (friendsData.data || []);
      state.settings = settingsData.data || {};

      if (!state.user.balances) {
        state.user.balances = { cash: 0, gpay: 0, phonepe: 0, paytm: 0, bank: 0, emergency: state.settings.emergencyReserve || 2000 };
        state.transactions.forEach(tx => {
          const amt = tx.amount; 
          const method = (tx.method || '').toLowerCase();
          if (method.includes('cash')) state.user.balances.cash += amt;
          else if (method.includes('phonepe')) state.user.balances.phonepe += amt;
          else if (method.includes('paytm')) state.user.balances.paytm += amt;
          else if (method.includes('upi') || method.includes('gpay')) state.user.balances.gpay += amt;
          else state.user.balances.bank += amt; 
        });
      }
      
      state.user.monthlyBudget = state.settings.monthlyBudget || 5000;

      updateUI();
    } catch (error) {
      showToast("Could not load your data. Please refresh.", 'error');
    }
  }

  async function addTransaction(txData, modal, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;
    }
    try {
      await apiFetch('/api/v1/transactions', { method: 'POST', body: JSON.stringify(txData) });
      showToast(txData.type === 'expense' ? 'Expense added!' : 'Money added!');
      modal.classList.remove('open');
      form.reset();
      fetchAllData();
    } catch (error) { /* Toast is handled by apiFetch */ }
    finally {
      if (submitBtn) {
        submitBtn.textContent = submitBtn.dataset.originalText;
        submitBtn.disabled = false;
      }
    }
  }

  async function saveSettings(updates) {
    try {
      const response = await apiFetch('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      state.settings = response.data;
      if (updates.monthlyBudget !== undefined) state.user.monthlyBudget = updates.monthlyBudget;
      if (updates.emergencyReserve !== undefined) state.user.balances.emergency = updates.emergencyReserve;
      showToast('Settings saved automatically');
      updateUI();
    } catch(err) {
      console.error('Settings save failed', err);
    }
  }

  async function deleteTransaction(id, btnElement) {
    if (confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
      if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      }
      try {
        await apiFetch(`/api/v1/transactions/${id}`, { method: 'DELETE' });
        showToast('Transaction deleted.');
        fetchAllData();
      } catch (error) { 
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        }
      }
    }
  }

  async function addFriendDebt(debtData) {
    try {
      await apiFetch('/api/v1/friends', { method: 'POST', body: JSON.stringify(debtData) });
      showToast('Friend debt added!');
      fetchAllData();
    } catch (error) { /* Handled by apiFetch */ }
  }

  async function settleFriendDebt(id, total) {
    if (confirm('Mark this debt as fully returned?')) {
      const method = prompt('Received/Paid via (e.g. GPay, Cash, PhonePe):', 'GPay');
      if (!method) return; // Action cancelled
      try {
        await apiFetch(`/api/v1/friends/${id}`, { method: 'PUT', body: JSON.stringify({ returned: total, method }) });
        showToast('Debt settled!');
        fetchAllData();
      } catch (error) { /* Handled by apiFetch */ }
    }
  }

  window.deleteTx = deleteTransaction;
  window.recordReturn = settleFriendDebt;

  window.settleAll = async (name) => {
    if (!confirm(`Mark all pending splits with ${name} as settled?`)) return;
    const method = prompt('Received/Paid via (e.g. GPay, Cash, PhonePe):', 'GPay');
    if (!method) return;
    const pendingDebts = state.friends.filter(f => f.name === name && (f.returned || 0) < f.total);
    for (const debt of pendingDebts) {
      try {
        await apiFetch(`/api/v1/friends/${debt.id || debt._id}`, { method: 'PUT', body: JSON.stringify({ returned: debt.total, method }) });
      } catch(e) { console.error(e); }
    }
    showToast(`All settled with ${name}!`);
    fetchAllData();
  };

  window.splitWith = (name) => {
      const reason = prompt(`Reason for split with ${name}:`); if (!reason) return;
      const typeInput = prompt('Who paid?\n1: I paid (They owe me)\n2: They paid (I owe them)', '1');
      if (!typeInput) return;
      const type = typeInput === '2' ? 'borrowed' : 'lent';

      let total = 0, totalPaid = 0, method = 'UPI';

      if (type === 'lent') {
          totalPaid = parseFloat(prompt('Total bill amount YOU paid (₹):'));
          if (isNaN(totalPaid) || totalPaid <= 0) return showToast('Invalid amount.', 'error');
          total = parseFloat(prompt(`How much does ${name} owe you out of ₹${totalPaid}?`));
          method = prompt('Payment Method (e.g. GPay, Cash, PhonePe):', 'GPay') || 'GPay';
      } else {
          total = parseFloat(prompt(`How much do you owe ${name}? (₹)`));
      }

      if (isNaN(total) || total <= 0) return showToast('Invalid amount.', 'error');

      addFriendDebt({ name, reason, total, returned: 0, type, totalPaid, method });
  };

  // --- UI RENDERING ---
  function updateUI() {
    if (!state.user) return;
    const userName = state.user.name || state.user.fullName || 'Student';
    document.querySelectorAll('.sp-name').forEach(el => el.textContent = userName);
    document.querySelectorAll('.sp-avatar').forEach(el => el.textContent = userName.charAt(0).toUpperCase());

    if (document.body.classList.contains('page-dashboard')) renderDashboard();
    if (document.body.classList.contains('page-transactions')) renderTimeline(document.getElementById('tx-page-list'), state.transactions);
    if (document.body.classList.contains('page-friends')) renderFriendsPage();
    if (document.body.classList.contains('page-insights')) renderInsightsPage();
    if (document.body.classList.contains('page-wallet')) renderWalletPage();
    if (document.body.classList.contains('page-settings')) renderSettingsPage();
  }

  function renderDashboard() {
    const els = {
      date: document.getElementById('story-date'), greeting: document.getElementById('story-greeting'),
      sub: document.getElementById('story-sub'), totalBal: document.getElementById('main-bal'),
      upiBal: document.getElementById('upi-bal'), cashBal: document.getElementById('cash-bal'),
      phonepeBal: document.getElementById('phonepe-bal'), paytmBal: document.getElementById('paytm-bal'),
      bankBal: document.getElementById('bank-bal'), emergencyBal: document.getElementById('emergency-bal'),
      vibeDot: document.getElementById('vibe-dot'), vibeText: document.getElementById('vibe-text'),
      walletVibe: document.getElementById('wallet-vibe'), sidebarMood: document.getElementById('sidebar-mood'),
      sidebarSplits: document.getElementById('sidebar-splits')
    };
    if (els.date) els.date.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
    
    renderOverview(els);
    renderTimeline(document.getElementById('timeline-list'), state.transactions.slice(0, 4));
    renderFriends(document.getElementById('social-list'), state.friends, els);
    renderBubbles(document.getElementById('bubble-list'), state.transactions);
    renderSurvivalTracker();
  }

  function renderOverview(els) {
    if (!els.totalBal || !state.user) return;
    const { balances, monthlyBudget } = state.user;
    const total = state.user.totalBalance !== undefined ? state.user.totalBalance : (balances.cash + balances.gpay + balances.phonepe + balances.paytm + balances.bank);
    
    animateValue(els.totalBal, total);
    animateValue(els.upiBal, balances.gpay);
    animateValue(els.cashBal, balances.cash);
    if(els.phonepeBal) animateValue(els.phonepeBal, balances.phonepe);
    if(els.paytmBal) animateValue(els.paytmBal, balances.paytm);
    if(els.bankBal) animateValue(els.bankBal, balances.bank);
    if(els.emergencyBal) animateValue(els.emergencyBal, balances.emergency);

    const spent = state.user.monthlyExpenses !== undefined ? state.user.monthlyExpenses : state.transactions.filter(e => e.type === 'expense').reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const pct = (spent / monthlyBudget) * 100;

    if (pct > 80) {
      Object.assign(els.vibeDot.style, { color: '#f87171' });
      Object.assign(els.walletVibe.style, { borderColor: 'rgba(248,113,113,0.3)' });
      els.vibeText.textContent = 'Dangerous Run Chase'; 
      els.greeting.textContent = 'Entering the death overs.';
      els.sub.textContent = 'Financial collapse imminent. Hide your UPI pin.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-skull"></i> Critical'; els.sidebarMood.style.color = '#f87171'; }
    } else if (pct > 50) {
      Object.assign(els.vibeDot.style, { color: '#fb923c' });
      Object.assign(els.walletVibe.style, { borderColor: 'rgba(251,146,60,0.3)' });
      els.vibeText.textContent = 'Weekend Damage';
      els.greeting.textContent = 'Your wallet survived another over.';
      els.sub.textContent = 'Middle-order spending collapse detected. Careful now.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-fire"></i> Recovering'; els.sidebarMood.style.color = '#fb923c'; }
    } else {
      Object.assign(els.vibeDot.style, { color: '#34d399' });
      Object.assign(els.walletVibe.style, { borderColor: 'rgba(52,211,153,0.3)' });
      els.vibeText.textContent = 'Stable';
      els.greeting.textContent = 'Steady powerplay.';
      els.sub.textContent = 'Cruising comfortably without dropping wickets.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-bolt"></i> Stable'; els.sidebarMood.style.color = '#34d399'; }
    }
  }
  
  function renderSurvivalTracker() {
    if (!state.user || !state.user.survival) return;
    const { survival } = state.user;
    
    const avgEl = document.getElementById('surv-avg');
    const daysEl = document.getElementById('surv-days');
    const dateEl = document.getElementById('surv-date');
    const remDaysEl = document.getElementById('surv-rem-days');
    const fillEl = document.getElementById('surv-fill');
    const sassyEl = document.getElementById('survival-sassy');
    
    if(avgEl) avgEl.textContent = `₹${Math.round(survival.avgDailySpend).toLocaleString('en-IN')}`;
    if(daysEl) daysEl.textContent = `${survival.daysPassed} Days`;
    
    if(dateEl) {
      if(survival.exhaustionDate && survival.estRemainingDays < 999) {
        dateEl.textContent = new Date(survival.exhaustionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        dateEl.textContent = 'Infinite 😌';
      }
    }
    if(remDaysEl) remDaysEl.textContent = survival.estRemainingDays < 999 ? `${survival.estRemainingDays} Days Left` : 'Safe';
    
    if(fillEl) {
      let pct = (survival.estRemainingDays / 30) * 100;
      fillEl.style.width = survival.estRemainingDays < 999 ? `${Math.min(pct, 100)}%` : `100%`;
      
      if (survival.health === 'safe') {
        fillEl.style.background = '#34d399'; remDaysEl.style.color = '#34d399';
        if(sassyEl) sassyEl.textContent = "Pacing well. You might actually survive.";
      } else if (survival.health === 'moderate') {
        fillEl.style.background = '#fb923c'; remDaysEl.style.color = '#fb923c';
        if(sassyEl) sassyEl.textContent = "Funds depleting. Order Swiggy responsibly.";
      } else {
        fillEl.style.background = '#f87171'; remDaysEl.style.color = '#f87171';
        if(sassyEl) sassyEl.textContent = "Critical zone. Switch to Maggi diet immediately.";
      }
    }
  }

  function renderWalletPage() {
    if (!state.user) return;
    const { balances } = state.user;
    const bind = (id, val) => { const el = document.getElementById(id); if (el) animateValue(el, val); };
    bind('wallet-cash', balances.cash);
    bind('wallet-gpay', balances.gpay);
    bind('wallet-phonepe', balances.phonepe);
    bind('wallet-paytm', balances.paytm);
    bind('wallet-bank', balances.bank);
    bind('wallet-emergency', balances.emergency);
  }

  function renderTimeline(container, txList) {
    if(!container) return;
    container.innerHTML = txList.length === 0 ? '<p class="empty-state">No transactions yet. Go spend some money!</p>' : '';
    txList.forEach(tx => {
      const isIncome = tx.type === 'income';
      const displayAmount = Math.abs(tx.amount).toLocaleString('en-IN');
      const icon = isIncome ? 'fa-arrow-down' : (catIcons[tx.category] || 'fa-receipt');
      const payIcon = payIcons[tx.method] || 'fa-wallet';
      const color = isIncome ? '#34d399' : (catColors[tx.category] || '#fff');
      const sass = isIncome ? 'Miracle injection' : (sassyLabels[tx.category] || 'Questionable choice');
      const sign = isIncome ? '+' : '-';
      const amtColor = isIncome ? '#34d399' : '#f87171';
      const timeStr = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Unknown Date';

      container.innerHTML += `
        <div class="tl-item" style="--cat-color: ${color}">
          <div class="tl-icon-box"><i class="fa-solid ${icon}"></i></div>
          <div class="tl-content">
            <h4 class="tl-title">${tx.title}</h4>
            <div class="tl-badges">
              <span class="tl-badge"><i class="fa-solid ${payIcon}"></i> ${tx.method}</span>
              <span class="tl-badge" style="background: ${color}20; color: ${color}">${sass}</span>
            </div>
          </div>
          <div class="tl-right" style="display:flex; align-items:center; gap:12px;">
            <div style="text-align:right;">
              <div class="tl-amt" style="color: ${amtColor}">${sign}₹${displayAmount}</div>
              <div class="tl-time">${timeStr}</div>
            </div>
            <button onclick="deleteTx('${tx.id || tx._id}', this)" title="Delete" class="tl-delete-btn">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>`;
    });
  }

  function renderFriends(container, friendsList, els = null) {
    if(!container) return;

    const friendsMap = {};
    friendsList.forEach(f => {
      if (!friendsMap[f.name]) friendsMap[f.name] = { name: f.name, netBalance: 0, totalVolume: 0, totalSettled: 0 };
      const pending = f.total - (f.returned || 0);
      
      friendsMap[f.name].totalVolume += f.total;
      friendsMap[f.name].totalSettled += (f.returned || 0);

      if (f.type === 'borrowed') {
        friendsMap[f.name].netBalance -= pending;
      } else {
        friendsMap[f.name].netBalance += pending;
      }
    });

    const pendingCount = Object.values(friendsMap).filter(f => f.netBalance !== 0).length;
    if (els && els.sidebarSplits) {
      els.sidebarSplits.textContent = `${pendingCount} Pending`;
      els.sidebarSplits.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    const aggregated = Object.values(friendsMap).sort((a,b) => Math.abs(b.netBalance) - Math.abs(a.netBalance)).slice(0, 3);
    
    container.innerHTML = aggregated.length === 0 ? '<p class="empty-state">No friend balances. Are you even socializing?</p>' : '';

    aggregated.forEach(f => {
      const absBal = Math.abs(f.netBalance);
      let statusColor = f.netBalance === 0 ? '#34d399' : (f.netBalance > 0 ? '#34d399' : '#f87171');
      let cardClass = `soc-card ${f.netBalance === 0 ? 'settled-borrower' : (f.netBalance < 0 ? 'danger-borrower' : '')}`;
      let statusText = f.netBalance === 0 ? 'Settled' : (f.netBalance > 0 ? `Owes you ₹${absBal.toLocaleString('en-IN')}` : `You owe ₹${absBal.toLocaleString('en-IN')}`);
      let pct = f.totalVolume === 0 ? 100 : Math.min((f.totalSettled / f.totalVolume) * 100, 100);
      if (f.netBalance === 0) pct = 100;

      container.innerHTML += `
        <div class="${cardClass}">
          <div class="soc-top">
            <div class="soc-avatar" style="background: ${statusColor}20; color: ${statusColor}">${f.name.charAt(0)}</div>
            <div class="soc-info">
              <span class="soc-name">${f.name}</span>
              <span class="soc-reason">Net Balance</span>
            </div>
          </div>
          <div>
            <div class="soc-amounts">
              <span style="color: ${statusColor}">${statusText}</span>
              <span style="color: var(--text-secondary)">/ ${pct === 100 ? 'All Settled' : 'Pending'}</span>
            </div>
            <div class="soc-ring-container"><div class="soc-ring-fill" style="width: ${pct}%; background: ${statusColor}"></div></div>
          </div>
        </div>`;
    });
  }

  function renderFriendsPage() {
    const container = document.getElementById('friends-page-list');
    if(!container) return;

    const friendsMap = {};
    state.friends.forEach(f => {
      if (!friendsMap[f.name]) friendsMap[f.name] = { name: f.name, netBalance: 0, history: [], totalVolume: 0, totalSettled: 0 };
      const pending = f.total - (f.returned || 0);
      
      friendsMap[f.name].totalVolume += f.total;
      friendsMap[f.name].totalSettled += (f.returned || 0);

      if (f.type === 'borrowed') {
        friendsMap[f.name].netBalance -= pending;
      } else {
        friendsMap[f.name].netBalance += pending;
      }
      friendsMap[f.name].history.push(f);
    });

    const aggregated = Object.values(friendsMap).sort((a,b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

    container.innerHTML = aggregated.length === 0 ? '<p class="empty-state">No friend balances. Time to split a bill!</p>' : '';
    
    aggregated.forEach(f => {
      const absBal = Math.abs(f.netBalance);
      let statusColor = f.netBalance === 0 ? '#34d399' : (f.netBalance > 0 ? '#34d399' : '#f87171');
      let cardClass = `soc-card ${f.netBalance === 0 ? 'settled-borrower' : (f.netBalance < 0 ? 'danger-borrower' : '')}`;
      let statusText = f.netBalance === 0 ? 'Settled' : (f.netBalance > 0 ? `Owes you ₹${absBal.toLocaleString('en-IN')}` : `You owe ₹${absBal.toLocaleString('en-IN')}`);
      let pct = f.totalVolume === 0 ? 100 : Math.min((f.totalSettled / f.totalVolume) * 100, 100);
      if (f.netBalance === 0) pct = 100;

      let historyHTML = f.history.map(h => {
         const hPending = h.total - (h.returned || 0);
         if (hPending <= 0) return '';
         const color = h.type === 'borrowed' ? '#f87171' : '#34d399';
         const sign = h.type === 'borrowed' ? 'You owe' : 'Owes you';
         return `<div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.05); align-items:center;">
            <span style="color: var(--text-secondary)">${h.reason}</span>
            <span style="color:${color}; font-weight:600; display:flex; align-items:center; gap:8px;">${sign} ₹${hPending.toLocaleString('en-IN')}
              <button onclick="recordReturn('${h.id || h._id}', ${h.total})" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--text-primary); cursor:pointer; padding:4px 8px; font-size:0.75rem; font-weight:600; transition:0.2s;" title="Settle this item" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">Settle</button>
            </span>
         </div>`;
      }).join('');

      container.innerHTML += `
        <div class="${cardClass}" style="width: 100%;">
          <div class="soc-top">
            <div class="soc-avatar" style="background: ${statusColor}20; color: ${statusColor}">${f.name.charAt(0)}</div>
            <div class="soc-info">
              <span class="soc-name">${f.name}</span>
              <span class="soc-reason">Net Balance</span>
            </div>
          </div>
          <div>
            <div class="soc-amounts">
              <span style="color: ${statusColor}">${statusText}</span>
              <span style="color: var(--text-secondary)">/ ${pct === 100 ? 'All Settled' : 'Pending'}</span>
            </div>
            <div class="soc-ring-container"><div class="soc-ring-fill" style="width: ${pct}%; background: ${statusColor}"></div></div>
            ${f.netBalance !== 0 && historyHTML ? `<div style="margin-top: 16px;">${historyHTML}</div>` : ''}
          </div>
          <div class="fc-actions">
            ${f.netBalance !== 0 ? `<button class="fc-btn primary" onclick="settleAll('${f.name}')">Settle All</button>` : `<button class="fc-btn" disabled>Settled</button>`}
            <button class="fc-btn" onclick="splitWith('${f.name}')">Split New</button>
          </div>
        </div>`;
    });
  }

  function renderBubbles(container, txList) {
    if(!container) return;
    const cats = {};
    txList.filter(e => e.type === 'expense').forEach(e => { cats[e.category] = (cats[e.category] || 0) + Math.abs(e.amount); });
    const sorted = Object.entries(cats).sort((a,b) => b[1] - a[1]);
    const totalAmt = sorted.reduce((sum, [_, amt]) => sum + amt, 0);

    container.innerHTML = sorted.length === 0 ? '<p class="empty-state">No expense categories to show.</p>' : '';
    sorted.forEach(([cat, amt]) => {
      const color = catColors[cat] || 'var(--accent-primary)';
      const icon = catIcons[cat] || 'fa-receipt';
      const pct = Math.round((amt / (totalAmt || 1)) * 100);
      const trendIcon = cat.length % 2 === 0 ? '<i class="fa-solid fa-arrow-trend-up cb-trend-icon" style="color:#f87171"></i>' : '<i class="fa-solid fa-arrow-trend-down cb-trend-icon" style="color:#34d399"></i>';
      
      container.innerHTML += `
        <div class="cat-bubble" style="--cat-color: ${color}">
          <i class="fa-solid ${icon} cb-icon"></i>
          <div class="cb-info">
            <span class="cb-name">${cat}</span>
            <span class="cb-amt">₹${amt.toLocaleString('en-IN')}</span>
          </div>
          <div class="cb-meta">
            <span class="cb-pct">${pct}%</span>
            ${trendIcon}
          </div>
        </div>`;
    });
  }

  async function renderInsightsPage() {
    renderBubbles(document.getElementById('insights-bubbles'), state.transactions);
    try {
      const response = await apiFetch('/api/v1/analytics/insights');
      const data = response.data || response;
      const { categoryTotals, trends, topCategory, insightText } = data;

      document.getElementById('top-cat-title').textContent = `${topCategory} Damage`;
      document.getElementById('top-cat-desc').textContent = insightText;
      const topIcon = document.getElementById('top-cat-icon');
      if(topIcon) topIcon.className = `fa-solid ${catIcons[topCategory] || 'fa-triangle-exclamation'}`;

      if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#8B949E';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';

        const catCtx = document.getElementById('categoryChart');
        if(catCtx) {
            if(window.categoryChartInstance) window.categoryChartInstance.destroy();
            const labels = Object.keys(categoryTotals);
            const hexColors = { 'Food & Snacks': '#FFD166', 'College Life': '#34d399', 'Online & Random': '#f87171', 'Commute': '#818cf8', 'Social': '#fb923c', 'Friend Settlement': '#60a5fa' };
            window.categoryChartInstance = new Chart(catCtx, {
                type: 'doughnut',
                data: { labels, datasets: [{ data: Object.values(categoryTotals), backgroundColor: labels.map(l => hexColors[l] || '#9ca3af'), borderWidth: 0, hoverOffset: 4 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }
            });
        }

        const trendCtx = document.getElementById('trendChart');
        if(trendCtx) {
            if(window.trendChartInstance) window.trendChartInstance.destroy();
            window.trendChartInstance = new Chart(trendCtx, {
                type: 'line',
                data: { labels: Object.keys(trends), datasets: [{ label: 'Daily Spend (₹)', data: Object.values(trends), borderColor: '#FFD166', backgroundColor: 'rgba(255, 209, 102, 0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#FFD166' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
            });
        }
      }
    } catch (err) { /* Handled by apiFetch */ }
  }

  function renderSettingsPage() {
    if (!state.user || !state.settings) return;
    const { fullName, name, email } = state.user;
    const userName = name || fullName || 'Student';
    const settings = state.settings;

    document.querySelector('.profile-box h2').textContent = userName;
    document.querySelector('.profile-box p').textContent = email;

    const slideBudget = document.getElementById('slide-budget');
    const valBudget = document.getElementById('val-budget');
    if (slideBudget && valBudget) {
      slideBudget.value = settings.monthlyBudget || 5000;
      valBudget.textContent = `₹${(settings.monthlyBudget || 5000).toLocaleString('en-IN')}`;
    }

    const slideReserve = document.getElementById('slide-reserve');
    const valReserve = document.getElementById('val-reserve');
    if (slideReserve && valReserve) {
      slideReserve.value = settings.emergencyReserve || 2000;
      valReserve.textContent = `₹${(settings.emergencyReserve || 2000).toLocaleString('en-IN')}`;
    }

    document.querySelectorAll('.premium-toggle').forEach(toggle => {
      const id = (toggle.id || toggle.name || '').toLowerCase();
      if (id.includes('panic')) toggle.checked = !!settings.panicMode;
      if (id.includes('weekend')) toggle.checked = !!settings.weekendDamage;
      if (id.includes('nudge')) toggle.checked = !!settings.friendNudges;
      if (id.includes('compact')) toggle.checked = !!settings.compactMode;
      if (id.includes('motion')) toggle.checked = !!settings.reducedMotion;
    });

    const activeSources = settings.paymentSources || ['UPI / GPay', 'PhonePe', 'Cash'];
    document.querySelectorAll('.source-chip').forEach(chip => {
      const sourceName = chip.textContent.trim();
      if (activeSources.includes(sourceName)) chip.classList.add('active');
      else chip.classList.remove('active');
    });
  }

  function animateValue(element, finalValue) {
    if (!element) return;
    const startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g,"")) || 0;
    let startTime = null;
    const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / 800, 1);
        element.textContent = `₹${Math.floor(startValue + (finalValue - startValue) * progress).toLocaleString('en-IN')}`;
        if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  }

  // --- INITIALIZATION ---
  function initApp() {
    const setupModal = (btnId, modalId, closeBtnId) => {
      const btn = document.getElementById(btnId), modal = document.getElementById(modalId), closeBtn = document.getElementById(closeBtnId);
      if(btn && modal) btn.addEventListener('click', () => modal.classList.add('open'));
      if(closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    };
    setupModal('btn-add-expense', 'expense-modal', 'close-expense-modal');
    setupModal('btn-add-money', 'money-modal', 'close-money-modal');

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTransaction({
        amount: -Math.abs(parseFloat(document.getElementById('exp-amount').value)),
        title: document.getElementById('exp-title').value,
        category: document.getElementById('exp-category').value,
        method: document.getElementById('exp-method').value,
        type: 'expense',
        date: new Date().toISOString()
      }, document.getElementById('expense-modal'), expenseForm);
    });

    const moneyForm = document.getElementById('money-form');
    if (moneyForm) moneyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTransaction({
        amount: Math.abs(parseFloat(document.getElementById('inc-amount').value)),
        title: document.getElementById('inc-source').value,
        category: 'Income',
        method: document.getElementById('inc-method').value,
        type: 'income',
        date: new Date().toISOString()
      }, document.getElementById('money-modal'), moneyForm);
    });

    const btnSplitBill = document.querySelector('.page-friends .btn-glow');
    if (btnSplitBill) btnSplitBill.addEventListener('click', () => {
      const name = prompt('Friend Name:'); if (!name) return;
      const reason = prompt('Reason for split:'); if (!reason) return;
      const typeInput = prompt('Who paid?\n1: I paid (They owe me)\n2: They paid (I owe them)', '1');
      if (!typeInput) return;
      const type = typeInput === '2' ? 'borrowed' : 'lent';

      let total = 0, totalPaid = 0, method = 'UPI';

      if (type === 'lent') {
          totalPaid = parseFloat(prompt('Total bill amount YOU paid (₹):'));
          if (isNaN(totalPaid) || totalPaid <= 0) return showToast('Please enter a valid amount.', 'error');
          total = parseFloat(prompt(`How much does ${name} owe you out of ₹${totalPaid}?`));
          method = prompt('Payment Method (e.g. GPay, Cash, PhonePe):', 'GPay') || 'GPay';
      } else {
          total = parseFloat(prompt(`How much do you owe ${name}? (₹)`));
      }

      if (isNaN(total) || total <= 0) return showToast('Please enter a valid amount.', 'error');

      addFriendDebt({ name, reason, total, returned: 0, type, totalPaid, method });
    });

    document.querySelectorAll('.nav-item.logout').forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    }));

    if (document.body.classList.contains('page-settings')) {
      const slideBudget = document.getElementById('slide-budget'), valBudget = document.getElementById('val-budget');
      if (slideBudget && valBudget) {
        slideBudget.addEventListener('input', (e) => valBudget.textContent = `₹${parseInt(e.target.value).toLocaleString()}`);
        slideBudget.addEventListener('change', (e) => saveSettings({ monthlyBudget: parseInt(e.target.value) }));
      }
      
      const slideReserve = document.getElementById('slide-reserve'), valReserve = document.getElementById('val-reserve');
      if (slideReserve && valReserve) {
        slideReserve.addEventListener('input', (e) => valReserve.textContent = `₹${parseInt(e.target.value).toLocaleString()}`);
        slideReserve.addEventListener('change', (e) => saveSettings({ emergencyReserve: parseInt(e.target.value) }));
      }
      
      document.querySelectorAll('.premium-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
           const id = (e.target.id || e.target.name || '').toLowerCase();
           if (id.includes('panic')) saveSettings({ panicMode: e.target.checked });
           if (id.includes('weekend')) saveSettings({ weekendDamage: e.target.checked });
           if (id.includes('nudge')) saveSettings({ friendNudges: e.target.checked });
           if (id.includes('compact')) saveSettings({ compactMode: e.target.checked });
           if (id.includes('motion')) saveSettings({ reducedMotion: e.target.checked });
        });
      });

      document.querySelectorAll('.source-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            chip.classList.toggle('active');
            const activeSources = Array.from(document.querySelectorAll('.source-chip.active')).map(c => c.textContent.trim());
            saveSettings({ paymentSources: activeSources });
        });
      });
    }

    fetchAllData();
  }

  initApp();
}

// =============================================
//   LOGIN PAGE — FORM VALIDATION
//   IDs match login.html exactly:
//   form#login-form, #email, #password,
//   #email-error, #password-error, #toggle-login-pw
// =============================================
const loginForm = document.getElementById('login-form');
if (loginForm) {

  // Show/hide password toggle
  const toggleLoginPw   = document.getElementById('toggle-login-pw');
  const loginPasswordEl = document.getElementById('password');

  if (toggleLoginPw && loginPasswordEl) {
    toggleLoginPw.addEventListener('click', () => {
      const isText = loginPasswordEl.type === 'text';
      loginPasswordEl.type    = isText ? 'password' : 'text';
      toggleLoginPw.textContent = isText ? '\uD83D\uDC41' : '\uD83D\uDE48';
    });
  }

  // If user is already logged in, redirect away from login page
  if (localStorage.getItem('fintrack_token')) {
    window.location.href = 'dashboard.html';
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email    = document.getElementById('email');
    const password = document.getElementById('password');
    const emailErr = document.getElementById('email-error');
    const pwErr    = document.getElementById('password-error');

    // Reset errors
    [email, password].forEach(el => el.classList.remove('input-error'));
    emailErr.textContent = '';
    pwErr.textContent    = '';

    // Email validation
    if (!email.value.trim()) {
      emailErr.textContent = 'Email is required.';
      email.classList.add('input-error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailErr.textContent = 'Enter a valid email address.';
      email.classList.add('input-error');
      valid = false;
    }

    // Password validation
    if (!password.value) {
      pwErr.textContent = 'Password is required.';
      password.classList.add('input-error');
      valid = false;
    }

    if (valid) {
      handleLogin(email.value.trim(), password.value, document.getElementById('login-btn'), pwErr);
    }
  });
}


// =============================================
//   SIGNUP PAGE — FORM VALIDATION
//   IDs match signup.html exactly:
//   form#signup-form, #full-name, #email,
//   #password, #confirm-password,
//   #full-name-error, #email-error,
//   #password-error, #confirm-password-error,
//   #toggle-signup-pw
// =============================================
const signupForm = document.getElementById('signup-form');
if (signupForm) {

  // Show/hide password toggle
  const toggleSignupPw   = document.getElementById('toggle-signup-pw');
  const signupPasswordEl = document.getElementById('password');

  if (toggleSignupPw && signupPasswordEl) {
    toggleSignupPw.addEventListener('click', () => {
      const isText = signupPasswordEl.type === 'text';
      signupPasswordEl.type    = isText ? 'password' : 'text';
      toggleSignupPw.textContent = isText ? '\uD83D\uDC41' : '\uD83D\uDE48';
    });
  }

  // If user is already logged in, redirect away from signup page
  if (localStorage.getItem('fintrack_token')) {
    window.location.href = 'dashboard.html';
  }

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById('full-name');
    const email   = document.getElementById('email');
    const pw      = document.getElementById('password');
    const confirm = document.getElementById('confirm-password');

    const nameErr    = document.getElementById('full-name-error');
    const emailErr   = document.getElementById('email-error');
    const pwErr      = document.getElementById('password-error');
    const confirmErr = document.getElementById('confirm-password-error');

    // Reset errors
    [name, email, pw, confirm].forEach(el => el.classList.remove('input-error'));
    [nameErr, emailErr, pwErr, confirmErr].forEach(el => el.textContent = '');

    // Name
    if (!name.value.trim()) {
      nameErr.textContent = 'Name is required.';
      name.classList.add('input-error');
      valid = false;
    }

    // Email
    if (!email.value.trim()) {
      emailErr.textContent = 'Email is required.';
      email.classList.add('input-error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      emailErr.textContent = 'Enter a valid email address.';
      email.classList.add('input-error');
      valid = false;
    }

    // Password min 6 chars
    if (!pw.value) {
      pwErr.textContent = 'Password is required.';
      pw.classList.add('input-error');
      valid = false;
    } else if (pw.value.length < 6) {
      pwErr.textContent = 'Password must be at least 6 characters.';
      pw.classList.add('input-error');
      valid = false;
    }

    // Confirm password match
    if (!confirm.value) {
      confirmErr.textContent = 'Please confirm your password.';
      confirm.classList.add('input-error');
      valid = false;
    } else if (confirm.value !== pw.value) {
      confirmErr.textContent = 'Passwords do not match.';
      confirm.classList.add('input-error');
      valid = false;
    }

    if (valid) {
      handleRegister(name.value.trim(), email.value.trim(), pw.value, document.getElementById('signup-btn'), emailErr);
    }
  });
}

// =============================================
//   LANDING PAGE — 3D UNIVERSE TILT
//   Adds a premium 3D magnetic tilt effect
//   to the entire solar system on mousemove.
// =============================================
const heroSection = document.getElementById('home');
const tiltEls     = document.querySelectorAll('.tilt-el');

if (heroSection && tiltEls.length > 0) {
  heroSection.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10; // Reduced for heavier, premium feel
    const y = (e.clientY / window.innerHeight - 0.5) * -10;
    
    tiltEls.forEach(el => {
      el.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    tiltEls.forEach(el => {
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  });
}
