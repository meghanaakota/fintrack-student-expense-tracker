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
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }  // lower threshold so auth card triggers reliably
  );

  fadeEls.forEach(el => observer.observe(el));

  // Immediately show elements already in viewport on page load
  // (needed for auth pages where the card is visible without scrolling)
  setTimeout(() => {
    fadeEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 50);
}


// =============================================
//   FINTRACK GLOBAL APP LOGIC
// =============================================

if (document.querySelector('.lifestyle-body:not(.auth-page)')) {

  const BUDGET = 5000;

  // Realistic Dummy Data for all pages
  // TODO (Firebase): Replace this dummy data with Firestore collections
  const dummyExpenses = [
    { id: 1, title: 'Hostel Snacks Refill', category: 'Food & Snacks', method: 'UPI', amount: 340, date: new Date().toISOString() },
    { id: 2, title: 'Metro Recharge', category: 'Commute', method: 'UPI', amount: 150, date: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, title: 'Spotify Subscription', category: 'Online & Random', method: 'Bank Transfer', amount: 119, date: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, title: 'Midnight Chai & Samosa', category: 'Food & Snacks', method: 'Cash', amount: 80, date: new Date(Date.now() - 259200000).toISOString() },
    { id: 5, title: 'Lab Record Printing', category: 'College Life', method: 'UPI', amount: 250, date: new Date(Date.now() - 400000000).toISOString() },
    { id: 6, title: 'Birthday Treat Share', category: 'Social', method: 'UPI', amount: 500, date: new Date(Date.now() - 600000000).toISOString() }
  ];

  const dummyFriends = [
    { name: 'Rahul', reason: 'Movie plan split', total: 450, returned: 0 },
    { name: 'Sneha', reason: 'Birthday contribution', total: 300, returned: 300 },
    { name: 'Akhil', reason: 'Auto ride share', total: 150, returned: 50 },
    { name: 'Priya', reason: 'Late night outing', total: 600, returned: 200 }
  ];
  
  // Configs
  const catIcons = {
    'Food & Snacks': 'fa-burger',
    'College Life': 'fa-book-open',
    'Online & Random': 'fa-box-open',
    'Commute': 'fa-train-subway',
    'Social': 'fa-users'
  };
  const catColors = {
    'Food & Snacks': 'var(--cat-food)', 'College Life': 'var(--cat-college)', 'Online & Random': 'var(--cat-shopping)',
    'Commute': 'var(--cat-travel)', 'Social': 'var(--cat-entertainment)'
  };
  const payIcons = {
    'UPI': 'fa-mobile', 'Cash': 'fa-money-bill', 'Bank Transfer': 'fa-building-columns'
  };
  // Sassy labels for the timeline items based on category
  const sassyLabels = {
    'Food & Snacks': 'Late-night cravings dominating',
    'College Life': 'Assignment printing trauma',
    'Social': 'Group math survivor',
    'Online & Random': 'Impulse decision',
    'Commute': 'Surge pricing victim'
  };


  function init() {
    // Global Modal Setup
    const btnAdd = document.getElementById('btn-add-expense');
    const modal = document.getElementById('expense-modal');
    const btnClose = document.getElementById('close-expense-modal');
    if(btnAdd && modal) btnAdd.addEventListener('click', () => modal.classList.add('open'));
    if(btnClose && modal) btnClose.addEventListener('click', () => modal.classList.remove('open'));

    const btnAddMoney = document.getElementById('btn-add-money');
    const moneyModal = document.getElementById('money-modal');
    const btnCloseMoney = document.getElementById('close-money-modal');
    if(btnAddMoney && moneyModal) btnAddMoney.addEventListener('click', () => moneyModal.classList.add('open'));
    if(btnCloseMoney && moneyModal) btnCloseMoney.addEventListener('click', () => moneyModal.classList.remove('open'));

    // Page Specific Renders
    if (document.body.classList.contains('page-dashboard')) {
      const els = {
        date: document.getElementById('story-date'), greeting: document.getElementById('story-greeting'),
        sub: document.getElementById('story-sub'), totalBal: document.getElementById('main-bal'),
        upiBal: document.getElementById('upi-bal'), cashBal: document.getElementById('cash-bal'),
        vibeDot: document.getElementById('vibe-dot'), vibeText: document.getElementById('vibe-text'),
        walletVibe: document.getElementById('wallet-vibe'),
        sidebarMood: document.getElementById('sidebar-mood'),
        sidebarSplits: document.getElementById('sidebar-splits')
      };
      els.date.textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
      renderOverview(els, dummyExpenses, dummyFriends);
      renderTimeline(document.getElementById('timeline-list'), dummyExpenses.slice(0, 4));
      renderFriends(document.getElementById('social-list'), dummyFriends.slice(0, 3), els);
      renderBubbles(document.getElementById('bubble-list'), dummyExpenses);
    }

    if (document.body.classList.contains('page-transactions')) {
      renderTimeline(document.getElementById('tx-page-list'), dummyExpenses);
    }

    if (document.body.classList.contains('page-friends')) {
      renderFriendsExpanded(document.getElementById('friends-page-list'), dummyFriends);
    }

    if (document.body.classList.contains('page-insights')) {
      renderBubbles(document.getElementById('insights-bubbles'), dummyExpenses);
      renderTimeline(document.getElementById('insights-trends'), dummyExpenses.slice(0,2));
    }

    if (document.body.classList.contains('page-settings')) {
      // Slider Value Sync
      const slideBudget = document.getElementById('slide-budget');
      const valBudget = document.getElementById('val-budget');
      if (slideBudget && valBudget) {
        slideBudget.addEventListener('input', (e) => {
          valBudget.textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
        });
      }

      const slideReserve = document.getElementById('slide-reserve');
      const valReserve = document.getElementById('val-reserve');
      if (slideReserve && valReserve) {
        slideReserve.addEventListener('input', (e) => {
          valReserve.textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
        });
      }

      // Source Chips Toggle
      document.querySelectorAll('.source-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
        });
      });
      
      // Mock Wipe Action
      const wipeBtn = document.getElementById('btn-wipe');
      if (wipeBtn) wipeBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete all financial records? This cannot be undone.")) {
          alert("Slate wiped clean. Time to start fresh.");
        }
      });
    }
  }

  function renderOverview(els, expenses, friends) {
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = BUDGET - spent;
    
    // Fake distribution for visual effect
    const upi = remaining * 0.65;
    const cash = remaining * 0.35;

    animateValue(els.totalBal, remaining);
    animateValue(els.upiBal, upi);
    animateValue(els.cashBal, cash);

    const pct = (spent / BUDGET) * 100;

    // Set Wallet Mood
    if (pct > 80) {
      els.vibeDot.style.color = '#f87171'; els.walletVibe.style.borderColor = 'rgba(248,113,113,0.3)';
      els.vibeText.textContent = 'Dangerous Run Chase'; 
      els.greeting.textContent = 'Entering the death overs.';
      els.sub.textContent = 'Financial collapse imminent. Hide your UPI pin.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-skull"></i> Critical'; els.sidebarMood.style.color = '#f87171'; }
    } else if (pct > 50) {
      els.vibeDot.style.color = '#fb923c'; els.walletVibe.style.borderColor = 'rgba(251,146,60,0.3)';
      els.vibeText.textContent = 'Weekend Damage';
      els.greeting.textContent = 'Your wallet survived another over.';
      els.sub.textContent = 'Middle-order spending collapse detected. Careful now.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-fire"></i> Recovering'; els.sidebarMood.style.color = '#fb923c'; }
    } else {
      els.vibeDot.style.color = '#34d399'; els.walletVibe.style.borderColor = 'rgba(52,211,153,0.3)';
      els.vibeText.textContent = 'Stable';
      els.greeting.textContent = 'Steady powerplay.';
      els.sub.textContent = 'Cruising comfortably without dropping wickets.';
      if (els.sidebarMood) { els.sidebarMood.innerHTML = '<i class="fa-solid fa-bolt"></i> Stable'; els.sidebarMood.style.color = '#34d399'; }
    }
  }

  function renderTimeline(container, expenses) {
    if(!container) return;
    container.innerHTML = '';
    expenses.forEach(exp => {
      const icon = catIcons[exp.category] || 'fa-receipt';
      const payIcon = payIcons[exp.method] || 'fa-wallet';
      const color = catColors[exp.category] || '#fff';
      const sass = sassyLabels[exp.category] || 'Questionable choice';
      
      const timeStr = new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      container.innerHTML += `
        <div class="tl-item" style="--cat-color: ${color}">
          <div class="tl-icon-box"><i class="fa-solid ${icon}"></i></div>
          <div class="tl-content">
            <h4 class="tl-title">${exp.title}</h4>
            <div class="tl-badges">
              <span class="tl-badge"><i class="fa-solid ${payIcon}"></i> ${exp.method}</span>
              <span class="tl-badge" style="background: ${color}20; color: ${color}">${sass}</span>
            </div>
          </div>
          <div class="tl-right">
            <div class="tl-amt">-₹${exp.amount}</div>
            <div class="tl-time">${timeStr}</div>
          </div>
        </div>
      `;
    });
  }

  function renderFriends(container, friends, els = null) {
    if(!container) return;
    container.innerHTML = '';
    
    // Update sidebar split badge if exists
    if (els && els.sidebarSplits) {
      const pendingCount = friends.filter(f => f.returned < f.total).length;
      els.sidebarSplits.textContent = `${pendingCount} Pending`;
      els.sidebarSplits.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    friends.forEach(f => {
      const pct = Math.min((f.returned / f.total) * 100, 100);
      const owed = f.total - f.returned;
      let statusColor = pct === 100 ? '#34d399' : (pct > 0 ? '#fb923c' : '#818cf8');
      
      let cardClass = 'soc-card';
      if (pct === 100) cardClass += ' settled-borrower';
      else if (owed >= 400 && pct < 20) cardClass += ' danger-borrower';

      container.innerHTML += `
        <div class="${cardClass}">
          <div class="soc-top">
            <div class="soc-avatar" style="background: ${statusColor}20; color: ${statusColor}">${f.name.charAt(0)}</div>
            <div class="soc-info">
              <span class="soc-name">${f.name}</span>
              <span class="soc-reason">${f.reason}</span>
            </div>
          </div>
          <div>
            <div class="soc-amounts">
              <span style="color: ${statusColor}">${pct === 100 ? 'Settled' : `Owes ₹${f.total - f.returned}`}</span>
              <span style="color: var(--text-secondary)">/ ₹${f.total}</span>
            </div>
            <div class="soc-ring-container"><div class="soc-ring-fill" style="width: ${pct}%; background: ${statusColor}"></div></div>
          </div>
        </div>
      `;
    });
  }

  function renderFriendsExpanded(container, friends) {
    if(!container) return;
    container.innerHTML = '';
    friends.forEach(f => {
      const pct = Math.min((f.returned / f.total) * 100, 100);
      const owed = f.total - f.returned;
      let statusColor = pct === 100 ? '#34d399' : (pct > 0 ? '#fb923c' : '#818cf8');
      
      let cardClass = 'soc-card';
      if (pct === 100) cardClass += ' settled-borrower';
      else if (owed >= 400 && pct < 20) cardClass += ' danger-borrower';

      container.innerHTML += `
        <div class="${cardClass}" style="width: 100%;">
          <div class="soc-top">
            <div class="soc-avatar" style="background: ${statusColor}20; color: ${statusColor}">${f.name.charAt(0)}</div>
            <div class="soc-info">
              <span class="soc-name">${f.name}</span>
              <span class="soc-reason">${f.reason}</span>
            </div>
          </div>
          <div>
            <div class="soc-amounts">
              <span style="color: ${statusColor}">${pct === 100 ? 'Settled' : `Owes ₹${f.total - f.returned}`}</span>
              <span style="color: var(--text-secondary)">/ ₹${f.total}</span>
            </div>
            <div class="soc-ring-container"><div class="soc-ring-fill" style="width: ${pct}%; background: ${statusColor}"></div></div>
          </div>
          <div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-secondary);">
            <i class="fa-regular fa-clock"></i> Last repayment: 2 days ago
          </div>
          <div class="fc-actions">
            ${pct < 100 ? `<button class="fc-btn primary">Record Return</button>` : `<button class="fc-btn" disabled style="opacity:0.5">Settled</button>`}
            <button class="fc-btn">Remind</button>
          </div>
        </div>
      `;
    });
  }

  function renderBubbles(container, expenses) {
    if(!container) return;
    const cats = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    const sorted = Object.entries(cats).sort((a,b) => b[1] - a[1]);
    const totalAmt = sorted.reduce((sum, [_, amt]) => sum + amt, 0);

    container.innerHTML = '';
    sorted.forEach(([cat, amt]) => {
      const color = catColors[cat] || 'var(--accent-primary)';
      const icon = catIcons[cat] || 'fa-receipt';
      const pct = Math.round((amt / (totalAmt || 1)) * 100);
      
      // Pseudo-random trend for realistic live feel
      const isUp = cat.length % 2 === 0; 
      const trendIcon = isUp ? '<i class="fa-solid fa-arrow-trend-up cb-trend-icon" style="color:#f87171"></i>' : '<i class="fa-solid fa-arrow-trend-down cb-trend-icon" style="color:#34d399"></i>';
      
      container.innerHTML += `
        <div class="cat-bubble" style="--cat-color: ${color}">
          <i class="fa-solid ${icon} cb-icon"></i>
          <div class="cb-info">
            <span class="cb-name">${cat}</span>
            <span class="cb-amt">₹${amt}</span>
          </div>
          <div class="cb-meta">
            <span class="cb-pct">${pct}%</span>
            ${trendIcon}
          </div>
        </div>
      `;
    });
  }

  // Smooth counter animation
  function animateValue(element, finalValue) {
    if (!element) return;
    const startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g,"")) || 0;
    const duration = 800;
    let startTime = null;
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        element.textContent = `₹${(startValue + (finalValue - startValue) * progress).toFixed(0)}`;
        if (progress < 1) requestAnimationFrame(animation);
    }
    requestAnimationFrame(animation);
  }

  init();
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

    // TODO (Firebase): replace the redirect below with:
    // signInWithEmailAndPassword(auth, email.value, password.value)
    //   .then(userCredential => { window.location.href = 'dashboard.html'; })
    //   .catch(err => { emailErr.textContent = err.message; });
    if (valid) {
      window.location.href = 'dashboard.html';
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

    // TODO (Firebase): replace the redirect below with:
    // createUserWithEmailAndPassword(auth, email.value, pw.value)
    //   .then(userCredential => {
    //     return updateProfile(userCredential.user, { displayName: name.value });
    //   })
    //   .then(() => { window.location.href = 'dashboard.html'; })
    //   .catch(err => { emailErr.textContent = err.message; });
    if (valid) {
      window.location.href = 'dashboard.html';
    }
  });
}


// =============================================
//   WHERE TO ADD FIREBASE LATER
// =============================================
//
//  1. Import Firebase SDK at the top of this file (or in a separate firebase.js)
//  2. Replace localStorage calls with Firestore reads/writes
//  3. Add Firebase Auth for login/signup (login.html & signup.html)
//
//  Example structure (do NOT add yet):
//
//  import { initializeApp } from "firebase/app";
//  import { getFirestore, collection, addDoc } from "firebase/firestore";
//  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
//
//  const app  = initializeApp(firebaseConfig);  // config from Firebase Console
//  const db   = getFirestore(app);
//  const auth = getAuth(app);
//
// =============================================

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
