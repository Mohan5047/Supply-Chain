/**
 * ChainSolve AI - Supplier Disruption Response Assistant (PS08)
 * Full Interactive Operator Workbench & Multi-Persona Stakeholder Portals
 */

// Global State
let currentAssessment = null;
let preloadedScenarios = [];
let referenceData = null;
let selectedOptions = {}; // { [order_id]: option_id }
let systemProfiles = { operator: null, suppliers: [], customers: [] };
let activePersona = {
  type: "admin", // 'admin' | 'customer' | 'supplier'
  id: "OPERATOR-01",
  name: "Username",
  title: "Operations Controller (Distributor Admin)",
  avatar: "👑",
  facility: "WH-MAIN (Chicago Central Hub)"
};
let liveStreamTimer = null;
let liveStreamIndex = 0;
let cachedStreamEvents = [];

// App Settings & Preferences
const DEFAULT_SETTINGS = {
  username: "Username",
  parserMode: "hybrid",
  confidence: "0.85",
  streamInterval: 10000,
  soundEnabled: true,
  autoRunScenario: true,
  currency: "$"
};
let appSettings = { ...DEFAULT_SETTINGS };

// ============================================================================
// Initialization Lifecycle
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  loadSettings();
  initTheme();
  initSplashScreen();
  initSidebarDrawer();
  await loadReferenceData();
  initEventListeners();
  initStructuredFormCascading();
  await loadProfiles();
  await initScenarios();
  await loadAuditCount();
  startLiveTelemetryStream();
});

// ============================================================================
// 1. Sidebar Drawer Controls (Hidden by Default, Opens on Click)
// ============================================================================
function initSidebarDrawer() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const btnToggle = document.getElementById("btnToggleSidebar");
  const btnClose = document.getElementById("btnCloseSidebar");

  const openDrawer = () => {
    if (sidebar) sidebar.classList.add("sidebar-open");
    if (backdrop) backdrop.classList.add("active");
  };

  const closeDrawer = () => {
    if (sidebar) sidebar.classList.remove("sidebar-open");
    if (backdrop) backdrop.classList.remove("active");
  };

  if (btnToggle) btnToggle.addEventListener("click", openDrawer);
  if (btnClose) btnClose.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // Close drawer with Escape key if open
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("sidebar-open")) {
      closeDrawer();
    }
  });
}

function closeSidebarDrawer() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("sidebar-open");
  if (backdrop) backdrop.classList.remove("active");
}

// ============================================================================
// 2. Settings & Preferences Management
// ============================================================================
function loadSettings() {
  try {
    const saved = localStorage.getItem("chainSolve_settings");
    if (saved) {
      appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Could not parse saved settings:", e);
    appSettings = { ...DEFAULT_SETTINGS };
  }

  const customUser = localStorage.getItem("chainSolve_username") || appSettings.username;
  if (customUser) {
    appSettings.username = customUser;
    if (activePersona.type === "admin") {
      activePersona.name = customUser;
    }
  }
  updateActivePersonaUI();
  updateSoundButtonUI();
}

function saveSettingsFromModal() {
  const userInput = document.getElementById("settingUsernameInput");
  if (userInput && userInput.value.trim()) {
    const newName = userInput.value.trim();
    appSettings.username = newName;
    localStorage.setItem("chainSolve_username", newName);
    if (activePersona.type === "admin") {
      activePersona.name = newName;
      updateActivePersonaUI();
    }
  }

  const parserSelect = document.getElementById("settingParserMode");
  if (parserSelect) appSettings.parserMode = parserSelect.value;

  const confRadio = document.querySelector('input[name="settingConfidence"]:checked');
  if (confRadio) appSettings.confidence = confRadio.value;

  const streamSelect = document.getElementById("settingStreamInterval");
  if (streamSelect) appSettings.streamInterval = parseInt(streamSelect.value, 10);

  const soundCheckbox = document.getElementById("settingSoundToggle");
  if (soundCheckbox) appSettings.soundEnabled = soundCheckbox.checked;

  const autoRunCheckbox = document.getElementById("settingAutoRunScenario");
  if (autoRunCheckbox) appSettings.autoRunScenario = autoRunCheckbox.checked;

  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  updateSoundButtonUI();
  startLiveTelemetryStream();
  closeSettingsModal();
  showToast("Settings & Preferences saved successfully!", "success", "✓");
  playAudioChime("success");
}

function resetSettingsToDefaults() {
  appSettings = { ...DEFAULT_SETTINGS };
  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  localStorage.removeItem("chainSolve_username");
  if (activePersona.type === "admin") {
    activePersona.name = "Username";
    updateActivePersonaUI();
  }
  populateSettingsModal();
  updateSoundButtonUI();
  startLiveTelemetryStream();
  showToast("Preferences reset to default configuration.", "info", "⚙️");
}

function populateSettingsModal() {
  const userInput = document.getElementById("settingUsernameInput");
  if (userInput) userInput.value = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";

  const parserSelect = document.getElementById("settingParserMode");
  if (parserSelect) parserSelect.value = appSettings.parserMode;

  const confRadio = document.querySelector(`input[name="settingConfidence"][value="${appSettings.confidence}"]`);
  if (confRadio) confRadio.checked = true;

  const streamSelect = document.getElementById("settingStreamInterval");
  if (streamSelect) streamSelect.value = appSettings.streamInterval.toString();

  const soundCheckbox = document.getElementById("settingSoundToggle");
  if (soundCheckbox) soundCheckbox.checked = appSettings.soundEnabled;

  const autoRunCheckbox = document.getElementById("settingAutoRunScenario");
  if (autoRunCheckbox) autoRunCheckbox.checked = appSettings.autoRunScenario;
}

// ============================================================================
// 3. Audio Chimes & Sound Synthesis (Web Audio API)
// ============================================================================
function playAudioChime(type = "ping") {
  if (!appSettings.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "ping") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "alert") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.debug("Web Audio Synthesizer:", e);
  }
}

function updateSoundButtonUI() {
  const soundIcon = document.getElementById("soundIcon");
  const soundIconSymbol = document.getElementById("soundIconSymbol");
  const btnToggle = document.getElementById("btnToggleSound");
  if (soundIcon) {
    soundIcon.textContent = appSettings.soundEnabled ? "ON" : "OFF";
    soundIcon.className = appSettings.soundEnabled ? "text-[10px] font-black text-emerald-600 dark:text-emerald-400" : "text-[10px] font-black text-slate-400 dark:text-slate-500";
  }
  if (soundIconSymbol) {
    soundIconSymbol.textContent = appSettings.soundEnabled ? "🔔" : "🔕";
  }
  if (btnToggle) {
    btnToggle.title = appSettings.soundEnabled ? "Audio chime alerts active" : "Audio chime alerts muted";
  }
}

// ============================================================================
// 4. Floating Toast Notifications
// ============================================================================
function showToast(message, type = "info", icon = "🔔") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");

  let colorClasses = "bg-[#042016]/95 border-emerald-500/80 text-emerald-100";
  if (type === "success") colorClasses = "bg-emerald-950/95 border-emerald-500 text-emerald-100";
  else if (type === "alert") colorClasses = "bg-rose-950/95 border-rose-500 text-rose-100";

  toast.className = `flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold backdrop-blur-md transform transition-all duration-300 translate-y-3 opacity-0 pointer-events-auto ${colorClasses}`;
  toast.innerHTML = `
    <span class="text-base shrink-0">${icon}</span>
    <span class="leading-tight">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-3", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}

// ============================================================================
// 5. Dark / Light Theme System
// ============================================================================
function initTheme() {
  const btnToggle = document.getElementById("btnThemeToggle");
  const btnTopToggle = document.getElementById("btnTopThemeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const topThemeIcon = document.getElementById("topThemeIcon");
  const themeLabel = document.getElementById("themeLabel");

  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      if (themeIcon) themeIcon.textContent = "☀️";
      if (topThemeIcon) topThemeIcon.textContent = "☀️";
      if (themeLabel) themeLabel.textContent = "Light";
      if (btnToggle) btnToggle.setAttribute("title", "Switch to Light Mode");
    } else {
      document.documentElement.classList.remove("dark");
      if (themeIcon) themeIcon.textContent = "🌙";
      if (topThemeIcon) topThemeIcon.textContent = "🌙";
      if (themeLabel) themeLabel.textContent = "Dark";
      if (btnToggle) btnToggle.setAttribute("title", "Switch to Dark Mode");
    }
  };

  const savedTheme = localStorage.getItem("chainSolve_theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme("dark");
  }

  const toggleHandler = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    localStorage.setItem("chainSolve_theme", nextTheme);
    applyTheme(nextTheme);
    showToast(`Theme switched to ${nextTheme.toUpperCase()} mode`, "info", nextTheme === "dark" ? "🌙" : "☀️");
  };

  if (btnToggle) btnToggle.addEventListener("click", toggleHandler);
  if (btnTopToggle) btnTopToggle.addEventListener("click", toggleHandler);
}

// ============================================================================
// 6. Clean Splash Screen Loader (Logo & Loader Only)
// ============================================================================
function initSplashScreen() {
  const splash = document.getElementById("splashScreen");
  const btnSkip = document.getElementById("btnSkipSplash");

  if (!splash) return;

  const dismissSplash = () => {
    splash.classList.add("splash-hidden");
    setTimeout(() => {
      splash.style.display = "none";
    }, 700);
  };

  if (btnSkip) {
    btnSkip.addEventListener("click", dismissSplash);
  }

  // Smooth dismiss after brief loading time (2.6 seconds)
  setTimeout(() => {
    dismissSplash();
  }, 2600);
}

// ============================================================================
// 7. Profiles & Multi-Persona Stakeholder Portals
// ============================================================================
async function loadProfiles() {
  try {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error("Failed to load profiles");
    systemProfiles = await res.json();
    populateProfileModal(systemProfiles);
  } catch (err) {
    console.warn("Could not load profiles from API:", err);
  }
}

function populateProfileModal(profiles) {
  const custCountBadge = document.getElementById("profileCustCount");
  if (custCountBadge && profiles.customers) custCountBadge.textContent = profiles.customers.length;

  const suppCountBadge = document.getElementById("profileSuppCount");
  if (suppCountBadge && profiles.suppliers) suppCountBadge.textContent = profiles.suppliers.length;

  // 1. Customer Profiles List
  const custList = document.getElementById("customerProfilesList");
  if (custList && profiles.customers) {
    custList.innerHTML = "";
    profiles.customers.forEach(c => {
      const card = document.createElement("div");
      let tierColor = "bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/60 dark:text-purple-200";
      if (c.customer_tier === "Platinum") tierColor = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200";
      else if (c.customer_tier === "Gold") tierColor = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200";

      card.className = "bg-slate-50 dark:bg-[#160731] p-4 rounded-2xl border border-slate-200 dark:border-purple-800/60 flex flex-col justify-between space-y-3.5 hover:border-purple-400 transition shadow-sm";
      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${tierColor}">${c.customer_tier} Tier</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-300 font-mono">📍 ${c.destination_city}</span>
          </div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${c.customer_name}</h5>
          <div class="text-[11px] text-slate-600 dark:text-purple-300">
            Active Orders: <strong class="text-purple-950 dark:text-white font-bold">${c.orders.length}</strong> (${c.orders.map(o => o.order_id).join(", ")})
          </div>
        </div>
        <button class="btn-login-customer w-full bg-white dark:bg-[#0e031f] hover:bg-purple-50 dark:hover:bg-purple-900/60 text-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-700 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer">
          <span>🏢 Login as Customer</span>
          <span>➔</span>
        </button>
      `;

      card.querySelector(".btn-login-customer").addEventListener("click", () => {
        loginAsCustomer(c);
      });
      custList.appendChild(card);
    });
  }

  // 2. Supplier Profiles List
  const suppList = document.getElementById("supplierProfilesList");
  if (suppList && profiles.suppliers) {
    suppList.innerHTML = "";
    profiles.suppliers.forEach(s => {
      const card = document.createElement("div");
      card.className = "bg-slate-50 dark:bg-[#160731] p-4 rounded-2xl border border-slate-200 dark:border-purple-800/60 flex flex-col justify-between space-y-3.5 hover:border-purple-400 transition shadow-sm";
      card.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">${s.supplier_id}</span>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">★ ${(s.reliability_score * 100).toFixed(0)}% Score</span>
          </div>
          <h5 class="text-xs font-bold text-slate-900 dark:text-white">${s.name}</h5>
          <div class="text-[11px] text-slate-600 dark:text-purple-300">
            📍 ${s.location} • Inbound POs: <strong>${s.active_shipments.length}</strong>
          </div>
        </div>
        <button class="btn-login-supplier w-full bg-white dark:bg-[#0e031f] hover:bg-purple-50 dark:hover:bg-purple-900/60 text-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-700 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer">
          <span>🏭 Login as Supplier</span>
          <span>➔</span>
        </button>
      `;

      card.querySelector(".btn-login-supplier").addEventListener("click", () => {
        loginAsSupplier(s);
      });
      suppList.appendChild(card);
    });
  }
}

function loginAsAdmin() {
  const input = document.getElementById("profileModalNameInput");
  let currentUsername = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";
  if (input && input.value.trim()) {
    currentUsername = input.value.trim();
    localStorage.setItem("chainSolve_username", currentUsername);
    appSettings.username = currentUsername;
    localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
  }

  activePersona = {
    type: "admin",
    id: "OPERATOR-01",
    name: currentUsername,
    title: "Operations Controller (Distributor Admin)",
    avatar: "👑",
    facility: "WH-MAIN (Chicago Central Hub)"
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Logged in as Operations Controller (${currentUsername})`, "success", "👑");
  playAudioChime("success");
}

function loginAsCustomer(cust) {
  activePersona = {
    type: "customer",
    id: cust.customer_name,
    name: cust.customer_name,
    tier: cust.customer_tier,
    city: cust.destination_city,
    orders: cust.orders,
    avatar: "🏢",
    facility: `Client Destination: ${cust.destination_city}`
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Switched to Customer Portal: ${cust.customer_name}`, "info", "🏢");
  playAudioChime("ping");
}

function loginAsSupplier(supp) {
  activePersona = {
    type: "supplier",
    id: supp.supplier_id,
    name: supp.name,
    location: supp.location,
    shipments: supp.active_shipments,
    reliability: supp.reliability_score,
    avatar: "🏭",
    facility: `Origin: ${supp.location}`
  };
  updateActivePersonaUI();
  closeProfileModal();
  closeSidebarDrawer();
  showToast(`Switched to Supplier Portal: ${supp.name}`, "info", "🏭");
  playAudioChime("ping");
}

function updateActivePersonaUI() {
  const avatarEl = document.getElementById("sidebarAvatar");
  const topAvatarEl = document.getElementById("topBarAvatar");
  const nameEl = document.getElementById("profileName");
  const topNameEl = document.getElementById("topBarName");
  const adminCardName = document.getElementById("adminProfileCardName");
  const modalInput = document.getElementById("profileModalNameInput");
  const settingInput = document.getElementById("settingUsernameInput");
  const roleSubtext = document.getElementById("sidebarRoleSubtext");
  const facilitySubtext = document.getElementById("sidebarFacilitySubtext");
  const rolePill = document.getElementById("sidebarRolePill");
  const modalText = document.getElementById("modalActivePersonaText");

  const currentSavedName = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";

  if (avatarEl) avatarEl.textContent = activePersona.avatar;
  if (topAvatarEl) topAvatarEl.textContent = activePersona.avatar;
  if (nameEl) nameEl.textContent = activePersona.name;
  if (topNameEl) topNameEl.textContent = activePersona.name;
  if (adminCardName) adminCardName.textContent = currentSavedName;
  if (modalInput && document.activeElement !== modalInput) {
    modalInput.value = currentSavedName;
  }
  if (settingInput && document.activeElement !== settingInput) {
    settingInput.value = currentSavedName;
  }

  if (roleSubtext) {
    if (activePersona.type === "customer") roleSubtext.textContent = `Customer (${activePersona.tier} Tier)`;
    else if (activePersona.type === "supplier") roleSubtext.textContent = `Supplier (${activePersona.id})`;
    else roleSubtext.textContent = "Operations Controller (Admin)";
  }
  if (facilitySubtext) facilitySubtext.textContent = activePersona.facility || "WH-MAIN (Chicago Central Hub)";
  if (rolePill) rolePill.textContent = `${activePersona.type.toUpperCase()} PORTAL`;
  if (modalText) modalText.textContent = `${activePersona.name} (${activePersona.type.toUpperCase()})`;

  const custBanner = document.getElementById("customerPortalBanner");
  const suppBanner = document.getElementById("supplierPortalBanner");

  if (activePersona.type === "customer") {
    if (custBanner) {
      custBanner.classList.remove("hidden");
      document.getElementById("custBannerName").textContent = activePersona.name;
      const tierBadge = document.getElementById("custBannerTier");
      tierBadge.textContent = `${activePersona.tier} Tier`;
      if (activePersona.tier === "Platinum") tierBadge.className = "px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white uppercase tracking-wider";
      else if (activePersona.tier === "Gold") tierBadge.className = "px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500 text-white uppercase tracking-wider";
      else tierBadge.className = "px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-700 text-purple-200 uppercase tracking-wider";

      const ordersSummary = document.getElementById("customerOrdersSummary");
      ordersSummary.innerHTML = "";
      (activePersona.orders || []).forEach(ord => {
        const div = document.createElement("div");
        div.className = "bg-purple-950/80 border border-purple-700/70 rounded-xl p-3.5 text-xs space-y-1.5";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-white">Order: ${ord.order_id}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ord.status === 'allocated' ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-800 text-amber-200'}">${ord.status}</span>
          </div>
          <div class="text-[11px] text-purple-200">Promise Delivery: <strong>${ord.promise_date}</strong> • Penalty: <strong>$${ord.sla_penalty_per_day}/day</strong></div>
        `;
        ordersSummary.appendChild(div);
      });
    }
    if (suppBanner) suppBanner.classList.add("hidden");
  } else if (activePersona.type === "supplier") {
    if (suppBanner) {
      suppBanner.classList.remove("hidden");
      document.getElementById("suppBannerName").textContent = activePersona.name;
      document.getElementById("suppBannerId").textContent = activePersona.id;
    }
    if (custBanner) custBanner.classList.add("hidden");
  } else {
    // Admin
    if (custBanner) custBanner.classList.add("hidden");
    if (suppBanner) suppBanner.classList.add("hidden");
  }
}

// ============================================================================
// 8. Live Telemetry Stream Engine
// ============================================================================
async function startLiveTelemetryStream() {
  if (liveStreamTimer) clearInterval(liveStreamTimer);
  await fetchLiveTelemetry();

  if (appSettings.streamInterval > 0) {
    liveStreamTimer = setInterval(async () => {
      await fetchLiveTelemetry();
    }, appSettings.streamInterval);
  }
}

async function fetchLiveTelemetry() {
  try {
    const res = await fetch("/api/live/stream");
    if (!res.ok) return;
    const data = await res.json();
    if (data.events && data.events.length > 0) {
      cachedStreamEvents = data.events;
      rotateLiveTicker();
    }
  } catch (err) {
    console.debug("Telemetry polling skipped:", err);
  }
}

function rotateLiveTicker() {
  if (!cachedStreamEvents.length) return;
  const ev = cachedStreamEvents[liveStreamIndex % cachedStreamEvents.length];
  liveStreamIndex++;

  const iconEl = document.getElementById("liveTickerIcon");
  const textEl = document.getElementById("liveTickerText");

  if (iconEl && textEl) {
    textEl.style.opacity = "0";
    setTimeout(() => {
      iconEl.textContent = ev.icon || "📡";
      textEl.textContent = `${ev.source}: ${ev.message}`;
      textEl.style.opacity = "1";
    }, 200);
  }
}

function pushManualTelemetryPing() {
  const pings = [
    { icon: "🚢", text: "Vessel EVER GLOBE: Long Beach pilot boarded; container offload queue positioned #2." },
    { icon: "📦", text: "WH-MAIN RFID Gate 4: Cross-dock staging verified 45 units SKU-1049 in clean Bay B." },
    { icon: "⚡", text: "Apex Dynamics Line 2 EDI: Component pressure telemetry restored to nominal 120 PSI." },
    { icon: "✈️", text: "FedEx Express Cargo: Flight FX-912 booked with priority airway bill 88910411-FX." },
    { icon: "⏱️", text: "SLA Sentinel: Siemens Mobility Systems order ORD-502 promise clock: 6 days remaining." }
  ];
  const rand = pings[Math.floor(Math.random() * pings.length)];
  const iconEl = document.getElementById("liveTickerIcon");
  const textEl = document.getElementById("liveTickerText");

  if (iconEl && textEl) {
    iconEl.textContent = rand.icon;
    textEl.textContent = `Live Push: ${rand.text}`;
  }

  showToast(rand.text, "info", rand.icon);
  playAudioChime("ping");
}

// ============================================================================
// 8.5. Structured Reference Data & Form Cascading Engine
// ============================================================================
async function loadReferenceData() {
  try {
    const res = await fetch("/api/reference-data");
    if (!res.ok) throw new Error("Failed to fetch reference data");
    referenceData = await res.json();
    populateFormDropdowns(referenceData);
  } catch (err) {
    console.error("Failed to load reference data:", err);
  }
}

function populateFormDropdowns(data) {
  if (!data) return;

  // 1. Suppliers
  const supplierSelect = document.getElementById("inputSupplier");
  if (supplierSelect && data.suppliers) {
    supplierSelect.innerHTML = `<option value="">-- Select Supplier --</option>`;
    data.suppliers.forEach(s => {
      supplierSelect.innerHTML += `<option value="${s.supplier_id}">${s.name} (${s.supplier_id})</option>`;
    });
  }

  // 2. Purchase Orders
  const poSelect = document.getElementById("inputPO");
  if (poSelect && data.purchase_orders) {
    poSelect.innerHTML = `<option value="">-- Select Purchase Order --</option>`;
    data.purchase_orders.forEach(po => {
      poSelect.innerHTML += `<option value="${po.po_number}" data-supplier="${po.supplier_id}" data-shipment="${po.shipment_id}">${po.po_number} (${po.supplier_id})</option>`;
    });
  }

  // 3. Inbound Shipments
  const shipmentSelect = document.getElementById("inputShipment");
  if (shipmentSelect && data.shipments) {
    shipmentSelect.innerHTML = `<option value="">-- Select Shipment --</option>`;
    data.shipments.forEach(sh => {
      shipmentSelect.innerHTML += `<option value="${sh.shipment_id}" data-supplier="${sh.supplier_id}" data-po="${sh.po_number}">${sh.shipment_id} - ${sh.carrier_name} (${sh.po_number})</option>`;
    });
  }

  // 4. Catalog SKUs
  const skuSelect = document.getElementById("inputSKU");
  if (skuSelect && data.skus) {
    skuSelect.innerHTML = `<option value="">-- Select SKU / Product --</option>`;
    data.skus.forEach(sku => {
      skuSelect.innerHTML += `<option value="${sku.sku_id}" data-supplier="${sku.preferred_supplier_id}">${sku.sku_id} - ${sku.name}</option>`;
    });
  }

  // 5. Locations
  const locationSelect = document.getElementById("inputLocation");
  if (locationSelect && data.locations) {
    locationSelect.innerHTML = "";
    data.locations.forEach(loc => {
      locationSelect.innerHTML += `<option value="${loc.id}">${loc.name}</option>`;
    });
  }

  // Default Disruption Date to System Date
  const dateInput = document.getElementById("inputDisruptionDate");
  if (dateInput && data.system_current_date) {
    dateInput.value = data.system_current_date;
  }
}

function initStructuredFormCascading() {
  const supplierSelect = document.getElementById("inputSupplier");
  const poSelect = document.getElementById("inputPO");
  const shipmentSelect = document.getElementById("inputShipment");
  const skuSelect = document.getElementById("inputSKU");
  const typeSelect = document.getElementById("inputDisruptionType");

  if (!supplierSelect || !poSelect || !shipmentSelect || !skuSelect || !typeSelect) return;

  // 1. Supplier Change -> Filter and auto-sync POs, Shipments & SKUs
  supplierSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedSupplier = supplierSelect.value;

    // Filter POs
    let firstMatchingPO = "";
    Array.from(poSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingPO) firstMatchingPO = opt.value;
    });
    if (poSelect.selectedOptions[0] && poSelect.selectedOptions[0].hidden) {
      poSelect.value = firstMatchingPO || "";
    }

    // Filter Shipments
    let firstMatchingShip = "";
    Array.from(shipmentSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingShip) firstMatchingShip = opt.value;
    });
    if (shipmentSelect.selectedOptions[0] && shipmentSelect.selectedOptions[0].hidden) {
      shipmentSelect.value = firstMatchingShip || "";
    }

    // Filter SKUs
    let firstMatchingSKU = "";
    Array.from(skuSelect.options).forEach((opt, idx) => {
      if (idx === 0) return;
      const supp = opt.getAttribute("data-supplier");
      const matches = !selectedSupplier || !supp || supp === selectedSupplier;
      opt.hidden = !matches;
      if (matches && !firstMatchingSKU) firstMatchingSKU = opt.value;
    });
    if (skuSelect.selectedOptions[0] && skuSelect.selectedOptions[0].hidden) {
      skuSelect.value = firstMatchingSKU || "";
    }

    // Auto-select corresponding shipment and SKU if available
    if (selectedSupplier && referenceData) {
      const matchShip = referenceData.shipments.find(s => s.supplier_id === selectedSupplier);
      if (matchShip) {
        if (!shipmentSelect.value) shipmentSelect.value = matchShip.shipment_id;
        if (!poSelect.value && matchShip.po_number) poSelect.value = matchShip.po_number;
        if (!skuSelect.value && matchShip.sku_ids && matchShip.sku_ids.length > 0) {
          skuSelect.value = matchShip.sku_ids[0];
        }
      }
    }
  });

  // 2. Purchase Order Change -> Auto-fill Supplier & Filter Shipments / SKUs
  poSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedPO = poSelect.value;
    if (!selectedPO) return;

    if (referenceData && referenceData.purchase_orders) {
      const poObj = referenceData.purchase_orders.find(p => p.po_number === selectedPO);
      if (poObj) {
        if (poObj.supplier_id) supplierSelect.value = poObj.supplier_id;
        if (poObj.shipment_id) shipmentSelect.value = poObj.shipment_id;
        if (poObj.sku_ids && poObj.sku_ids.length > 0) {
          skuSelect.value = poObj.sku_ids[0];
        }
      }
    }
  });

  // 3. Shipment Change -> Auto-fill Supplier, PO & SKU
  shipmentSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedShipment = shipmentSelect.value;
    if (!selectedShipment) return;

    if (referenceData && referenceData.shipments) {
      const shipObj = referenceData.shipments.find(s => s.shipment_id === selectedShipment);
      if (shipObj) {
        if (shipObj.supplier_id) supplierSelect.value = shipObj.supplier_id;
        if (shipObj.po_number) poSelect.value = shipObj.po_number;
        if (shipObj.sku_ids && shipObj.sku_ids.length > 0) {
          skuSelect.value = shipObj.sku_ids[0];
        }
      }
    }
  });

  // 4. SKU Change -> Auto-fill Preferred Supplier and Linked Shipment
  skuSelect.addEventListener("change", () => {
    hideValidationError();
    const selectedSKU = skuSelect.value;
    if (!selectedSKU || !referenceData) return;

    const skuObj = referenceData.skus ? referenceData.skus.find(s => s.sku_id === selectedSKU) : null;
    if (skuObj && skuObj.preferred_supplier_id && !supplierSelect.value) {
      supplierSelect.value = skuObj.preferred_supplier_id;
    }

    if (referenceData.shipments) {
      const shipObj = referenceData.shipments.find(s => s.sku_ids && s.sku_ids.includes(selectedSKU));
      if (shipObj) {
        if (!shipmentSelect.value) shipmentSelect.value = shipObj.shipment_id;
        if (!poSelect.value) poSelect.value = shipObj.po_number;
        if (!supplierSelect.value) supplierSelect.value = shipObj.supplier_id;
      }
    }
  });

  // 5. Disruption Type Change -> Adjust UI hints
  typeSelect.addEventListener("change", () => {
    hideValidationError();
    const isWarehouse = (typeSelect.value === "Warehouse Incident");
    const suppStar = document.getElementById("supplierRequiredStar");
    if (suppStar) suppStar.style.display = isWarehouse ? "none" : "inline";

    if (isWarehouse) {
      const locSelect = document.getElementById("inputLocation");
      if (locSelect) locSelect.value = "WH-MAIN";
      if (!skuSelect.value && referenceData && referenceData.skus && referenceData.skus.length > 0) {
        skuSelect.value = "SKU-3150";
      }
    }
  });

  // Close button on validation error banner
  const btnCloseAlert = document.getElementById("btnCloseValidationAlert");
  if (btnCloseAlert) btnCloseAlert.addEventListener("click", hideValidationError);
}

function showValidationError(message) {
  const banner = document.getElementById("formValidationError");
  const textEl = document.getElementById("validationErrorText");
  if (banner && textEl) {
    textEl.textContent = message;
    banner.classList.remove("hidden");
    banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  showToast(message, "alert", "⚠️");
  playAudioChime("alert");
}

function hideValidationError() {
  const banner = document.getElementById("formValidationError");
  if (banner) banner.classList.add("hidden");
}

function populateStructuredForm(structured) {
  hideValidationError();
  if (!structured) return;

  const typeSelect = document.getElementById("inputDisruptionType");
  const suppSelect = document.getElementById("inputSupplier");
  const poSelect = document.getElementById("inputPO");
  const shipmentSelect = document.getElementById("inputShipment");
  const skuSelect = document.getElementById("inputSKU");
  const dateInput = document.getElementById("inputDisruptionDate");
  const delayInput = document.getElementById("inputDelayDays");
  const qtyInput = document.getElementById("inputQuantityAffected");
  const locSelect = document.getElementById("inputLocation");
  const reasonInput = document.getElementById("inputReason");
  const severitySelect = document.getElementById("inputSeverity");

  if (typeSelect) typeSelect.value = structured.disruption_type || "Supplier Production Halt";
  if (suppSelect) suppSelect.value = structured.supplier_id || "";
  if (poSelect) poSelect.value = structured.po_number || "";
  if (shipmentSelect) shipmentSelect.value = structured.shipment_id || "";
  if (skuSelect) skuSelect.value = structured.sku_id || "";
  if (dateInput) dateInput.value = structured.disruption_date || (referenceData ? referenceData.system_current_date : "2026-09-05");
  if (delayInput) delayInput.value = structured.delay_days || 14;
  if (qtyInput) qtyInput.value = structured.quantity_affected || "";
  if (locSelect) locSelect.value = structured.affected_location || "WH-MAIN";
  if (reasonInput) reasonInput.value = structured.reason || "";
  if (severitySelect) severitySelect.value = structured.severity || "High";

  // Trigger type change update
  if (typeSelect) {
    const isWarehouse = (typeSelect.value === "Warehouse Incident");
    const suppStar = document.getElementById("supplierRequiredStar");
    if (suppStar) suppStar.style.display = isWarehouse ? "none" : "inline";
  }
}

function clearStructuredForm() {
  hideValidationError();
  const form = document.getElementById("structuredDisruptionForm");
  if (form) form.reset();

  // Reset dropdown filters
  if (referenceData) populateFormDropdowns(referenceData);

  document.getElementById("scenarioTag").classList.add("hidden");
  document.getElementById("resultsSection").classList.add("hidden");
  document.getElementById("ambiguityBanner").classList.add("hidden");
  selectedOptions = {};
  currentAssessment = null;

  document.querySelectorAll("#scenarioButtonContainer button").forEach(b => {
    b.classList.remove("selected-scenario");
  });

  showToast("Disruption form reset to clean state.", "info", "🧹");
}

// ============================================================================
// 9. Benchmark Scenarios Loader
// ============================================================================
async function initScenarios() {
  try {
    const res = await fetch("/api/scenarios");
    preloadedScenarios = await res.json();
    const container = document.getElementById("scenarioButtonContainer");
    if (!container) return;
    container.innerHTML = "";

    const icons = ["⚡", "🚢", "💥", "🛑", "❓"];

    preloadedScenarios.forEach((sc, idx) => {
      const btn = document.createElement("button");
      btn.className = "scenario-box cursor-pointer group";

      const rawTitle = sc.title.includes(":") ? sc.title.split(":")[1] : sc.title;
      const cleanTitle = rawTitle.trim();

      btn.innerHTML = `
        <div class="w-full space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/90 text-emerald-200 border border-emerald-500/60 shadow-sm">
              Scenario ${idx + 1}
            </span>
            <span class="text-base group-hover:scale-110 transition-transform">${icons[idx] || "📌"}</span>
          </div>
          <h4 class="text-xs font-bold text-white group-hover:text-emerald-200 leading-snug line-clamp-2 text-left">
            ${cleanTitle}
          </h4>
        </div>
        <div class="w-full pt-2 border-t border-emerald-800/60 flex flex-col space-y-0.5 text-left">
          <span class="text-[11px] font-semibold text-emerald-300 truncate">${sc.category}</span>
          <span class="text-[10px] text-emerald-400/80 font-medium truncate">${sc.difficulty}</span>
        </div>
      `;
      btn.addEventListener("click", () => loadScenario(sc, btn));
      container.appendChild(btn);
    });
  } catch (err) {
    console.error("Failed to load scenarios:", err);
  }
}

function loadScenario(sc, clickedBtn) {
  document.querySelectorAll("#scenarioButtonContainer button").forEach(b => {
    b.classList.remove("selected-scenario");
  });
  if (clickedBtn) clickedBtn.classList.add("selected-scenario");

  selectedOptions = {};

  // Populate structured form directly with scenario fields
  if (sc.structured_input) {
    populateStructuredForm(sc.structured_input);
  }

  const tag = document.getElementById("scenarioTag");
  tag.textContent = sc.title;
  tag.classList.remove("hidden");

  if (appSettings.autoRunScenario) {
    analyzeDisruption();
  } else {
    showToast(`Loaded ${sc.title}. Click 'Analyze Disruption' to run.`, "info", "📥");
  }
}

// ============================================================================
// 10. Event Listeners Setup
// ============================================================================
function initEventListeners() {
  // 1. Core Action Buttons
  document.getElementById("btnAnalyze").addEventListener("click", () => {
    selectedOptions = {};
    analyzeDisruption();
  });

  document.getElementById("btnClear").addEventListener("click", clearStructuredForm);

  document.getElementById("btnResetDB").addEventListener("click", async () => {
    if (!confirm("Reset database state to pristine initial seed values?")) return;
    try {
      const res = await fetch("/api/system/reset", { method: "POST" });
      const data = await res.json();
      showToast(data.message, "success", "🔄");
      playAudioChime("success");
      await loadReferenceData();
      await loadProfiles();
      await loadAuditCount();
      clearStructuredForm();
    } catch (e) {
      alert("Error resetting database: " + e.message);
    }
  });

  // 2. Modals Triggers
  document.getElementById("btnProfile").addEventListener("click", () => openProfileModal(false));
  document.getElementById("btnCloseProfileModal").addEventListener("click", closeProfileModal);
  document.getElementById("btnCloseProfileModalBtn").addEventListener("click", closeProfileModal);

  // Quick edit name from sidebar profile card
  const btnQuickEdit = document.getElementById("btnQuickEditName");
  if (btnQuickEdit) {
    btnQuickEdit.addEventListener("click", () => {
      openProfileModal(true);
    });
  }

  // Save profile name button & Enter key in Profile Modal
  const btnSaveProfName = document.getElementById("btnSaveProfileNameModal");
  if (btnSaveProfName) {
    btnSaveProfName.addEventListener("click", saveProfileNameFromModal);
  }
  const inputProfName = document.getElementById("profileModalNameInput");
  if (inputProfName) {
    inputProfName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveProfileNameFromModal();
      }
    });
  }

  document.getElementById("btnSettings").addEventListener("click", openSettingsModal);
  const btnTopSettings = document.getElementById("btnTopSettings");
  if (btnTopSettings) btnTopSettings.addEventListener("click", openSettingsModal);

  document.getElementById("btnCloseSettingsModal").addEventListener("click", closeSettingsModal);
  document.getElementById("btnCloseSettingsModalBtn").addEventListener("click", closeSettingsModal);
  document.getElementById("btnSaveSettings").addEventListener("click", saveSettingsFromModal);
  document.getElementById("btnResetSettings").addEventListener("click", resetSettingsToDefaults);
  document.getElementById("btnTestChime").addEventListener("click", () => {
    playAudioChime("ping");
    showToast("Synthesized audio alert chime test successful!", "info", "🔊");
  });

  document.getElementById("btnAuditLog").addEventListener("click", openAuditModal);
  document.getElementById("btnCloseAuditModal").addEventListener("click", closeAuditModal);
  document.getElementById("btnCloseAuditModalBtn").addEventListener("click", closeAuditModal);

  document.getElementById("btnCloseCommModal").addEventListener("click", closeCommModal);
  document.getElementById("btnCloseCommModalBtn").addEventListener("click", closeCommModal);
  document.getElementById("btnCopyComm").addEventListener("click", () => {
    const text = document.getElementById("commModalBody").textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Communication draft copied to clipboard!", "success", "📋");
      playAudioChime("success");
    });
  });

  // 3. Telemetry Controls
  document.getElementById("btnSimulatePing").addEventListener("click", pushManualTelemetryPing);
  document.getElementById("btnToggleSound").addEventListener("click", () => {
    appSettings.soundEnabled = !appSettings.soundEnabled;
    localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));
    updateSoundButtonUI();
    if (appSettings.soundEnabled) playAudioChime("ping");
    showToast(`Audio alerts ${appSettings.soundEnabled ? "ENABLED" : "MUTED"}`, "info", appSettings.soundEnabled ? "🔔" : "🔕");
  });

  // 4. Portal Banner Switchers
  const btnCustSwitch = document.getElementById("btnCustomerSwitchAdmin");
  if (btnCustSwitch) btnCustSwitch.addEventListener("click", loginAsAdmin);

  const btnSuppSwitch = document.getElementById("btnSupplierSwitchAdmin");
  if (btnSuppSwitch) btnSuppSwitch.addEventListener("click", loginAsAdmin);

  const btnSuppSubmit = document.getElementById("btnSupplierSubmitIncident");
  if (btnSuppSubmit) {
    btnSuppSubmit.addEventListener("click", () => {
      const type = document.getElementById("suppIncidentType").value;
      const days = parseInt(document.getElementById("suppDelayDays").value, 10) || 14;
      const suppName = activePersona.name || "Apex Precision Technologies";
      const suppId = activePersona.id || "SUP-001";

      const mappedType = (type === "production_halt") ? "Supplier Production Halt" : "Carrier/Shipment Delay";

      // Find first active shipment for this supplier if any
      let poNum = "";
      let shipId = "";
      let skuId = "";
      if (referenceData && referenceData.shipments) {
        const sh = referenceData.shipments.find(s => s.supplier_id === suppId);
        if (sh) {
          shipId = sh.shipment_id;
          poNum = sh.po_number;
          skuId = sh.sku_ids ? sh.sku_ids[0] : "";
        }
      }

      populateStructuredForm({
        disruption_type: mappedType,
        supplier_id: suppId,
        po_number: poNum,
        shipment_id: shipId,
        sku_id: skuId,
        disruption_date: referenceData ? referenceData.system_current_date : "2026-09-05",
        delay_days: days,
        affected_location: "WH-MAIN",
        reason: `Supplier portal alert from ${suppName}: ${type.replace(/_/g, " ")} reported.`,
        severity: "Critical"
      });

      document.getElementById("scenarioTag").textContent = `Supplier Direct Alert: ${suppName}`;
      document.getElementById("scenarioTag").classList.remove("hidden");
      analyzeDisruption();
      showToast(`Transmitted structured incident alert from ${suppName} to impact engine!`, "alert", "⚡");
    });
  }

  // 5. Admin button in profile modal
  const btnSelectAdmin = document.getElementById("btnSelectAdminProfile");
  if (btnSelectAdmin) btnSelectAdmin.addEventListener("click", loginAsAdmin);

  // 6. Profile Tabs Filtering
  const tabAll = document.getElementById("tabRoleAll");
  const tabAdmin = document.getElementById("tabRoleAdmin");
  const tabCust = document.getElementById("tabRoleCustomers");
  const tabSupp = document.getElementById("tabRoleSuppliers");

  const secAdmin = document.getElementById("sectionAdminProfiles");
  const secCust = document.getElementById("sectionCustomerProfiles");
  const secSupp = document.getElementById("sectionSupplierProfiles");

  const resetTabs = () => {
    [tabAll, tabAdmin, tabCust, tabSupp].forEach(t => {
      if (t) {
        t.className = "profile-tab px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer";
      }
    });
  };

  const setActiveTab = (btn) => {
    resetTabs();
    if (btn) btn.className = "profile-tab active px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-950 dark:bg-emerald-900/80 dark:text-white transition cursor-pointer";
  };

  if (tabAll) {
    tabAll.addEventListener("click", () => {
      setActiveTab(tabAll);
      if (secAdmin) secAdmin.style.display = "block";
      if (secCust) secCust.style.display = "block";
      if (secSupp) secSupp.style.display = "block";
    });
  }
  if (tabAdmin) {
    tabAdmin.addEventListener("click", () => {
      setActiveTab(tabAdmin);
      if (secAdmin) secAdmin.style.display = "block";
      if (secCust) secCust.style.display = "none";
      if (secSupp) secSupp.style.display = "none";
    });
  }
  if (tabCust) {
    tabCust.addEventListener("click", () => {
      setActiveTab(tabCust);
      if (secAdmin) secAdmin.style.display = "none";
      if (secCust) secCust.style.display = "block";
      if (secSupp) secSupp.style.display = "none";
    });
  }
  if (tabSupp) {
    tabSupp.addEventListener("click", () => {
      setActiveTab(tabSupp);
      if (secAdmin) secAdmin.style.display = "none";
      if (secCust) secCust.style.display = "none";
      if (secSupp) secSupp.style.display = "block";
    });
  }

  // 7. Global Keyboard ESC handler for closing modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProfileModal();
      closeSettingsModal();
      closeAuditModal();
      closeCommModal();
      closeSidebarDrawer();
    }
  });

  // 8. Backdrop click close handlers
  ["profileModal", "settingsModal", "auditModal", "commModal"].forEach(id => {
    const m = document.getElementById(id);
    if (m) {
      m.addEventListener("click", (e) => {
        if (e.target === m) {
          m.classList.add("hidden");
        }
      });
    }
  });
}

// ============================================================================
// 11. Structured Pipeline Analysis Execution
// ============================================================================
async function analyzeDisruption(customPayload = null) {
  hideValidationError();
  const btn = document.getElementById("btnAnalyze");
  const spinner = document.getElementById("analyzeSpinner");

  let payload = customPayload;

  if (!payload) {
    // Collect and validate from structured form
    const type = document.getElementById("inputDisruptionType").value;
    const supplier = document.getElementById("inputSupplier").value;
    const po = document.getElementById("inputPO").value;
    const shipment = document.getElementById("inputShipment").value;
    const sku = document.getElementById("inputSKU").value;
    const date = document.getElementById("inputDisruptionDate").value;
    const delayVal = document.getElementById("inputDelayDays").value;
    const qtyVal = document.getElementById("inputQuantityAffected").value;
    const location = document.getElementById("inputLocation").value;
    const reason = document.getElementById("inputReason").value;
    const severity = document.getElementById("inputSeverity").value;

    const delayDays = parseInt(delayVal, 10);
    if (isNaN(delayDays) || delayDays <= 0) {
      showValidationError("Expected delay days must be greater than 0.");
      return;
    }

    if (type === "Warehouse Incident" && !sku) {
      showValidationError("Please select a Product SKU for the warehouse incident.");
      return;
    }

    if (type !== "Warehouse Incident" && !supplier && !shipment && !sku) {
      showValidationError("Please select at least a Supplier, Shipment, or SKU.");
      return;
    }

    payload = {
      disruption_type: type,
      supplier_id: supplier || null,
      po_number: po || null,
      shipment_id: shipment || null,
      sku_id: sku || null,
      disruption_date: date || (referenceData ? referenceData.system_current_date : "2026-09-05"),
      delay_days: delayDays,
      quantity_affected: qtyVal ? parseInt(qtyVal, 10) : null,
      affected_location: location || null,
      reason: reason || "",
      severity: severity || "High"
    };
  }

  btn.disabled = true;
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("/api/disruption/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      const errMsg = err.detail || "Disruption validation or analysis failed.";
      showValidationError(errMsg);
      throw new Error(errMsg);
    }

    const assessment = await res.json();
    currentAssessment = assessment;
    renderResults(assessment);
    loadAuditCount();

    if (assessment.has_system_impact) {
      playAudioChime("alert");
      showToast(`Operational Impact Confirmed: ${assessment.total_orders_impacted} order(s) slip`, "alert", "⚠️");
    } else {
      playAudioChime("success");
      showToast("Verified Zero Operational Impact. All customer orders safe.", "success", "✅");
    }
  } catch (err) {
    console.warn("Analysis Error:", err.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
}

// ============================================================================
// 12. Render Assessment Results
// ============================================================================
function renderResults(asm) {
  const results = document.getElementById("resultsSection");
  results.classList.remove("hidden");

  // Ambiguity Banner
  const ambBanner = document.getElementById("ambiguityBanner");
  if (asm.grounding && asm.grounding.is_ambiguous) {
    ambBanner.classList.remove("hidden");
    document.getElementById("ambiguityText").textContent = asm.grounding.ambiguity_reason;
    const candContainer = document.getElementById("ambiguityCandidateContainer");
    candContainer.innerHTML = "";

    const ambMatch = asm.grounding.matches.find(m => m.is_ambiguous);
    if (ambMatch && ambMatch.candidate_matches) {
      ambMatch.candidate_matches.forEach(cand => {
        const b = document.createElement("button");
        b.className = "bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200 text-xs px-3.5 py-2.5 rounded-xl transition text-left shadow-sm hover:shadow-md cursor-pointer";
        b.innerHTML = `<strong>Confirm: ${cand.name}</strong> (${cand.supplier_id})<br><span class="text-[10px] text-emerald-700 dark:text-emerald-300">Active Shipments: ${(cand.pending_shipments && cand.pending_shipments.length) ? cand.pending_shipments.join(", ") : "None scheduled"}</span>`;
        b.addEventListener("click", () => {
          const suppSelect = document.getElementById("inputSupplier");
          if (suppSelect) {
            suppSelect.value = cand.supplier_id;
            suppSelect.dispatchEvent(new Event("change"));
          }
          analyzeDisruption();
        });
        candContainer.appendChild(b);
      });
    }
  } else {
    ambBanner.classList.add("hidden");
  }

  // Status Badge
  const statusBadge = document.getElementById("impactStatusBadge");
  const categoryBadge = document.getElementById("disruptionCategoryBadge");
  categoryBadge.textContent = asm.category || "General";

  if (!asm.has_system_impact) {
    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700";
    statusBadge.textContent = "VERIFIED NO OPERATIONAL IMPACT";
  } else {
    statusBadge.className = "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700 badge-critical";
    statusBadge.textContent = "OPERATIONAL IMPACT CONFIRMED";
  }

  document.getElementById("summaryHeadline").textContent = asm.summary_headline || "Impact Analysis Completed";
  document.getElementById("executiveBriefingText").textContent = asm.executive_briefing || "";

  // Financial Metrics
  document.getElementById("metricOrdersCount").textContent = asm.total_orders_impacted || 0;
  document.getElementById("metricRevenueRisk").textContent = `$${(asm.total_revenue_at_risk || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("metricSlaPenalty").textContent = `$${(asm.total_sla_penalty_risk || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Grounding Citations
  const evidenceList = document.getElementById("groundingEvidenceList");
  evidenceList.innerHTML = "";

  if (asm.grounding && asm.grounding.matches) {
    asm.grounding.matches.forEach(m => {
      const item = document.createElement("div");
      item.className = "trace-card bg-slate-50 dark:bg-[#160731] p-3.5 rounded-xl border border-slate-200 dark:border-purple-800/60 text-xs shadow-sm";
      item.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-slate-800 dark:text-white capitalize">${m.entity_type}: ${m.matched_name || m.raw_mention}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.confidence === 'EXACT' ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-900 dark:text-purple-200' : 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200'}">${m.confidence} MATCH</span>
        </div>
        <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">${m.evidence}</p>
      `;
      evidenceList.appendChild(item);
    });
  }

  if (asm.citations) {
    asm.citations.forEach(c => {
      const citItem = document.createElement("div");
      citItem.className = "trace-card bg-purple-50/70 dark:bg-[#200a45] p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-700/60 text-xs shadow-sm";
      citItem.innerHTML = `
        <div class="text-[10px] text-purple-900 dark:text-purple-300 uppercase font-bold mb-1">Database Fact Citation</div>
        <p class="text-slate-700 dark:text-purple-200 text-[11px] leading-relaxed">${c}</p>
      `;
      evidenceList.appendChild(citItem);
    });
  }

  renderOrders(asm.affected_orders);
}

// ============================================================================
// 13. Render Affected Orders & Multi-Option Trade-offs
// ============================================================================
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="elite-card rounded-2xl p-8 text-center space-y-2.5 shadow-md">
        <div class="text-4xl">✅</div>
        <h4 class="text-base font-extrabold text-white">All Customer Orders Safe</h4>
        <p class="text-xs text-emerald-200/90 max-w-lg mx-auto leading-relaxed font-medium">
          No committed sales orders, critical customer delivery dates, or warehouse stock allocations are compromised by this event. 
          No expedited freight expense or customer notification required.
        </p>
      </div>
    `;
    return;
  }

  orders.forEach(order => {
    const recommendedOpt = order.options ? (order.options.find(o => o.is_recommended) || order.options[0]) : null;
    if (!selectedOptions[order.order_id] && recommendedOpt) {
      selectedOptions[order.order_id] = recommendedOpt.option_id;
    }

    const orderCard = document.createElement("div");
    orderCard.className = "elite-card rounded-2xl p-6 space-y-4 shadow-sm";
    orderCard.id = `card-${order.order_id}`;

    let tierBadgeClass = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700";
    if (order.customer_tier === "Platinum") tierBadgeClass = "bg-rose-50 text-rose-800 border-rose-200 font-bold dark:bg-rose-950/60 dark:text-rose-200";
    else if (order.customer_tier === "Gold") tierBadgeClass = "bg-amber-50 text-amber-800 border-amber-200 font-bold dark:bg-amber-950/60 dark:text-amber-200";

    let urgencyBadgeClass = "bg-slate-100 text-slate-700";
    if (order.urgency_level === "CRITICAL") urgencyBadgeClass = "bg-rose-600 text-white font-bold";
    else if (order.urgency_level === "HIGH") urgencyBadgeClass = "bg-amber-600 text-white font-bold";
    else if (order.urgency_level === "MEDIUM") urgencyBadgeClass = "bg-purple-700 text-white font-bold";

    orderCard.innerHTML = `
      <!-- Order Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-purple-800/40 pb-3.5">
        <div class="flex items-center space-x-3">
          <span class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700 flex items-center justify-center font-extrabold text-xs text-purple-950 dark:text-white shadow-inner">
            #${order.ranking}
          </span>
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="text-base font-bold text-slate-900 dark:text-white">${order.customer_name}</h4>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tierBadgeClass}">${order.customer_tier} Tier</span>
              <span class="px-2.5 py-0.5 text-xs rounded-full ${urgencyBadgeClass}">${order.urgency_level} URGENCY</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Order: <strong class="text-slate-800 dark:text-white">${order.order_id}</strong> • SKU: <span class="text-purple-900 dark:text-purple-300 font-semibold">${order.sku_id}</span> (${order.sku_name})
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-5 text-xs">
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">Promised Date:</span>
            <strong class="text-slate-900 dark:text-white block font-semibold">${order.promise_date}</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">Projected Slip:</span>
            <strong class="text-rose-600 dark:text-rose-400 block font-bold">+${order.projected_slip_days} Days Late</strong>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block">SLA Exposure:</span>
            <strong class="text-rose-600 dark:text-rose-400 block font-bold">$${(order.total_sla_risk || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <!-- Traceability Citations Accordion -->
      <details class="bg-slate-50/80 dark:bg-[#140529] border border-slate-200 dark:border-purple-800/50 rounded-xl p-3 text-xs group">
        <summary class="cursor-pointer font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between select-none">
          <span>🔍 Evidence</span>
          <span class="text-[10px] text-slate-400 group-open:rotate-180 transition">▼</span>
        </summary>
        <ul class="mt-2.5 space-y-1.5 text-slate-700 dark:text-slate-200 pl-3 border-l-2 border-purple-600">
          ${order.data_citations ? order.data_citations.map(c => `<li>• ${c}</li>`).join("") : ""}
        </ul>
      </details>

      <!-- Options Grid -->
      <div>
        <div class="text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Resolutions</span>
          <span class="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Select an option to commit:</span>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3" id="options-container-${order.order_id}">
          <!-- Injected dynamically -->
        </div>
      </div>

      <!-- Human Operator Action Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-purple-800/40">
        <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
          <span class="text-purple-900 dark:text-purple-200 font-bold">Resolution:</span>
          <strong id="selectedLabel-${order.order_id}" class="text-slate-900 dark:text-white">${recommendedOpt ? recommendedOpt.title : "None"}</strong>
        </div>

        <div class="flex items-center space-x-3">
          <button class="btn-draft-email text-xs bg-purple-50 dark:bg-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-200 hover:text-purple-950 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700 font-semibold transition cursor-pointer"
            data-order-id="${order.order_id}">
            ✉️ Draft
          </button>
          <button class="btn-commit-action elite-btn-primary text-white font-bold px-5 py-2.5 rounded-xl shadow-md text-xs transition cursor-pointer"
            data-order-id="${order.order_id}">
            ✓ Commit
          </button>
        </div>
      </div>
    `;

    container.appendChild(orderCard);

    const optionsContainer = document.getElementById(`options-container-${order.order_id}`);
    if (order.options) {
      order.options.forEach(opt => {
        const isSelected = selectedOptions[order.order_id] === opt.option_id;
        const optCard = document.createElement("div");
        optCard.className = `option-card border rounded-2xl p-5 cursor-pointer relative flex flex-col justify-between space-y-3.5 shadow-sm transition-all ${
          isSelected ? "selected border-purple-700 bg-purple-50/70 dark:bg-[#3b0764] ring-2 ring-purple-600/50" : "border-slate-200 dark:border-purple-800/50 bg-white dark:bg-[#15062e] hover:border-purple-300 hover:bg-purple-50/30 hover:shadow"
        }`;
        optCard.id = `optcard-${order.order_id}-${opt.option_id}`;

        optCard.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <label class="flex items-center space-x-2.5 cursor-pointer">
                <input type="radio" name="opt-radio-${order.order_id}" value="${opt.option_id}" ${isSelected ? "checked" : ""} class="text-purple-700 focus:ring-purple-600 accent-purple-700 w-4 h-4 cursor-pointer shrink-0">
                <span class="font-bold text-[13px] text-slate-900 dark:text-white leading-tight">${opt.title}</span>
              </label>
              ${opt.is_recommended ? '<span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 uppercase tracking-wide shrink-0">RECOMMENDED</span>' : ''}
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${opt.description}</p>

            ${opt.recommendation_rationale ? `
              <div class="bg-purple-50 dark:bg-[#250b4a] border border-purple-200 dark:border-purple-700/70 rounded-xl p-3 text-xs text-purple-950 dark:text-purple-100 leading-relaxed font-medium">
                ${opt.recommendation_rationale}
              </div>
            ` : ''}

            <div class="grid grid-cols-2 gap-3 text-xs pt-1">
              <div class="bg-slate-50 dark:bg-[#110426] p-3 rounded-xl border border-slate-200 dark:border-purple-800/50 space-y-1.5">
                <span class="text-purple-900 dark:text-purple-300 font-bold block text-[10px] uppercase tracking-wider">PROS</span>
                <ul class="space-y-1 text-slate-700 dark:text-slate-200 text-[11px] leading-snug">
                  ${opt.pros ? opt.pros.map(p => `<li class="flex items-start space-x-1.5"><span class="text-purple-700 dark:text-purple-400 font-bold shrink-0">+</span><span>${p}</span></li>`).join("") : ""}
                </ul>
              </div>
              <div class="bg-slate-50 dark:bg-[#110426] p-3 rounded-xl border border-slate-200 dark:border-purple-800/50 space-y-1.5">
                <span class="text-rose-700 dark:text-rose-400 font-bold block text-[10px] uppercase tracking-wider">CONS / TRADE-OFFS</span>
                <ul class="space-y-1 text-slate-700 dark:text-slate-200 text-[11px] leading-snug">
                  ${opt.cons ? opt.cons.map(c => `<li class="flex items-start space-x-1.5"><span class="text-rose-600 dark:text-rose-400 font-bold shrink-0">-</span><span>${c}</span></li>`).join("") : ""}
                </ul>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs border-t border-slate-100 dark:border-purple-800/40 pt-3 text-slate-600 dark:text-slate-300">
            <div>Cost: <strong class="text-slate-900 dark:text-white font-bold">$${(opt.cost || 0).toLocaleString()}</strong></div>
            <div>New ETA: <strong class="text-purple-900 dark:text-purple-300 font-bold">${opt.new_delivery_date}</strong></div>
            <div>SLA Risk: <strong class="text-rose-600 dark:text-rose-400 font-bold">$${(opt.sla_penalty_incurred || 0).toLocaleString()}</strong></div>
          </div>
        `;

        optCard.addEventListener("click", () => {
          selectOption(order.order_id, opt.option_id, opt.title);
        });

        optionsContainer.appendChild(optCard);
      });
    }

    orderCard.querySelector(".btn-draft-email").addEventListener("click", () => {
      openDraftEmailModal(order.order_id);
    });

    orderCard.querySelector(".btn-commit-action").addEventListener("click", () => {
      commitResolution(order.order_id);
    });
  });
}

function selectOption(orderId, optionId, optionTitle) {
  selectedOptions[orderId] = optionId;
  const container = document.getElementById(`options-container-${orderId}`);
  if (container) {
    container.querySelectorAll(".option-card").forEach(c => {
      c.classList.remove("selected", "border-purple-700", "bg-purple-50/70", "ring-2", "ring-purple-600/50");
      c.classList.add("border-slate-200", "bg-white");
    });
  }

  const activeCard = document.getElementById(`optcard-${orderId}-${optionId}`);
  if (activeCard) {
    activeCard.classList.add("selected", "border-purple-700", "bg-purple-50/70", "ring-2", "ring-purple-600/50");
    activeCard.classList.remove("border-slate-200", "bg-white");
    const radio = activeCard.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  const label = document.getElementById(`selectedLabel-${orderId}`);
  if (label) label.textContent = optionTitle;
}

// ============================================================================
// 14. Customer Email Draft Modal
// ============================================================================
async function openDraftEmailModal(orderId) {
  if (!currentAssessment) {
    alert("No active assessment available.");
    return;
  }
  const optionId = selectedOptions[orderId];
  if (!optionId) {
    alert("Please select a resolution option first.");
    return;
  }

  try {
    const res = await fetch("/api/disruption/draft-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessment_id: currentAssessment.assessment_id,
        order_id: orderId,
        option_id: optionId
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Draft generation failed");
    }

    const data = await res.json();
    document.getElementById("commModalTitle").textContent = `Customer Notification: ${data.customer_name} (#${data.order_id})`;
    document.getElementById("commModalSubtitle").textContent = `Grounded in chosen resolution (${data.option_id})`;
    document.getElementById("commModalBody").textContent = data.email_draft;
    document.getElementById("commModal").classList.remove("hidden");
    playAudioChime("ping");
  } catch (err) {
    alert("Failed to generate draft: " + err.message);
  }
}

function closeCommModal() {
  document.getElementById("commModal").classList.add("hidden");
}

// ============================================================================
// 15. Commit Human Operator Decision
// ============================================================================
async function commitResolution(orderId) {
  if (!currentAssessment) {
    alert("No active assessment available.");
    return;
  }
  const optionId = selectedOptions[orderId];
  if (!optionId) {
    alert("Please select a resolution option first.");
    return;
  }

  const orderImpact = currentAssessment.affected_orders.find(o => o.order_id === orderId);
  if (!orderImpact) {
    alert("Order not found in active assessment.");
    return;
  }

  const chosenOpt = orderImpact.options.find(o => o.option_id === optionId);
  if (!chosenOpt) {
    alert("Selected option not found for this order.");
    return;
  }

  const notes = prompt(`Confirm resolution '${chosenOpt.title}' for order ${orderId}.\nOptional notes:`, "Approved per recommendation");
  if (notes === null) return;

  try {
    const res = await fetch("/api/disruption/apply-decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessment_id: currentAssessment.assessment_id,
        order_id: orderId,
        chosen_option_type: chosenOpt.option_type,
        chosen_option_id: optionId,
        operator_notes: notes,
        approved_by: `${activePersona.name} (${activePersona.title || activePersona.type})`
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Decision commit failed");
    }

    const data = await res.json();
    showToast(`Resolution committed: ${data.order_id} -> ${data.new_order_status}`, "success", "✓");
    playAudioChime("success");
    loadAuditCount();

    const card = document.getElementById(`card-${orderId}`);
    if (card) {
      card.classList.add("ring-2", "ring-purple-600");
    }
  } catch (err) {
    alert("Failed to commit decision: " + err.message);
  }
}

// ============================================================================
// 16. Audit Log Modal
// ============================================================================
async function loadAuditCount() {
  try {
    const res = await fetch("/api/system/audit");
    const data = await res.json();
    const count = data.audit_entries ? data.audit_entries.length : 0;
    const badge = document.getElementById("auditCountBadge");
    if (badge) badge.textContent = count;
  } catch (e) {
    console.warn("Could not load audit count:", e);
  }
}

async function openAuditModal() {
  try {
    const res = await fetch("/api/system/audit");
    const data = await res.json();
    const list = document.getElementById("auditLogList");
    list.innerHTML = "";

    const entries = data.audit_entries || [];
    if (entries.length === 0) {
      list.innerHTML = `<div class="text-xs text-slate-500 text-center py-6">No audit entries recorded yet.</div>`;
    } else {
      entries.slice().reverse().forEach(e => {
        const div = document.createElement("div");
        div.className = "bg-slate-50 dark:bg-[#160731] border border-slate-200 dark:border-purple-800/60 rounded-xl p-3.5 text-xs space-y-1";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-purple-900 dark:text-purple-300">${e.event}</span>
            <span class="text-[10px] text-slate-500 font-mono">${new Date(e.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="text-slate-700 dark:text-slate-200 text-[11px]">${e.action_summary || e.detail || e.assessment_id || ""}</div>
          ${e.operator ? `<div class="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">Approved by: ${e.operator}</div>` : ""}
        `;
        list.appendChild(div);
      });
    }

    document.getElementById("auditModal").classList.remove("hidden");
  } catch (err) {
    alert("Failed to load audit logs: " + err.message);
  }
}

function closeAuditModal() {
  document.getElementById("auditModal").classList.add("hidden");
}

// ============================================================================
// 17. Profile & Settings Modal Controls
// ============================================================================
function openProfileModal(focusEdit = false) {
  const input = document.getElementById("profileModalNameInput");
  const currentSaved = localStorage.getItem("chainSolve_username") || appSettings.username || "Username";
  if (input) {
    input.value = currentSaved;
  }
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.remove("hidden");

  if (focusEdit && input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 120);
  }
}

function saveProfileNameFromModal() {
  const input = document.getElementById("profileModalNameInput");
  if (!input) return;
  const newName = input.value.trim() || "Username";
  localStorage.setItem("chainSolve_username", newName);
  appSettings.username = newName;
  localStorage.setItem("chainSolve_settings", JSON.stringify(appSettings));

  if (activePersona.type === "admin") {
    activePersona.name = newName;
  }
  updateActivePersonaUI();
  showToast(`Profile login name saved as: ${newName}`, "success", "💾");
  playAudioChime("success");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.add("hidden");
}

function openSettingsModal() {
  populateSettingsModal();
  document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettingsModal() {
  document.getElementById("settingsModal").classList.add("hidden");
}
