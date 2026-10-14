/**
 * Supply Chain Disruption Response Assistant
 * Enterprise SPA Application Logic
 */

// Application State
const state = {
  currentView: 'dashboard',
  referenceData: null,
  activeUser: {
    username: 'admin',
    full_name: 'Marcus Vance',
    role: 'Admin',
    department: 'Global Supply Chain Operations',
    email: 'admin@chainsolve.io'
  },
  disruptions: [],
  selectedDisruptionId: null,
  notifications: [],
  suppliers: [],
  inventory: [],
  shipments: [],
  customerOrders: [],
  recommendations: []
};

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadReferenceData();
  await refreshNotifications();
  await navigateTo('dashboard');
});

function setupEventListeners() {
  // Mobile sidebar toggle
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      const sidebar = document.getElementById('mainSidebar');
      sidebar.classList.toggle('hidden');
    });
  }

  // Theme toggle
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', toggleTheme);
  }

  // Notifications Bell
  const btnNotifBell = document.getElementById('btnNotifBell');
  const notificationDrawer = document.getElementById('notificationDrawer');
  const btnCloseNotifDrawer = document.getElementById('btnCloseNotifDrawer');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');

  if (btnNotifBell && notificationDrawer) {
    btnNotifBell.addEventListener('click', () => {
      notificationDrawer.classList.remove('hidden');
      renderNotifications();
    });
  }
  if (btnCloseNotifDrawer && notificationDrawer) {
    btnCloseNotifDrawer.addEventListener('click', () => {
      notificationDrawer.classList.add('hidden');
    });
  }
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', markAllNotificationsRead);
  }

  // Profile menu
  const btnProfileMenu = document.getElementById('btnProfileMenu');
  const profileDropdown = document.getElementById('profileDropdown');
  if (btnProfileMenu && profileDropdown) {
    btnProfileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
      profileDropdown.classList.add('hidden');
    });
  }

  // Global search input
  const globalSearchInput = document.getElementById('globalSearchInput');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearchInput.value.trim();
        if (query) {
          navigateTo('disruptions');
          const filterInput = document.getElementById('filterSearchInput');
          if (filterInput) {
            filterInput.value = query;
            loadDisruptionsData();
          }
        }
      }
    });
  }

  // Filter change listeners
  ['filterSeverity', 'filterStatus', 'filterType', 'filterSupplier'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', loadDisruptionsData);
  });
  const filterSearchInput = document.getElementById('filterSearchInput');
  if (filterSearchInput) {
    filterSearchInput.addEventListener('input', debounce(loadDisruptionsData, 300));
  }
}

// ============================================================================
// Navigation & Router
// ============================================================================
async function navigateTo(viewName) {
  state.currentView = viewName;

  // Update Breadcrumb
  const breadcrumb = document.getElementById('currentBreadcrumb');
  if (breadcrumb) {
    const titles = {
      'landing': 'Home',
      'dashboard': 'Dashboard',
      'disruptions': 'Disruptions',
      'create-disruption': 'Report Incident',
      'impact-analysis': 'Impact Analysis',
      'risk-assessment': 'Risk Assessment',
      'recommendations': 'Action Plans',
      'suppliers': 'Suppliers',
      'inventory': 'Inventory',
      'shipments': 'Shipments',
      'orders': 'Customer Orders',
      'resolution': 'Resolution Center',
      'reports': 'Reports & Analytics',
      'settings': 'Settings & Users'
    };
    breadcrumb.textContent = titles[viewName] || viewName;
  }

  // Update Sidebar active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('nav-tab-active');
  });
  const activeBtn = document.getElementById(`nav-${viewName}`);
  if (activeBtn) {
    activeBtn.classList.add('nav-tab-active');
  }

  // Toggle visible panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  const targetPanel = document.getElementById(`view-${viewName}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }

  // Load View Data
  switch (viewName) {
    case 'dashboard':
      await loadDashboardData();
      break;
    case 'disruptions':
      await loadDisruptionsData();
      break;
    case 'create-disruption':
      populateCreateDisruptionDropdowns();
      break;
    case 'impact-analysis':
      await initImpactAnalysisView();
      break;
    case 'risk-assessment':
      await loadRiskAssessmentView();
      break;
    case 'recommendations':
      await loadRecommendationsData();
      break;
    case 'suppliers':
      await loadSuppliersData();
      break;
    case 'inventory':
      await loadInventoryData();
      break;
    case 'shipments':
      await loadShipmentsData();
      break;
    case 'orders':
      await loadCustomerOrdersData();
      break;
    case 'resolution':
      await loadResolutionCenterData();
      break;
    case 'reports':
      await loadReportsData();
      break;
  }
}

// ============================================================================
// API Fetch Helpers
// ============================================================================
async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    showToast(err.message, 'error');
    throw err;
  }
}

// ============================================================================
// 1. Reference Data Loading
// ============================================================================
async function loadReferenceData() {
  try {
    state.referenceData = await fetchAPI('/reference-data');
    populateSupplierFilters();
  } catch (err) {
    console.warn('Fallback to local reference state');
  }
}

function populateSupplierFilters() {
  const filterSupplier = document.getElementById('filterSupplier');
  if (!filterSupplier || !state.referenceData) return;
  filterSupplier.innerHTML = '<option value="All">All Suppliers</option>';
  state.referenceData.suppliers.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.supplier_id;
    opt.textContent = `${s.name} (${s.supplier_id})`;
    filterSupplier.appendChild(opt);
  });
}

// ============================================================================
// 2. Dashboard View
// ============================================================================
async function loadDashboardData() {
  try {
    const [summary, analytics] = await Promise.all([
      fetchAPI('/dashboard/summary'),
      fetchAPI('/dashboard/analytics')
    ]);

    // Update KPI Cards
    document.getElementById('kpiActiveDisruptions').textContent = summary.active_disruptions_count;
    document.getElementById('kpiCriticalDisruptions').textContent = summary.critical_disruptions_count;
    document.getElementById('kpiAtRiskOrders').textContent = summary.at_risk_orders_count;
    document.getElementById('kpiAffectedShipments').textContent = summary.affected_shipments_count;
    document.getElementById('kpiAffectedProducts').textContent = summary.affected_products_count;
    document.getElementById('kpiFinancialImpact').textContent = `$${summary.estimated_financial_impact.toLocaleString()}`;

    // Update Sidebar Badges
    const badgeDisr = document.getElementById('navDisruptionCount');
    if (badgeDisr) badgeDisr.textContent = summary.active_disruptions_count;

    // Render Charts
    renderSeverityChart(analytics.severity_distribution);
    renderTypeChart(analytics.disruptions_by_type);
    renderTierChart(analytics.orders_by_tier);

    // Render Highest-Priority Incidents Table
    const tbody = document.getElementById('dashboardIncidentsTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (!analytics.highest_priority_incidents || analytics.highest_priority_incidents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-slate-400">No active incidents</td></tr>`;
      } else {
        analytics.highest_priority_incidents.forEach(inc => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="font-mono font-bold text-indigo-600">${inc.disruption_id}</td>
            <td>
              <div class="font-bold text-slate-900 dark:text-white">${escapeHTML(inc.title)}</div>
              <div class="text-[11px] text-slate-500 truncate max-w-xs">${escapeHTML(inc.description)}</div>
            </td>
            <td><span class="text-slate-600 dark:text-slate-300">${inc.disruption_type}</span></td>
            <td>${inc.supplier_id || inc.location || 'Central Facility'}</td>
            <td><span class="${getSeverityBadgeClass(inc.severity)} px-2 py-0.5 rounded-full text-[10px] font-bold">${inc.severity}</span></td>
            <td><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">${inc.status}</span></td>
            <td>
              <button onclick="inspectDisruption('${inc.disruption_id}')" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer">
                Analyze ➔
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // Render Supplier Risk Table
    const supBody = document.getElementById('dashboardSupplierRiskBody');
    if (supBody && analytics.supplier_risk_overview) {
      supBody.innerHTML = '';
      analytics.supplier_risk_overview.slice(0, 6).forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(s.name)}</td>
          <td class="text-slate-500">${escapeHTML(s.location)}</td>
          <td><span class="font-mono font-bold">${Math.round(s.reliability_score * 100)}%</span></td>
          <td>${s.active_disruptions} active</td>
          <td><span class="${getSeverityBadgeClass(s.risk_level)} px-2 py-0.5 rounded-full text-[10px] font-bold">${s.risk_level}</span></td>
        `;
        supBody.appendChild(tr);
      });
    }

    // Load top action recommendations
    const recs = await fetchAPI('/disruptions/DISR-2026-001/recommendations').catch(() => []);
    const recsList = document.getElementById('dashboardRecsList');
    if (recsList) {
      recsList.innerHTML = '';
      recs.slice(0, 3).forEach(r => {
        const div = document.createElement('div');
        div.className = 'p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5';
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="badge-critical px-2 py-0.5 rounded text-[10px] font-bold">Priority ${r.priority}</span>
            <span class="text-[10px] font-semibold text-slate-400">${r.responsible_role}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 dark:text-white">${escapeHTML(r.action)}</h4>
          <p class="text-[11px] text-slate-500">${escapeHTML(r.reason)}</p>
          <div class="flex items-center justify-between pt-1">
            <span class="text-[10px] font-semibold text-emerald-600">Benefit: ${escapeHTML(r.expected_benefit)}</span>
            <button onclick="navigateTo('recommendations')" class="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer">Review Action</button>
          </div>
        `;
        recsList.appendChild(div);
      });
    }

  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function renderSeverityChart(distribution) {
  const container = document.getElementById('chartSeverityBars');
  if (!container || !distribution) return;
  container.innerHTML = '';
  const total = distribution.reduce((sum, d) => sum + d.count, 0) || 1;

  distribution.forEach(d => {
    const pct = Math.round((d.count / total) * 100);
    const colorClass = d.severity === 'Critical' ? 'bg-red-500' : (
      d.severity === 'High' ? 'bg-amber-500' : (d.severity === 'Medium' ? 'bg-yellow-400' : 'bg-indigo-400')
    );
    const row = document.createElement('div');
    row.className = 'space-y-1';
    row.innerHTML = `
      <div class="flex justify-between text-xs font-semibold">
        <span class="text-slate-700 dark:text-slate-300">${d.severity}</span>
        <span class="text-slate-500">${d.count} (${pct}%)</span>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div class="${colorClass} h-full rounded-full" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderTypeChart(distribution) {
  const container = document.getElementById('chartTypeBars');
  if (!container || !distribution) return;
  container.innerHTML = '';
  const total = distribution.reduce((sum, d) => sum + d.count, 0) || 1;

  distribution.forEach(d => {
    const pct = Math.round((d.count / total) * 100);
    const row = document.createElement('div');
    row.className = 'space-y-1';
    row.innerHTML = `
      <div class="flex justify-between text-xs font-semibold">
        <span class="text-slate-700 dark:text-slate-300 truncate max-w-[160px]">${d.type}</span>
        <span class="text-slate-500">${d.count}</span>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div class="bg-indigo-600 h-full rounded-full" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderTierChart(distribution) {
  const container = document.getElementById('chartTierBars');
  if (!container || !distribution) return;
  container.innerHTML = '';
  const total = distribution.reduce((sum, d) => sum + d.count, 0) || 1;

  distribution.forEach(d => {
    const pct = Math.round((d.count / total) * 100);
    const colorClass = d.tier === 'Platinum' ? 'bg-red-500' : (d.tier === 'Gold' ? 'bg-amber-500' : 'bg-slate-400');
    const row = document.createElement('div');
    row.className = 'space-y-1';
    row.innerHTML = `
      <div class="flex justify-between text-xs font-semibold">
        <span class="text-slate-700 dark:text-slate-300">${d.tier} Tier</span>
        <span class="text-slate-500">${d.count} orders</span>
      </div>
      <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div class="${colorClass} h-full rounded-full" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

// ============================================================================
// 3. Disruption Management View
// ============================================================================
async function loadDisruptionsData() {
  const severity = document.getElementById('filterSeverity')?.value || 'All';
  const status = document.getElementById('filterStatus')?.value || 'All';
  const type = document.getElementById('filterType')?.value || 'All';
  const supplier = document.getElementById('filterSupplier')?.value || 'All';
  const search = document.getElementById('filterSearchInput')?.value || '';

  const params = new URLSearchParams();
  if (severity !== 'All') params.append('severity', severity);
  if (status !== 'All') params.append('status', status);
  if (type !== 'All') params.append('disruption_type', type);
  if (supplier !== 'All') params.append('supplier_id', supplier);
  if (search) params.append('search', search);

  const disruptions = await fetchAPI(`/disruptions?${params.toString()}`);
  state.disruptions = disruptions;

  const tbody = document.getElementById('disruptionsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (disruptions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-6 text-slate-400">No matching disruptions found.</td></tr>`;
    return;
  }

  disruptions.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono font-bold text-indigo-600">${d.disruption_id}</td>
      <td>
        <div class="font-bold text-slate-900 dark:text-white">${escapeHTML(d.title)}</div>
        <div class="text-[11px] text-slate-500 truncate max-w-xs">${escapeHTML(d.description)}</div>
      </td>
      <td><span class="text-slate-600 dark:text-slate-300">${d.disruption_type}</span></td>
      <td>${d.supplier_id || d.shipment_id || '--'}</td>
      <td>${escapeHTML(d.location || 'Unknown')}</td>
      <td><span class="${getSeverityBadgeClass(d.severity)} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${d.severity}</span></td>
      <td><span class="text-[11px] text-slate-500">${formatDate(d.reported_at)}</span></td>
      <td class="font-bold">${d.affected_orders_count || 0}</td>
      <td><span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">${d.status}</span></td>
      <td class="space-x-2">
        <button onclick="inspectDisruption('${d.disruption_id}')" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">Analyze</button>
        ${d.status !== 'Resolved' ? `<button onclick="openResolveModal('${d.disruption_id}')" class="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">Resolve</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function inspectDisruption(disruptionId) {
  state.selectedDisruptionId = disruptionId;
  navigateTo('impact-analysis');
}

// ============================================================================
// 4. Create Disruption Form & Notice Extraction
// ============================================================================
function populateCreateDisruptionDropdowns() {
  if (!state.referenceData) return;

  const selectSup = document.getElementById('inputFormSupplier');
  const selectShip = document.getElementById('inputFormShipment');
  const selectSKU = document.getElementById('inputFormSKU');

  if (selectSup) {
    selectSup.innerHTML = '<option value="">-- None / Internal Incident --</option>';
    state.referenceData.suppliers.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.supplier_id;
      opt.textContent = `${s.name} (${s.supplier_id})`;
      selectSup.appendChild(opt);
    });
  }

  if (selectShip) {
    selectShip.innerHTML = '<option value="">-- None / Warehouse Incident --</option>';
    state.referenceData.shipments.forEach(sh => {
      const opt = document.createElement('option');
      opt.value = sh.shipment_id;
      opt.textContent = `${sh.shipment_id} - PO ${sh.po_number} (${sh.carrier_name})`;
      selectShip.appendChild(opt);
    });
  }

  if (selectSKU) {
    selectSKU.innerHTML = '<option value="">-- Auto-linked or Selectable --</option>';
    state.referenceData.skus.forEach(sku => {
      const opt = document.createElement('option');
      opt.value = sku.sku_id;
      opt.textContent = `${sku.sku_id} - ${sku.name}`;
      selectSKU.appendChild(opt);
    });
  }
}

function loadScenarioPreset(presetIndex) {
  const presets = [
    {
      title: "Production Line 3 Hydraulic Pump Failure",
      type: "Supplier Production Halt",
      supplier: "SUP-001",
      shipment: "SH-8921",
      sku: "SKU-1049",
      location: "Fremont, CA",
      delay: 14,
      severity: "Critical",
      quantity: 200,
      description: "Catastrophic hydraulic pump failure on Line 3 halting all production of APX-902 sensor assemblies.",
      evidence: "EDI notice from Marcus Vance; confirmed zero unallocated safety stock in WH-MAIN."
    },
    {
      title: "Port of Long Beach Berth & Railhead Congestion",
      type: "Carrier/Shipment Delay",
      supplier: "SUP-002",
      shipment: "SH-7714",
      sku: "SKU-2088",
      location: "Port of Long Beach, CA",
      delay: 10,
      severity: "High",
      quantity: 500,
      description: "Severe vessel anchorage queue and intermodal chassis shortage delaying discharge of container MSKU-8839210.",
      evidence: "Maersk Line AIS tracking update and terminal gate hold advisory."
    },
    {
      title: "WH-MAIN Bay C-12 Forklift Mast Failure & Pallet Crush",
      type: "Warehouse Incident",
      supplier: "SUP-004",
      shipment: "",
      sku: "SKU-3150",
      location: "Central Logistics Hub - Chicago",
      delay: 18,
      severity: "Critical",
      quantity: 150,
      description: "Forklift cable snap during cross-dock staging destroying 150 units of industrial lithium battery packs.",
      evidence: "Warehouse Incident Report #IR-2026-0905-01 signed by D. Miller."
    },
    {
      title: "Hsinchu Fab 12 Wafer Stepper Allocation Shortage",
      type: "Inventory Shortage",
      supplier: "SUP-002",
      shipment: "SH-1008",
      sku: "SKU-1012",
      location: "Hsinchu Science Park, Taiwan",
      delay: 12,
      severity: "High",
      quantity: 60,
      description: "TSMC quota reduction on 64K LE FPGA SoM exhausting available inventory across western depots.",
      evidence: "TSMC Fab 12 quota revision notice #TSMC-Q3-881."
    },
    {
      title: "I-80 Freight Corridor Bridge Structural Closure",
      type: "Transportation Disruption",
      supplier: "SUP-007",
      shipment: "SH-1019",
      sku: "SKU-1020",
      location: "Denver to Dallas Corridor (I-80/I-25)",
      delay: 6,
      severity: "Medium",
      quantity: 300,
      description: "DOT emergency closure of interstate freight bridge causing truck rerouting delays.",
      evidence: "DOT Freight Alert #DOT-WY-991."
    }
  ];

  const p = presets[presetIndex - 1];
  if (!p) return;

  document.getElementById('inputFormTitle').value = p.title;
  document.getElementById('inputFormType').value = p.type;
  document.getElementById('inputFormSupplier').value = p.supplier;
  document.getElementById('inputFormShipment').value = p.shipment;
  document.getElementById('inputFormSKU').value = p.sku;
  document.getElementById('inputFormLocation').value = p.location;
  document.getElementById('inputFormDelay').value = p.delay;
  document.getElementById('inputFormSeverity').value = p.severity;
  document.getElementById('inputFormQuantity').value = p.quantity;
  document.getElementById('inputFormDescription').value = p.description;
  document.getElementById('inputFormEvidence').value = p.evidence;

  showToast(`Loaded scenario preset #${presetIndex}: ${p.title}`, 'info');
}

function extractFromNoticeText() {
  const text = document.getElementById('rawNoticeTextarea')?.value.trim();
  if (!text) {
    showToast('Please paste a disruption notice text first.', 'error');
    return;
  }

  // Deterministic rule-based entity extractor
  let matchedSupplier = '';
  let matchedShipment = '';
  let matchedSKU = '';
  let delay = 7;
  let severity = 'Medium';

  if (text.includes('Apex') || text.includes('SUP-001') || text.includes('APX')) {
    matchedSupplier = 'SUP-001';
    matchedShipment = 'SH-8921';
    matchedSKU = 'SKU-1049';
    severity = 'Critical';
    delay = 14;
  } else if (text.includes('TSMC') || text.includes('SUP-002') || text.includes('MC-320') || text.includes('SH-7714')) {
    matchedSupplier = 'SUP-002';
    matchedShipment = 'SH-7714';
    matchedSKU = 'SKU-2088';
    severity = 'High';
    delay = 10;
  } else if (text.includes('Nordic') || text.includes('SUP-004') || text.includes('BAT-4400') || text.includes('forklift')) {
    matchedSupplier = 'SUP-004';
    matchedSKU = 'SKU-3150';
    severity = 'Critical';
    delay = 18;
  }

  // Delay extraction regex e.g. "delay of 5 days", "14 days", "delayed by 10 calendar days"
  const delayMatch = text.match(/(\d+)\s*(?:calendar\s*)?(?:business\s*)?days/i);
  if (delayMatch) {
    delay = parseInt(delayMatch[1], 10);
  }

  document.getElementById('inputFormTitle').value = `Notice Ingest: ${text.slice(0, 45)}...`;
  document.getElementById('inputFormDescription').value = text;
  document.getElementById('inputFormDelay').value = delay;
  document.getElementById('inputFormSeverity').value = severity;
  if (matchedSupplier) document.getElementById('inputFormSupplier').value = matchedSupplier;
  if (matchedShipment) document.getElementById('inputFormShipment').value = matchedShipment;
  if (matchedSKU) document.getElementById('inputFormSKU').value = matchedSKU;

  showToast('Entities extracted successfully! Confirm details below.', 'success');
}

async function handleCreateDisruptionSubmit(e) {
  e.preventDefault();

  if (state.activeUser.role === 'Viewer') {
    showToast('Role "Viewer" has read-only access. Switch role in top right menu to report incidents.', 'error');
    return false;
  }

  const payload = {
    title: document.getElementById('inputFormTitle').value.trim(),
    disruption_type: document.getElementById('inputFormType').value,
    supplier_id: document.getElementById('inputFormSupplier').value || null,
    shipment_id: document.getElementById('inputFormShipment').value || null,
    sku_id: document.getElementById('inputFormSKU').value || null,
    location: document.getElementById('inputFormLocation').value.trim() || 'Central Facility',
    delay_days: parseInt(document.getElementById('inputFormDelay').value, 10),
    severity: document.getElementById('inputFormSeverity').value,
    quantity_affected: parseInt(document.getElementById('inputFormQuantity').value, 10) || 0,
    description: document.getElementById('inputFormDescription').value.trim(),
    evidence: document.getElementById('inputFormEvidence').value.trim()
  };

  try {
    const res = await fetchAPI('/disruptions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const newId = res.disruption.disruption_id;
    showToast(`Disruption ${newId} logged. Triggering deterministic impact simulation...`, 'success');

    // Trigger analysis
    await fetchAPI(`/disruptions/${newId}/analyze`, { method: 'POST' });

    // Open Impact view
    state.selectedDisruptionId = newId;
    navigateTo('impact-analysis');
  } catch (err) {
    showToast(`Failed to create disruption: ${err.message}`, 'error');
  }
  return false;
}

// ============================================================================
// 5. Impact Analysis View (The Core Decision Engine)
// ============================================================================
async function initImpactAnalysisView() {
  const selector = document.getElementById('impactDisruptionSelector');
  if (!selector) return;

  const disruptions = await fetchAPI('/disruptions');
  selector.innerHTML = '';
  disruptions.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.disruption_id;
    opt.textContent = `${d.disruption_id} - ${d.title} (${d.severity})`;
    if (d.disruption_id === state.selectedDisruptionId) opt.selected = true;
    selector.appendChild(opt);
  });

  const activeId = state.selectedDisruptionId || (disruptions[0] ? disruptions[0].disruption_id : null);
  if (activeId) {
    state.selectedDisruptionId = activeId;
    await loadImpactAnalysis(activeId);
  }
}

async function loadImpactAnalysis(disruptionId) {
  state.selectedDisruptionId = disruptionId;
  const impact = await fetchAPI(`/disruptions/${disruptionId}/impact`);

  // Section 1: Summary
  document.getElementById('impactSummaryTitle').textContent = impact.summary.title;
  document.getElementById('impactSummaryType').textContent = impact.summary.type;
  document.getElementById('impactSummaryLocation').textContent = impact.summary.location;
  document.getElementById('impactSummaryDuration').textContent = `${impact.summary.duration_days} Days Delay`;
  document.getElementById('impactSummaryUnknowns').textContent = impact.summary.unknown_factors;
  
  const badge = document.getElementById('impactSummarySeverityBadge');
  if (badge) {
    badge.className = `${getSeverityBadgeClass(impact.summary.severity)} px-2.5 py-0.5 rounded-full text-xs font-bold`;
    badge.textContent = impact.summary.severity;
  }

  // Section 2: Supplier Impact
  const supContainer = document.getElementById('impactSupplierContainer');
  if (supContainer) {
    supContainer.innerHTML = '';
    const s = impact.supplier_impact.supplier;
    if (s) {
      supContainer.innerHTML = `
        <div class="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div class="flex justify-between items-center">
            <strong class="text-sm font-bold text-slate-900 dark:text-white">${escapeHTML(s.name)}</strong>
            <span class="font-mono text-emerald-600 font-bold">${Math.round(s.reliability_score * 100)}% Reliability</span>
          </div>
          <p class="text-slate-500">Location: ${s.location} • Contact: ${s.contact_email}</p>
          <div class="flex items-center space-x-2 text-[11px]">
            <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
              Air Expedite: ${s.expedite_available ? 'Available (1.45x Multiplier)' : 'Not Supported'}
            </span>
            <span class="px-2 py-0.5 rounded ${impact.supplier_impact.is_sole_source ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'} font-semibold">
              ${impact.supplier_impact.is_sole_source ? 'Sole Source Dependency' : 'Multiple Suppliers Available'}
            </span>
          </div>
        </div>

        <div class="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <strong class="block font-bold text-slate-700 dark:text-slate-300">Qualified Alternative Suppliers in Database:</strong>
          ${impact.supplier_impact.alternative_suppliers.length > 0 ? `
            <div class="space-y-1.5">
              ${impact.supplier_impact.alternative_suppliers.map(alt => `
                <div class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span class="font-bold">${alt.name} (${alt.supplier_id})</span>
                  <span class="text-emerald-600 font-mono text-[11px] font-bold">${Math.round(alt.reliability_score * 100)}% score</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-slate-400">No alternate supplier configured for this commodity.</p>'}
        </div>
      `;
    } else {
      supContainer.innerHTML = `<div class="col-span-2 text-slate-400">Internal warehouse or transit incident without direct external supplier fault.</div>`;
    }
  }

  // Section 3: Inventory Impact
  const invBody = document.getElementById('impactInventoryTableBody');
  if (invBody) {
    invBody.innerHTML = '';
    impact.inventory_impact.forEach(inv => {
      const isShortage = inv.available === 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-bold">${inv.warehouse_id} (${inv.warehouse_name})</td>
        <td class="font-mono text-indigo-600 font-bold">${inv.sku_id}</td>
        <td>${inv.on_hand}</td>
        <td>${inv.allocated}</td>
        <td>${inv.reserved_safety}</td>
        <td class="font-bold ${isShortage ? 'text-red-600' : 'text-slate-900 dark:text-white'}">${inv.available}</td>
        <td>
          <span class="${isShortage ? 'badge-critical' : 'badge-success'} px-2 py-0.5 rounded-full text-[10px] font-bold">
            ${isShortage ? 'Stockout Deficit' : 'Buffer Sufficient'}
          </span>
        </td>
      `;
      invBody.appendChild(tr);
    });
  }

  // Section 4: Shipment Impact
  const shipContainer = document.getElementById('impactShipmentContainer');
  if (shipContainer) {
    const sh = impact.shipment_impact;
    if (sh) {
      shipContainer.innerHTML = `
        <div class="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <strong class="text-indigo-600 font-bold font-mono text-sm">${sh.shipment_id}</strong>
              <span class="text-slate-500 ml-2">PO: ${sh.po_number} • Carrier: ${sh.carrier_name}</span>
            </div>
            <span class="badge-high px-2 py-0.5 rounded text-[10px] font-bold">In-Transit Delay</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><span class="text-slate-400 block">Origin:</span><strong>${sh.origin}</strong></div>
            <div><span class="text-slate-400 block">Destination:</span><strong>${sh.destination_warehouse}</strong></div>
            <div><span class="text-slate-400 block">Scheduled ETA:</span><strong>${sh.scheduled_arrival_date}</strong></div>
            <div><span class="text-slate-400 block">Air Expedite Option:</span><strong>${sh.expedite_air_available ? `Yes ($${sh.expedite_air_cost})` : 'No'}</strong></div>
          </div>
        </div>
      `;
    } else {
      shipContainer.innerHTML = `<p class="text-slate-400">No direct inbound carrier consignment linked to this incident.</p>`;
    }
  }

  // Section 5: Customer Orders Impact
  const ordBody = document.getElementById('impactOrdersTableBody');
  let totalPenalty = 0;
  if (ordBody) {
    ordBody.innerHTML = '';
    if (impact.affected_orders.length === 0) {
      ordBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-emerald-600 font-bold">✓ Zero customer delivery commitments impacted!</td></tr>`;
    } else {
      impact.affected_orders.forEach(o => {
        const item = o.items[0] || {};
        const deficit = Math.max(0, (item.quantity_demanded || 0) - (item.quantity_allocated || 0));
        const penaltyExposure = (o.sla_penalty_per_day || 0) * 14;
        totalPenalty += penaltyExposure;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="font-mono font-bold text-indigo-600">${o.order_id}</td>
          <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(o.customer_name)}</td>
          <td><span class="${getTierBadgeClass(o.customer_tier)} px-2 py-0.5 rounded text-[10px] font-bold">${o.customer_tier}</span></td>
          <td>${item.quantity_demanded || 0}</td>
          <td>${o.promise_date}</td>
          <td class="font-mono text-red-600 font-bold">$${o.sla_penalty_per_day}/day</td>
          <td class="font-bold text-red-600">${deficit}</td>
          <td>+14 Days</td>
          <td><span class="badge-critical px-2 py-0.5 rounded-full text-[10px] font-bold">Critical SLA Threat</span></td>
        `;
        ordBody.appendChild(tr);
      });
    }
  }
  const exposureBadge = document.getElementById('impactOrdersExposureBadge');
  if (exposureBadge) {
    exposureBadge.textContent = `$${totalPenalty.toLocaleString()} Potential SLA Exposure`;
  }

  // Section 6: Overall Narrative & Citations
  const narrative = document.getElementById('impactOverallNarrative');
  if (narrative) {
    narrative.textContent = `Incident ${impact.summary.disruption_id} (${impact.summary.title}) directly impacts inbound delivery schedules. With 0 units of safety buffer available in the primary Chicago facility, customer orders for ${impact.affected_orders.map(o => o.customer_name).join(', ') || 'downstream accounts'} cannot be fulfilled by promised dates without intervention. Projected delivery slip is 14 days unless air freight charter or inter-depot stock transfers from Reno or Dallas are authorized.`;
  }

  const citationsList = document.getElementById('impactCitationsList');
  if (citationsList) {
    citationsList.innerHTML = '';
    impact.evidence_citations.forEach(c => {
      const li = document.createElement('li');
      li.textContent = `• ${c}`;
      citationsList.appendChild(li);
    });
  }
}

// ============================================================================
// 6. Explainable Risk Assessment View
// ============================================================================
async function loadRiskAssessmentView() {
  // Uses transparent evaluation rules
  const disr = state.disruptions[0];
  if (!disr) return;
  const overallBadge = document.getElementById('riskOverallBadge');
  if (overallBadge) {
    overallBadge.textContent = `${disr.severity} Risk Level`;
    overallBadge.className = `${getSeverityBadgeClass(disr.severity)} text-base font-black px-4 py-1 rounded-xl`;
  }
}

// ============================================================================
// 7. Recommended Actions View
// ============================================================================
async function loadRecommendationsData() {
  const recs = await fetchAPI('/disruptions/DISR-2026-001/recommendations').catch(() => []);
  state.recommendations = recs;
  renderRecommendationsList(recs);
}

function filterRecommendationsList(status) {
  if (status === 'All') {
    renderRecommendationsList(state.recommendations);
  } else {
    renderRecommendationsList(state.recommendations.filter(r => r.status === status));
  }
}

function renderRecommendationsList(recs) {
  const container = document.getElementById('recommendationsCardsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (recs.length === 0) {
    container.innerHTML = `<div class="col-span-2 text-center py-8 text-slate-400">No action plans match the selected status filter.</div>`;
    return;
  }

  recs.forEach(r => {
    const card = document.createElement('div');
    card.className = 'enterprise-card p-5 space-y-3.5 flex flex-col justify-between';
    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="badge-critical px-2.5 py-0.5 rounded text-[10px] font-bold">Priority ${r.priority}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Accepted' ? 'badge-success' : (r.status === 'Rejected' ? 'badge-critical' : 'badge-low')}">
            ${r.status}
          </span>
        </div>
        
        <h3 class="font-bold text-sm text-slate-900 dark:text-white">${escapeHTML(r.action)}</h3>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHTML(r.reason)}</p>

        <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
          <div><strong class="text-slate-500">Supporting Evidence:</strong> <span class="text-slate-700 dark:text-slate-300">${escapeHTML(r.evidence)}</span></div>
          <div><strong class="text-emerald-600">Expected Benefit:</strong> <span>${escapeHTML(r.expected_benefit)}</span></div>
          <div><strong class="text-slate-500">Responsible Role:</strong> <span>${r.responsible_role}</span></div>
          ${r.assigned_to ? `<div><strong class="text-indigo-600">Assigned To:</strong> <span>${r.assigned_to}</span></div>` : ''}
          ${r.rejection_reason ? `<div class="text-red-600"><strong>Rejection Reason:</strong> <span>${escapeHTML(r.rejection_reason)}</span></div>` : ''}
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span class="text-[11px] text-slate-400">Advisory Action</span>
        <div class="flex items-center space-x-2">
          ${r.status !== 'Accepted' && r.status !== 'Completed' ? `
            <button onclick="acceptRecommendation('${r.recommendation_id}')" class="btn-primary text-xs px-3 py-1.5 cursor-pointer">
              ✓ Accept
            </button>
            <button onclick="openRejectModal('${r.recommendation_id}')" class="btn-secondary text-xs px-3 py-1.5 text-red-600 cursor-pointer">
              ✕ Reject
            </button>
          ` : `
            <span class="text-xs text-emerald-600 font-bold">Action Authorized</span>
          `}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function acceptRecommendation(recId) {
  if (state.activeUser.role === 'Viewer') {
    showToast('Role "Viewer" cannot accept action plans.', 'error');
    return;
  }

  try {
    await fetchAPI(`/recommendations/${recId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Accepted',
        assigned_to: state.activeUser.full_name,
        notes: `Accepted by ${state.activeUser.full_name} (${state.activeUser.role})`
      })
    });
    showToast(`Recommendation ${recId} accepted and assigned.`, 'success');
    await loadRecommendationsData();
  } catch (err) {
    showToast(`Error accepting action: ${err.message}`, 'error');
  }
}

function openRejectModal(recId) {
  if (state.activeUser.role === 'Viewer') {
    showToast('Role "Viewer" cannot reject action plans.', 'error');
    return;
  }
  document.getElementById('rejectRecId').value = recId;
  document.getElementById('rejectReasonInput').value = '';
  document.getElementById('rejectModal').classList.remove('hidden');
}

function closeRejectModal() {
  document.getElementById('rejectModal').classList.add('hidden');
}

async function confirmRejectRecommendation() {
  const recId = document.getElementById('rejectRecId').value;
  const reason = document.getElementById('rejectReasonInput').value.trim();
  if (!reason) {
    showToast('Please provide an operational rejection reason.', 'error');
    return;
  }

  try {
    await fetchAPI(`/recommendations/${recId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Rejected',
        rejection_reason: reason
      })
    });
    closeRejectModal();
    showToast(`Recommendation ${recId} rejected.`, 'info');
    await loadRecommendationsData();
  } catch (err) {
    showToast(`Error rejecting action: ${err.message}`, 'error');
  }
}

// ============================================================================
// 8. Suppliers Directory View
// ============================================================================
async function loadSuppliersData() {
  const suppliers = await fetchAPI('/suppliers');
  state.suppliers = suppliers;
  const tbody = document.getElementById('suppliersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  suppliers.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono font-bold text-indigo-600">${s.supplier_id}</td>
      <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.location)}</td>
      <td>${escapeHTML(s.contact_email)}</td>
      <td><span class="font-mono font-bold">${Math.round(s.reliability_score * 100)}%</span></td>
      <td>${s.expedite_available ? '<span class="text-emerald-600 font-bold">✓ Yes</span>' : '<span class="text-slate-400">No</span>'}</td>
      <td><span class="badge-success px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span></td>
      <td>
        <button onclick="viewSupplierDetails('${s.supplier_id}')" class="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View Details</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function viewSupplierDetails(supplierId) {
  const detail = await fetchAPI(`/suppliers/${supplierId}`);
  showToast(`Supplier: ${detail.supplier.name} • Active Shipments: ${detail.active_shipments.length}`, 'info');
}

function openAddSupplierModal() {
  showToast('Add Supplier form ready.', 'info');
}

// ============================================================================
// 9. Inventory Management View
// ============================================================================
async function loadInventoryData() {
  const wh = document.getElementById('inventoryWarehouseFilter')?.value || 'All';
  const risk = document.getElementById('inventoryRiskFilter')?.value || 'All';

  const params = new URLSearchParams();
  if (wh !== 'All') params.append('warehouse_id', wh);
  if (risk !== 'All') params.append('risk_status', risk);

  const inventory = await fetchAPI(`/inventory?${params.toString()}`);
  state.inventory = inventory;

  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (inventory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-6 text-slate-400">No inventory matching filters.</td></tr>`;
    return;
  }

  inventory.forEach(inv => {
    const isShortage = inv.stock_status === 'Shortage';
    const isLow = inv.stock_status === 'Low Stock';
    const statusClass = isShortage ? 'badge-critical' : (isLow ? 'badge-medium' : 'badge-success');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-bold">${inv.warehouse_id}</td>
      <td class="font-mono font-bold text-indigo-600">${inv.sku_id}</td>
      <td class="text-slate-900 dark:text-white">${escapeHTML(inv.product_name)}</td>
      <td class="font-mono text-slate-500">${inv.location_bin}</td>
      <td class="font-bold">${inv.on_hand}</td>
      <td>${inv.allocated}</td>
      <td>${inv.reserved_safety}</td>
      <td class="font-bold ${isShortage ? 'text-red-600' : 'text-slate-900 dark:text-white'}">${inv.available}</td>
      <td><span class="${statusClass} px-2 py-0.5 rounded-full text-[10px] font-bold">${inv.stock_status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================================
// 10. Shipment Tracking View
// ============================================================================
async function loadShipmentsData() {
  const shipments = await fetchAPI('/shipments');
  state.shipments = shipments;

  const tbody = document.getElementById('shipmentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  shipments.forEach(s => {
    const isDelayed = s.status === 'delayed' || s.revised_arrival_date !== null;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono font-bold text-indigo-600">${s.shipment_id}</td>
      <td class="font-mono">${s.po_number}</td>
      <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(s.supplier_name || s.supplier_id)}</td>
      <td>
        <div>${s.carrier_name}</div>
        <div class="text-[10px] font-mono text-slate-400">${s.tracking_number}</div>
      </td>
      <td>${s.origin}</td>
      <td>${s.destination_warehouse}</td>
      <td>${s.scheduled_arrival_date}</td>
      <td class="${isDelayed ? 'text-red-600 font-bold' : ''}">${s.revised_arrival_date || '--'}</td>
      <td>
        <span class="${isDelayed ? 'badge-high' : 'badge-low'} px-2 py-0.5 rounded-full text-[10px] font-bold">
          ${s.status}
        </span>
      </td>
      <td>
        <button onclick="viewShipmentTimeline('${s.shipment_id}')" class="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">Track Events</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function viewShipmentTimeline(shipmentId) {
  const detail = await fetchAPI(`/shipments/${shipmentId}`);
  const events = detail.timeline.map(t => `${t.status}: ${t.event} (${t.location} - ${t.date})`).join('\n');
  showToast(`Shipment ${shipmentId} Timeline:\n${events}`, 'info');
}

// ============================================================================
// 11. Customer Orders View
// ============================================================================
async function loadCustomerOrdersData() {
  const tier = document.getElementById('ordersTierFilter')?.value || 'All';
  const params = new URLSearchParams();
  if (tier !== 'All') params.append('tier', tier);

  const orders = await fetchAPI(`/orders?${params.toString()}`);
  state.customerOrders = orders;

  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  orders.forEach(o => {
    const isAffected = o.is_affected_by_disruption;
    const tr = document.createElement('tr');
    if (isAffected) tr.className = 'bg-amber-50/40 dark:bg-amber-950/20';

    tr.innerHTML = `
      <td class="font-mono font-bold text-indigo-600">${o.order_id}</td>
      <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(o.customer_name)}</td>
      <td><span class="${getTierBadgeClass(o.customer_tier)} px-2 py-0.5 rounded text-[10px] font-bold">${o.customer_tier}</span></td>
      <td>${o.destination_city}</td>
      <td>${o.promise_date}</td>
      <td class="font-mono ${o.sla_penalty_per_day > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}">$${o.sla_penalty_per_day}/day</td>
      <td><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">${o.status}</span></td>
      <td>
        <span class="${isAffected ? 'badge-critical' : 'badge-low'} px-2 py-0.5 rounded-full text-[10px] font-bold">
          ${isAffected ? 'At Risk' : 'Healthy'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================================
// 12. Resolution Center View
// ============================================================================
async function loadResolutionCenterData() {
  const [disruptions, audit] = await Promise.all([
    fetchAPI('/disruptions'),
    fetchAPI('/system/audit')
  ]);

  const openIncidents = disruptions.filter(d => d.status !== 'Resolved');
  const resolvedIncidents = disruptions.filter(d => d.status === 'Resolved');

  document.getElementById('resOpenCount').textContent = openIncidents.length;
  document.getElementById('resResolvedCount').textContent = resolvedIncidents.length;
  document.getElementById('resAuditCount').textContent = audit.audit_entries.length;

  const list = document.getElementById('resolutionIncidentsList');
  if (!list) return;
  list.innerHTML = '';

  if (openIncidents.length === 0) {
    list.innerHTML = `<p class="text-emerald-600 font-bold">✓ All operational incidents have been resolved.</p>`;
    return;
  }

  openIncidents.forEach(inc => {
    const div = document.createElement('div');
    div.className = 'p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3';
    div.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="font-mono font-bold text-indigo-600">${inc.disruption_id}</span>
          <span class="${getSeverityBadgeClass(inc.severity)} px-2 py-0.5 rounded text-[10px] font-bold">${inc.severity}</span>
          <span class="text-xs text-slate-400">• ${inc.disruption_type}</span>
        </div>
        <h4 class="font-bold text-xs text-slate-900 dark:text-white">${escapeHTML(inc.title)}</h4>
        <p class="text-[11px] text-slate-500">${escapeHTML(inc.description)}</p>
      </div>
      <button onclick="openResolveModal('${inc.disruption_id}')" class="btn-primary text-xs px-4 py-2 self-start sm:self-auto cursor-pointer">
        Sign-Off & Resolve ➔
      </button>
    `;
    list.appendChild(div);
  });
}

function openResolveModal(disruptionId) {
  if (state.activeUser.role === 'Viewer') {
    showToast('Role "Viewer" does not have sign-off permission.', 'error');
    return;
  }
  document.getElementById('resolveDisruptionId').value = disruptionId;
  document.getElementById('resolveNotesTextarea').value = '';
  document.getElementById('resolveModal').classList.remove('hidden');
}

function closeResolveModal() {
  document.getElementById('resolveModal').classList.add('hidden');
}

async function handleResolveFormSubmit(e) {
  e.preventDefault();
  const disrId = document.getElementById('resolveDisruptionId').value;
  const method = document.getElementById('resolveMethodSelect').value;
  const notes = document.getElementById('resolveNotesTextarea').value.trim();

  try {
    await fetchAPI(`/disruptions/${disrId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        resolution_method: method,
        resolution_notes: notes
      })
    });
    closeResolveModal();
    showToast(`Disruption ${disrId} marked resolved via ${method}.`, 'success');
    await loadResolutionCenterData();
    await refreshNotifications();
  } catch (err) {
    showToast(`Failed to resolve incident: ${err.message}`, 'error');
  }
  return false;
}

// ============================================================================
// 13. Reports & Analytics View
// ============================================================================
async function loadReportsData() {
  const [summary, disruptions] = await Promise.all([
    fetchAPI('/reports/summary?days=30'),
    fetchAPI('/disruptions')
  ]);

  document.getElementById('repTotalDisruptions').textContent = summary.total_disruptions;
  document.getElementById('repAvgResolution').textContent = `${summary.average_resolution_days} Days`;
  document.getElementById('repPenaltiesPrevented').textContent = `$${summary.total_sla_penalties_prevented.toLocaleString()}`;
  document.getElementById('repCompletionRate').textContent = `${summary.action_completion_rate}%`;

  const tbody = document.getElementById('reportsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  disruptions.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono font-bold">${d.disruption_id}</td>
      <td class="font-bold text-slate-900 dark:text-white">${escapeHTML(d.title)}</td>
      <td>${d.disruption_type}</td>
      <td><span class="${getSeverityBadgeClass(d.severity)} px-2 py-0.5 rounded text-[10px] font-bold">${d.severity}</span></td>
      <td>${d.delay_days} days</td>
      <td class="text-slate-500">${formatDate(d.reported_at)}</td>
      <td><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">${d.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function downloadReportsCSV() {
  window.location.href = '/api/reports/export';
}

// ============================================================================
// 14. Notifications System
// ============================================================================
async function refreshNotifications() {
  try {
    const notifs = await fetchAPI('/notifications');
    state.notifications = notifs;
    const unreadCount = notifs.filter(n => !n.is_read).length;

    const topBadge = document.getElementById('topNotifBadge');
    if (topBadge) {
      topBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    const drawerBadge = document.getElementById('drawerUnreadBadge');
    if (drawerBadge) {
      drawerBadge.textContent = unreadCount;
    }
  } catch (err) {
    console.warn('Could not refresh notifications');
  }
}

function renderNotifications() {
  const container = document.getElementById('notifListContainer');
  if (!container) return;
  container.innerHTML = '';

  if (state.notifications.length === 0) {
    container.innerHTML = `<p class="text-slate-400 text-center py-6 text-xs">No notifications</p>`;
    return;
  }

  state.notifications.forEach(n => {
    const div = document.createElement('div');
    div.className = `p-3 rounded-xl border text-xs space-y-1 transition ${n.is_read ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800' : 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'}`;
    div.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900 dark:text-white">${escapeHTML(n.title)}</span>
        <span class="${getSeverityBadgeClass(n.severity)} text-[9px] font-bold px-1.5 py-0.5 rounded">${n.severity}</span>
      </div>
      <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHTML(n.message)}</p>
      <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
        <span>${formatDate(n.timestamp)}</span>
        ${!n.is_read ? `<button onclick="markNotificationRead('${n.notification_id}')" class="text-indigo-600 font-bold hover:underline cursor-pointer">Mark read</button>` : '<span>Read</span>'}
      </div>
    `;
    container.appendChild(div);
  });
}

async function markNotificationRead(notifId) {
  await fetchAPI(`/notifications/${notifId}/read`, { method: 'PATCH' });
  await refreshNotifications();
  renderNotifications();
}

async function markAllNotificationsRead() {
  await fetchAPI('/notifications/mark-all-read', { method: 'POST' });
  await refreshNotifications();
  renderNotifications();
}

// ============================================================================
// 15. Settings, Personas & Theme
// ============================================================================
function switchUserRole(newRole) {
  state.activeUser.role = newRole;

  // Update UI indicators
  document.getElementById('topRole').textContent = newRole;
  document.getElementById('menuFullName').textContent = `${state.activeUser.full_name} (${newRole})`;
  document.getElementById('settingProfileRole').value = newRole;

  ['Admin', 'Manager', 'Analyst', 'Viewer'].forEach(r => {
    const el = document.getElementById(`roleIndicator${r}`);
    if (el) el.classList.toggle('hidden', r !== newRole && (newRole !== 'Supply Chain Manager' || r !== 'Manager'));
  });

  showToast(`Switched active persona to ${newRole}. Permissions updated.`, 'info');
}

function saveUserProfile() {
  const name = document.getElementById('settingProfileName').value.trim();
  const email = document.getElementById('settingProfileEmail').value.trim();
  const dept = document.getElementById('settingProfileDept').value.trim();

  state.activeUser.full_name = name;
  state.activeUser.email = email;
  state.activeUser.department = dept;

  document.getElementById('topUsername').textContent = name;
  document.getElementById('menuFullName').textContent = `${name} (${state.activeUser.role})`;
  document.getElementById('menuEmail').textContent = email;

  showToast('Profile updated successfully.', 'success');
}

async function resetSystemState() {
  if (confirm('Are you sure you want to reset all database records back to the pristine seed state?')) {
    try {
      await fetchAPI('/system/reset', { method: 'POST' });
      showToast('Database reset to pristine seed state.', 'success');
      await loadReferenceData();
      await navigateTo('dashboard');
    } catch (err) {
      showToast('Error resetting database.', 'error');
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('chainsolve_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleIcon').textContent = isDark ? '☀️' : '🌙';
}

// ============================================================================
// Utilities
// ============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'error' ? 'bg-red-600' : (type === 'success' ? 'bg-emerald-600' : 'bg-slate-900');
  toast.className = `${bg} text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 transition-all transform duration-300 pointer-events-auto`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : (type === 'success' ? '✓' : 'ℹ️')}</span><span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function getSeverityBadgeClass(sev) {
  switch ((sev || '').toLowerCase()) {
    case 'critical': return 'badge-critical';
    case 'high': return 'badge-high';
    case 'medium': return 'badge-medium';
    case 'low': return 'badge-low';
    default: return 'badge-low';
  }
}

function getTierBadgeClass(tier) {
  switch ((tier || '').toLowerCase()) {
    case 'platinum': return 'badge-critical';
    case 'gold': return 'badge-high';
    case 'standard': return 'badge-low';
    default: return 'badge-low';
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
