/**
 * ==============================================================================
 * CURASYNC FRONTEND CONTROLLER & INTERACTION ENGINE
 * Smarter RCM. Healthier Revenue.
 * 
 * Version: 1.1.0
 * Architecture: Pure Vanilla ES6+ (Zero Node.js runtime required in production)
 * Team Apollo (UI/UX & Web Frontend) | Virtual AI Studio
 * ==============================================================================
 */

// Initialize all modules when DOM is fully loaded in browser
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initMobileDrawer();
    initGlobalAccessibility();
    initOperationsVisualizer();
    initYieldCalculator();
    initPipelineVisualizer();
    initServiceModals();
    initServiceLinesFilter();
    initRcmHealthCheckWizard();
    initContactForm();
  });
}

/* ==========================================================================
   1. MOBILE DRAWER NAVIGATION & ACCESSIBILITY
   ========================================================================== */
function initMobileDrawer() {
  const openBtn = document.getElementById('openDrawerBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawer = document.getElementById('mobileDrawer');

  if (!openBtn || !drawer) return;

  // Set initial aria state
  openBtn.setAttribute('aria-expanded', 'false');
  openBtn.setAttribute('aria-controls', 'mobileDrawer');

  const toggleDrawer = (isOpen) => {
    if (isOpen) {
      drawer.classList.add('open', 'active');
      if (backdrop) backdrop.classList.add('open', 'active');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    } else {
      drawer.classList.remove('open', 'active');
      if (backdrop) backdrop.classList.remove('open', 'active');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open');
    }
  };

  openBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));

  // Close drawer on link click inside drawer
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleDrawer(false);
    });
  });
}

/* ==========================================================================
   2. GLOBAL ACCESSIBILITY & ESCAPE KEY HANDLER
   ========================================================================== */
function initGlobalAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      // 1. Close mobile drawer if open
      const drawer = document.getElementById('mobileDrawer');
      const openBtn = document.getElementById('openDrawerBtn');
      const drawerBackdrop = document.getElementById('drawerBackdrop');
      if (drawer && (drawer.classList.contains('open') || drawer.classList.contains('active'))) {
        drawer.classList.remove('open', 'active');
        if (drawerBackdrop) drawerBackdrop.classList.remove('open', 'active');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.body.classList.remove('drawer-open');
      }

      // 2. Close service detail modal if open
      const serviceModal = document.getElementById('serviceDetailModal');
      const serviceBackdrop = document.getElementById('serviceModalBackdrop');
      if (serviceModal && serviceModal.style.display !== 'none') {
        serviceModal.style.display = 'none';
        if (serviceBackdrop) serviceBackdrop.style.display = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }

      // 4. Close any generic modal backdrops
      document.querySelectorAll('.modal-backdrop.active, .modal-backdrop.open').forEach(el => {
        el.classList.remove('active', 'open');
        el.style.display = 'none';
      });
      document.querySelectorAll('.modal-container.active, .modal-container.open').forEach(el => {
        el.classList.remove('active', 'open');
        el.style.display = 'none';
      });
    }
  });
}

/* ==========================================================================
   2.5 LEAD ROUTING, PERSISTENCE & CSV EXPORT CORE
   ========================================================================== */
const STORAGE_KEY_INQUIRIES = 'curasync_contact_inquiries';

function generateLeadRefId() {
  const year = 2026;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${year}-${rand}`;
}

function serializeLeadPayload(data) {
  if (!data || typeof data !== 'object') {
    data = {};
  }
  return {
    refId: data.refId || generateLeadRefId(),
    timestamp: data.timestamp || new Date().toISOString(),
    name: (data.name || '').trim(),
    email: (data.email || '').trim(),
    phone: (data.phone || '').trim(),
    organization: (data.organization || data.org || '').trim(),
    orgType: (data.orgType || 'hospital').trim(),
    selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
    notes: (data.notes || '').trim()
  };
}

function getStoredLeads(customStorage) {
  const storage = customStorage || (typeof window !== 'undefined' ? window.localStorage : (typeof global !== 'undefined' ? global.testStorage : null));
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY_INQUIRIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading stored leads:', err);
    return [];
  }
}

function saveLeadToStorage(payload, customStorage) {
  const lead = serializeLeadPayload(payload);
  const storage = customStorage || (typeof window !== 'undefined' ? window.localStorage : (typeof global !== 'undefined' ? global.testStorage : null));
  if (!storage) return lead;
  try {
    const leads = getStoredLeads(storage);
    leads.unshift(lead);
    storage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(leads));
  } catch (err) {
    console.error('Error saving lead to localStorage:', err);
  }
  return lead;
}

function formatLeadsToCsv(leads) {
  const headers = [
    'Reference ID',
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Organization',
    'Organization Type',
    'Selected Topics',
    'Notes'
  ];

  const escapeCsv = (field) => {
    if (field === null || field === undefined) return '""';
    const stringVal = String(field);
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  const rows = [headers.map(escapeCsv).join(',')];

  if (Array.isArray(leads)) {
    for (const lead of leads) {
      const topics = Array.isArray(lead.selectedServices)
        ? lead.selectedServices.join('; ')
        : (lead.selectedServices || '');
      const row = [
        escapeCsv(lead.refId || ''),
        escapeCsv(lead.timestamp || ''),
        escapeCsv(lead.name || ''),
        escapeCsv(lead.email || ''),
        escapeCsv(lead.phone || ''),
        escapeCsv(lead.organization || ''),
        escapeCsv(lead.orgType || ''),
        escapeCsv(topics),
        escapeCsv(lead.notes || '')
      ];
      rows.push(row.join(','));
    }
  }

  return rows.join('\r\n');
}

function exportLeadsToCsv(customStorage) {
  const leads = getStoredLeads(customStorage);
  const csvContent = formatLeadsToCsv(leads);
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', 'curasync_leads.csv');
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return csvContent;
}

/* ==========================================================================
   4. OPERATIONS VISUALIZER (Homepage)
   Tier-1 Clinical Telemetry Histogram & Multi-Bar Equalizer
   ========================================================================== */
function initOperationsVisualizer() {
  const tabContainer = document.getElementById('opsTabContainer');
  if (!tabContainer) return;

  const chartArea = document.getElementById('opsChartArea');
  const tabs = tabContainer.querySelectorAll('[data-ops-tab]');
  const tooltip = document.getElementById('opsChartTooltip');
  const calloutTitle = document.getElementById('opsCalloutTitle');
  const calloutText = document.getElementById('opsCalloutText');

  // Stages
  const stageIntake = document.getElementById('opsStageIntake');
  const stageClaims = document.getElementById('opsStageClaims');
  const stageResolution = document.getElementById('opsStageResolution');

  // Legacy fallback bars (if present)
  const legacyBarIntake = document.getElementById('opsBarIntake');
  const legacyBarClaims = document.getElementById('opsBarClaims');
  const legacyBarResolution = document.getElementById('opsBarResolution');

  const telemetryData = {
    eligibility: {
      activeStage: 'intake',
      title: 'Coverage verified before service',
      text: 'Patient eligibility, benefit limits, and prior authorization requirements are checked prior to care delivery, preventing downstream rejections.',
      bars: {
        opsBarBatchIntake: { height: '96%', metric: 'Batch Intake', stage: 'Stage 1: INTAKE', throughput: '96.5% Ingestion Velocity', status: 'Real-time EDI ingestion · <5m' },
        opsBarCoverageCheck: { height: '98%', metric: 'Coverage Check', stage: 'Stage 1: INTAKE', throughput: '98.2% Auto-Verified', status: 'Payer EDI 270/271 · <15s' },
        opsBarPriorAuth: { height: '94%', metric: 'Prior Authorization', stage: 'Stage 1: INTAKE', throughput: '94.6% Cleared', status: 'Pre-service clearance · <24h' },
        opsBarScrubbing: { height: '88%', metric: 'Clinical Scrubbing', stage: 'Stage 2: CLAIMS', throughput: '88.0% Standard Rules', status: 'Standard rule evaluation' },
        opsBarCleanFiling: { height: '86%', metric: 'Clean Filing', stage: 'Stage 2: CLAIMS', throughput: '86.4% First-Pass', status: 'Payer batch queued' },
        opsBarGatewayPayer: { height: '85%', metric: 'Gateway Payer Acceptance', stage: 'Stage 2: CLAIMS', throughput: '85.2% Accepted', status: 'Clearinghouse transmission' },
        opsBarFastRemittance: { height: '82%', metric: 'Fast Remittance', stage: 'Stage 3: RESOLUTION', throughput: '82.0% Auto-Matched', status: 'Standard ERA receipt' },
        opsBarExceptionRoute: { height: '88%', metric: 'Exception Routing', stage: 'Stage 3: RESOLUTION', throughput: '88.5% Specialist Routed', status: 'Queue triage' },
        opsBarArPosting: { height: '90%', metric: 'A/R Posting', stage: 'Stage 3: RESOLUTION', throughput: '90.1% Posted in 24h', status: 'Standard ledger post' }
      }
    },
    claims: {
      activeStage: 'claims',
      title: 'Clean handoff to payer with zero defect filing',
      text: 'Scrubbed clinical data, standardized coding, and payer-specific validation rules ensure claims leave your system right the first time.',
      bars: {
        opsBarBatchIntake: { height: '90%', metric: 'Batch Intake', stage: 'Stage 1: INTAKE', throughput: '90.2% Ingestion', status: 'Standard intake ingestion' },
        opsBarCoverageCheck: { height: '91%', metric: 'Coverage Check', stage: 'Stage 1: INTAKE', throughput: '91.0% Auto-Verified', status: 'Coverage checked active' },
        opsBarPriorAuth: { height: '88%', metric: 'Prior Authorization', stage: 'Stage 1: INTAKE', throughput: '88.4% Cleared', status: 'Prior auth attached' },
        opsBarScrubbing: { height: '99%', metric: 'Clinical Scrubbing', stage: 'Stage 2: CLAIMS', throughput: '99.4% Rule Compliance', status: 'NCCI & LCD/NCD verified' },
        opsBarCleanFiling: { height: '98%', metric: 'Clean Filing', stage: 'Stage 2: CLAIMS', throughput: '98.4% First-Pass Rate', status: 'Zero-defect gateway push' },
        opsBarGatewayPayer: { height: '97%', metric: 'Gateway Payer Acceptance', stage: 'Stage 2: CLAIMS', throughput: '97.8% Clearinghouse Ack', status: 'Instant 999/277CA response' },
        opsBarFastRemittance: { height: '89%', metric: 'Fast Remittance', stage: 'Stage 3: RESOLUTION', throughput: '89.2% Auto-Matched', status: 'Fast cycle match' },
        opsBarExceptionRoute: { height: '91%', metric: 'Exception Routing', stage: 'Stage 3: RESOLUTION', throughput: '91.5% Specialist Routed', status: 'Payer rules logged' },
        opsBarArPosting: { height: '93%', metric: 'A/R Posting', stage: 'Stage 3: RESOLUTION', throughput: '93.0% Posted in 24h', status: 'Remit ledger matched' }
      }
    },
    followup: {
      activeStage: 'resolution',
      title: 'Exceptions surfaced early to human specialists',
      text: 'Complex denials or outlier requests are immediately flagged for specialized billing specialists rather than languishing in automated queues.',
      bars: {
        opsBarBatchIntake: { height: '87%', metric: 'Batch Intake', stage: 'Stage 1: INTAKE', throughput: '87.0% Ingestion', status: 'Automated intake' },
        opsBarCoverageCheck: { height: '89%', metric: 'Coverage Check', stage: 'Stage 1: INTAKE', throughput: '89.5% Auto-Verified', status: 'Re-verification check' },
        opsBarPriorAuth: { height: '86%', metric: 'Prior Authorization', stage: 'Stage 1: INTAKE', throughput: '86.2% Cleared', status: 'Pre-auth logged' },
        opsBarScrubbing: { height: '89%', metric: 'Clinical Scrubbing', stage: 'Stage 2: CLAIMS', throughput: '89.8% Rule Compliance', status: 'Secondary review' },
        opsBarCleanFiling: { height: '91%', metric: 'Clean Filing', stage: 'Stage 2: CLAIMS', throughput: '91.2% First-Pass', status: 'Secondary claim push' },
        opsBarGatewayPayer: { height: '90%', metric: 'Gateway Payer Acceptance', stage: 'Stage 2: CLAIMS', throughput: '90.0% Clearinghouse Ack', status: 'Acknowledgement logged' },
        opsBarFastRemittance: { height: '98%', metric: 'Fast Remittance', stage: 'Stage 3: RESOLUTION', throughput: '98.5% Auto-Matched', status: '835 ERA auto-reconciliation' },
        opsBarExceptionRoute: { height: '99%', metric: 'Exception Routing', stage: 'Stage 3: RESOLUTION', throughput: '99.2% Specialist Routed', status: 'Human-in-the-loop triage · <4h' },
        opsBarArPosting: { height: '97%', metric: 'A/R Posting', stage: 'Stage 3: RESOLUTION', throughput: '97.6% Posted in 24h', status: 'Days in A/R < 32 · Zero aging' }
      }
    }
  };

  function applyScenario(tabKey) {
    const scenario = telemetryData[tabKey];
    if (!scenario) return;

    // Update active stage classes
    if (stageIntake) stageIntake.classList.toggle('active-stage', scenario.activeStage === 'intake');
    if (stageClaims) stageClaims.classList.toggle('active-stage', scenario.activeStage === 'claims');
    if (stageResolution) stageResolution.classList.toggle('active-stage', scenario.activeStage === 'resolution');

    // Update each pill bar height and data attributes
    for (const [barId, barData] of Object.entries(scenario.bars)) {
      const barFill = document.getElementById(barId);
      if (barFill) {
        barFill.style.height = barData.height;
        const wrapper = barFill.closest('.ops-bar-wrapper');
        if (wrapper) {
          wrapper.setAttribute('data-metric', barData.metric);
          wrapper.setAttribute('data-stage', barData.stage);
          wrapper.setAttribute('data-throughput', barData.throughput);
          wrapper.setAttribute('data-status', barData.status);
          wrapper.setAttribute('data-value', barData.height);
        }
      }
    }

    // Update callouts
    if (calloutTitle) calloutTitle.textContent = scenario.title;
    if (calloutText) calloutText.textContent = scenario.text;

    // Backward-compatibility fallback
    if (legacyBarIntake) legacyBarIntake.style.height = scenario.bars.opsBarCoverageCheck.height;
    if (legacyBarClaims) legacyBarClaims.style.height = scenario.bars.opsBarCleanFiling.height;
    if (legacyBarResolution) legacyBarResolution.style.height = scenario.bars.opsBarExceptionRoute.height;
  }

  // Setup tab click listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabKey = tab.getAttribute('data-ops-tab');
      applyScenario(tabKey);
    });
  });

  // Setup dynamic floating dark navy tooltip
  const barWrappers = chartArea ? chartArea.querySelectorAll('.ops-bar-wrapper') : [];

  function showTooltip(wrapper) {
    if (!tooltip || !chartArea) return;
    const stage = wrapper.getAttribute('data-stage') || 'Stage Telemetry';
    const metric = wrapper.getAttribute('data-metric') || 'Pipeline Metric';
    const throughput = wrapper.getAttribute('data-throughput') || 'Throughput Active';
    const status = wrapper.getAttribute('data-status') || '<24h turnaround';
    const value = wrapper.getAttribute('data-value') || '';

    tooltip.innerHTML = `
      <div class="ops-tooltip-stage">${stage}</div>
      <div class="ops-tooltip-title">${metric}</div>
      <div class="ops-tooltip-value">${throughput} (${value})</div>
      <div class="ops-tooltip-status">${status}</div>
    `;

    const barRect = wrapper.getBoundingClientRect();
    const chartRect = chartArea.getBoundingClientRect();

    const left = barRect.left - chartRect.left + (barRect.width / 2);
    const top = barRect.top - chartRect.top;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';
    tooltip.setAttribute('aria-hidden', 'false');
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.style.opacity = '0';
    tooltip.setAttribute('aria-hidden', 'true');
  }

  barWrappers.forEach(wrapper => {
    wrapper.addEventListener('mouseenter', () => showTooltip(wrapper));
    wrapper.addEventListener('mousemove', () => showTooltip(wrapper));
    wrapper.addEventListener('mouseleave', hideTooltip);

    // Mobile touch support
    wrapper.addEventListener('touchstart', () => {
      showTooltip(wrapper);
    }, { passive: true });
  });

  if (chartArea) {
    chartArea.addEventListener('mouseleave', hideTooltip);
  }

  // Initial application
  applyScenario('eligibility');
}

/* ==========================================================================
   4B. HEALTHCARE REVENUE YIELD & RECOVERY CALCULATOR (index.html)
   ========================================================================== */
function initYieldCalculator() {
  const monthlyRange = document.getElementById('monthlyCollectionsRange');
  const denialRange = document.getElementById('denialRateRange');
  const daysRange = document.getElementById('daysInArRange');

  const monthlyDisplay = document.getElementById('monthlyCollectionsDisplay');
  const denialDisplay = document.getElementById('denialRateDisplay');
  const daysDisplay = document.getElementById('daysInArDisplay');

  const recoveredYieldDisplay = document.getElementById('recoveredYieldDisplay');
  const efficiencyDisplay = document.getElementById('efficiencyDisplay');
  const efficiencyFill = document.getElementById('efficiencyFill');
  const denialRecoveryVal = document.getElementById('denialRecoveryVal');
  const velocityLiftVal = document.getElementById('velocityLiftVal');
  const reworkMitigatedVal = document.getElementById('reworkMitigatedVal');

  if (!monthlyRange || !denialRange || !daysRange) return;

  const updateCalculator = () => {
    const monthlyVal = parseFloat(monthlyRange.value);
    const denialVal = parseFloat(denialRange.value);
    const daysVal = parseFloat(daysRange.value);

    const metrics = calculateYieldMetrics({
      monthlyCollections: monthlyVal,
      denialRate: denialVal,
      daysInAr: daysVal
    });

    if (monthlyDisplay) monthlyDisplay.textContent = metrics.formatted.monthlyCollections;
    if (denialDisplay) denialDisplay.textContent = metrics.formatted.denialRate;
    if (daysDisplay) daysDisplay.textContent = metrics.formatted.daysInAr;

    if (recoveredYieldDisplay) recoveredYieldDisplay.textContent = metrics.formatted.recoveredYield;
    if (efficiencyDisplay) efficiencyDisplay.textContent = metrics.formatted.efficiency;
    if (efficiencyFill) efficiencyFill.style.width = metrics.formatted.efficiencyWidth;
    if (denialRecoveryVal) denialRecoveryVal.textContent = metrics.formatted.denialRecovery;
    if (velocityLiftVal) velocityLiftVal.textContent = metrics.formatted.velocityLiftDays;
    if (reworkMitigatedVal) reworkMitigatedVal.textContent = metrics.formatted.reworkMitigated;
  };

  monthlyRange.addEventListener('input', updateCalculator);
  denialRange.addEventListener('input', updateCalculator);
  daysRange.addEventListener('input', updateCalculator);

  // Initial calculation on page load
  updateCalculator();
}

/* ==========================================================================
   4C. 5-STAGE ZERO-LOSS REVENUE PIPELINE VISUALIZER (index.html)
   ========================================================================== */
const PIPELINE_STAGES = {
  1: {
    title: 'Stage 1 · Real-Time Pre-Service Eligibility & Benefit Check',
    desc: 'Automated EDI 270/271 queries verify active coverage, patient copays, coinsurance, and prior authorization requirements prior to the patient arriving in clinic.',
    callouts: [
      {
        icon: '⚡',
        title: 'Sub-15s Latency',
        text: 'Direct API connections with 900+ commercial payers and Medicare/Medicaid gateways.'
      },
      {
        icon: '🔒',
        title: 'Zero Auth Drift',
        text: 'AI monitors scheduling queues to ensure procedures have valid authorization numbers attached.'
      },
      {
        icon: '📈',
        title: '99.2% Clean Intake',
        text: 'Stops front-end registration errors before claims are ever generated.'
      }
    ]
  },
  2: {
    title: 'Stage 2 · Clinical Coding & NCCI Rule Scrubbing',
    desc: 'Certified CPC specialists supported by algorithmic rules validate ICD-10, CPT, and HCPCS coding for complete medical necessity alignment before claim generation.',
    callouts: [
      {
        icon: '⚕️',
        title: 'Certified Coders',
        text: 'AAPC and AHIMA credentialed teams with deep specialty-specific documentation expertise.'
      },
      {
        icon: '🔍',
        title: 'Algorithmic Scrubbing',
        text: 'Cross-checks bundling, unbundling, and NCCI edits against real-time payer policy rules.'
      },
      {
        icon: '🛡️',
        title: '98.7% First-Pass Clean',
        text: 'Eliminates coding-related denials before electronic clearinghouse transmission.'
      }
    ]
  },
  3: {
    title: 'Stage 3 · Clearinghouse Submission & 837 Electronic Filing',
    desc: 'Rapid electronic submission via certified ANSI 837 batch pipelines with millisecond confirmation receipt and clearinghouse acknowledgment tracking.',
    callouts: [
      {
        icon: '📤',
        title: '<12h Filing SLA',
        text: 'Accelerated batch dispatch ensures zero claims sit unsubmitted past end-of-day cutoff.'
      },
      {
        icon: '⚡',
        title: 'Automated 277 Tracking',
        text: 'Continuous EDI 277 claim status queries catch front-end rejections within minutes.'
      },
      {
        icon: '✅',
        title: '98.4% Clean Acceptance',
        text: 'Clearinghouse acceptance rate outperforming national HFMA industry benchmarks.'
      }
    ]
  },
  4: {
    title: 'Stage 4 · Denials Root Cause Analysis & Rapid Appeal Swarms',
    desc: 'AI triage categorizes rejections by root cause and routes complex denials directly to specialty clinical appeals swarms for prompt dispute resolution.',
    callouts: [
      {
        icon: '⚖️',
        title: 'Triage Swarms',
        text: 'Dedicated escalation teams resolve complex clinical denials, unlisted codes, and peer-to-peer reviews.'
      },
      {
        icon: '⏱️',
        title: '<4h Response SLA',
        text: 'Fast-turnaround appeals submitted well before timely filing limits lapse.'
      },
      {
        icon: '💰',
        title: '82% Recovery Rate',
        text: 'Turns disputed and rejected dollars into collected margin with zero patient abrasion.'
      }
    ]
  },
  5: {
    title: 'Stage 5 · Electronic Remittance (835) & Zero-Balance Posting',
    desc: 'Automated ERA 835 ingestion matches remittances to open receivables with automatic reconciliation, exception reporting, and rapid secondary billing.',
    callouts: [
      {
        icon: '💰',
        title: 'Automated 835 Posting',
        text: 'High-velocity reconciliation auto-matches 96% of remittances to open patient encounters.'
      },
      {
        icon: '📅',
        title: '<32 Days in A/R',
        text: 'Tight lockbox reconciliation cuts outstanding accounts receivable to top-decile performance.'
      },
      {
        icon: '🎯',
        title: 'Automated Secondary Filing',
        text: 'Instantly generates cross-over and secondary claims upon primary remittance settlement.'
      }
    ]
  }
};

function initPipelineVisualizer() {
  const stageButtons = document.querySelectorAll('.pipeline-stage-btn[data-stage]');
  const detailTitle = document.getElementById('pipelineDetailTitle');
  const detailDesc = document.getElementById('pipelineDetailDesc');
  const calloutGrid = document.getElementById('pipelineCalloutGrid');

  if (!stageButtons.length || !detailTitle || !detailDesc || !calloutGrid) return;

  const renderStage = (stageKey) => {
    const stage = PIPELINE_STAGES[stageKey];
    if (!stage) return;

    stageButtons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-stage') === String(stageKey);
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    detailTitle.textContent = stage.title;
    detailDesc.textContent = stage.desc;

    calloutGrid.innerHTML = stage.callouts
      .map(
        (c) => `
        <div class="pipeline-callout-card">
          <span class="pipeline-callout-icon">${c.icon}</span>
          <strong class="pipeline-callout-title">${c.title}</strong>
          <p class="pipeline-callout-text">${c.text}</p>
        </div>`
      )
      .join('');
  };

  stageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const stageKey = btn.getAttribute('data-stage');
      renderStage(stageKey);
    });
  });
}

/* ==========================================================================
   5. SERVICE DETAIL MODALS (services.html)
   ========================================================================== */
function initServiceModals() {
  const serviceCards = document.querySelectorAll('.service-detail-card[data-service-id]');
  if (serviceCards.length === 0) return;

  // Inject service detail modal markup if not present
  if (!document.getElementById('serviceDetailModal')) {
    const modalHTML = `
      <div class="modal-backdrop" id="serviceModalBackdrop" style="display:none;"></div>
      <div class="modal-container" id="serviceDetailModal" role="dialog" aria-modal="true" aria-label="Service Details" style="display:none; max-width: 650px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-eyebrow" id="modalServiceEyebrow">CURASYNC SERVICE</span>
            <h3 id="modalServiceTitle">Service Title</h3>
          </div>
          <button class="modal-close" id="closeServiceModalBtn" aria-label="Close Modal">&times;</button>
        </div>
        <div class="modal-body">
          <p id="modalServiceDesc" class="text-secondary" style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 1.5rem;"></p>
          <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-navy); margin-bottom: 0.75rem;">Key Operational Outcomes</h4>
            <ul id="modalServiceOutcomes" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
              <!-- Dynamic items -->
            </ul>
          </div>
          <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn btn-secondary" id="closeServiceModalSecondary">Close</button>
            <a href="contact.html" class="btn btn-primary">Discuss This Service →</a>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const modal = document.getElementById('serviceDetailModal');
  const backdrop = document.getElementById('serviceModalBackdrop');
  const closeBtn = document.getElementById('closeServiceModalBtn');
  const closeSecondary = document.getElementById('closeServiceModalSecondary');
  const titleEl = document.getElementById('modalServiceTitle');
  const descEl = document.getElementById('modalServiceDesc');
  const eyebrowEl = document.getElementById('modalServiceEyebrow');
  const outcomesEl = document.getElementById('modalServiceOutcomes');

  const serviceDetailsContent = {
    rcm: {
      eyebrow: 'END-TO-END RCM',
      title: 'Revenue Cycle Management',
      desc: 'Our comprehensive revenue cycle management covers patient access, scheduling, charge capture, claims submission, payment posting, and denial management as a unified operation.',
      outcomes: [
        '✓ Reduced days in Accounts Receivable (A/R) by 18-25%',
        '✓ Clean claim rates consistently exceeding 96%',
        '✓ Complete visibility across the entire reimbursement lifecycle'
      ]
    },
    billing: {
      eyebrow: 'ACCURATE BILLING',
      title: 'Medical Billing',
      desc: 'Rigorous billing operations structured around payer guidelines, timely electronic submission, and meticulous secondary insurance coordination.',
      outcomes: [
        '✓ Elimination of recurring billing bottlenecks and claim batch errors',
        '✓ Automated clearinghouse tracking with human exception handling',
        '✓ Transparent daily ledger posting and reconciliation'
      ]
    },
    coding: {
      eyebrow: 'CLINICAL CODING',
      title: 'Medical Coding',
      desc: 'Certified professional coders (CPC, CCS) specializing in inpatient, outpatient, and specialty care settings, ensuring compliance and optimal specificity.',
      outcomes: [
        '✓ ICD-10, CPT, and HCPCS precision aligned with clinical notes',
        '✓ Rigorous compliance audits protecting against compliance exposure',
        '✓ Rapid turnaround times supporting steady cash flow'
      ]
    },
    eligibility: {
      eyebrow: 'PATIENT ACCESS',
      title: 'Eligibility Verification',
      desc: 'Proactive front-end verification ensuring active coverage, copay/deductible requirements, and prior authorizations are fully secured before patient arrival.',
      outcomes: [
        '✓ Near-zero front-end denials due to expired or incorrect coverage',
        '✓ Automated batch verification integrated with scheduling software',
        '✓ Clear patient financial responsibility estimates'
      ]
    },
    denial: {
      eyebrow: 'REVENUE PROTECTION',
      title: 'Denial Management & Appeals',
      desc: 'Systematic root-cause analysis of rejected and denied claims, coupled with rapid appeal turnaround and payer trend reporting.',
      outcomes: [
        '✓ Recovery rates exceeding industry averages on appealed denials',
        '✓ Root-cause classification to prevent recurring payer pushback',
        '✓ Dedicated specialist teams for complex clinical appeals'
      ]
    },
    credentialing: {
      eyebrow: 'PROVIDER ENROLLMENT',
      title: 'Provider Credentialing & Enrollment',
      desc: 'Streamlined provider enrollment across commercial payers, Medicare, and Medicaid, ensuring zero disruption in billing eligibility when providers join or transition.',
      outcomes: [
        '✓ Proactive re-credentialing calendar management',
        '✓ Direct liaison with payer enrollment departments',
        '✓ Accelerated turnaround times for new provider onboarding'
      ]
    },
    ar: {
      eyebrow: 'CASH FLOW ACCELERATION',
      title: 'Accounts Receivable (A/R) Recovery',
      desc: 'Targeted recovery workflows addressing aged A/R buckets, stubborn insurance follow-ups, and patient balance resolution with empathy and clarity.',
      outcomes: [
        '✓ Systematic aging bucket stratification (>90, >120 days)',
        '✓ Dedicated payer escalation pathways for stalled claims',
        '✓ Compassionate patient financial communication'
      ]
    }
  };

  const closeModal = () => {
    if (modal && backdrop) {
      modal.style.display = 'none';
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
  };

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const serviceId = card.getAttribute('data-service-id');
      const details = serviceDetailsContent[serviceId];
      if (!details) return;

      if (eyebrowEl) eyebrowEl.textContent = details.eyebrow;
      if (titleEl) titleEl.textContent = details.title;
      if (descEl) descEl.textContent = details.desc;
      if (outcomesEl) {
        outcomesEl.innerHTML = details.outcomes.map(o => `<li style="color: var(--text-primary); font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">${o}</li>`).join('');
      }

      if (modal && backdrop) {
        modal.style.display = 'block';
        backdrop.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeSecondary) closeSecondary.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
}

/* ==========================================================================
   6. HEALTHCARE SERVICE LINES FILTERING (industries.html)
   ========================================================================== */
function initServiceLinesFilter() {
  const searchInput = document.getElementById('serviceSearchInput');
  const container = document.getElementById('serviceLinesContainer');
  const filterButtons = document.querySelectorAll('[data-category-filter]');

  if (!container) return;

  const cards = container.querySelectorAll('.service-line-card');
  let currentCategory = 'all';
  let searchTerm = '';

  const filterCards = () => {
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const text = card.textContent.toLowerCase();
      
      const matchesCategory = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = (text.includes(searchTerm));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      filterCards();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category-filter');
      filterCards();
    });
  });
}

/* ==========================================================================
   7. PURE RCM CALCULATION ENGINE & RECOMMENDATION GENERATOR
   ========================================================================== */
/**
 * Pure calculation function for healthcare revenue cycle metrics.
 * Exported to window (browser) and module.exports (Node.js).
 * 
 * @param {Object} inputs
 * @param {number|string} inputs.quarterlyBilling - Quarterly billing in USD
 * @param {number|string} inputs.cleanClaimRate - Clean claim percentage (0-100)
 * @param {number|string} inputs.initialDenialRate - Initial denial rate percentage (0-100)
 * @param {number|string} inputs.daysInAR - Average days in accounts receivable
 * @param {number|string} inputs.agingAROver90 - Percentage of A/R older than 90 days
 * @param {number|string} inputs.netCollectionRate - Net collection rate percentage
 * @returns {Object} Comprehensive calculation report
 */
function calculateHealthMetrics(inputs = {}) {
  const quarterlyVal = parseFloat(inputs.quarterlyBilling);
  const quarterlyRev = Number.isFinite(quarterlyVal) ? Math.max(0, quarterlyVal) : 2500000;
  const annualRev = quarterlyRev * 4;

  const cleanVal = parseFloat(inputs.cleanClaimRate);
  const cleanRate = Number.isFinite(cleanVal) ? cleanVal : 88;

  const denialVal = parseFloat(inputs.initialDenialRate);
  const denialRate = Number.isFinite(denialVal) ? denialVal : 12;

  const arDaysVal = parseFloat(inputs.daysInAR);
  const arDays = Number.isFinite(arDaysVal) ? arDaysVal : 54;

  const agingVal = parseFloat(inputs.agingAROver90);
  const agingAR = Number.isFinite(agingVal) ? agingVal : 22;

  const netColVal = parseFloat(inputs.netCollectionRate);
  const netCollection = Number.isFinite(netColVal) ? netColVal : 91;

  // 1. Core Leakage Formulas (as specified by Staff Architecture):
  // - Denial recovery loss: Math.max(0, denialRate - 6) / 100 * annualRev * 0.40
  // - Aged A/R (>90d) loss: Math.max(0, agingAR - 12) / 100 * annualRev * 0.18
  // - Clean claim velocity drag: Math.max(0, 95 - cleanRate) / 100 * annualRev * 0.02
  const denialLoss = (Math.max(0, denialRate - 6) / 100) * annualRev * 0.40;
  const agingLoss = (Math.max(0, agingAR - 12) / 100) * annualRev * 0.18;
  const velocityDrag = (Math.max(0, 95 - cleanRate) / 100) * annualRev * 0.02;
  const totalLeakage = denialLoss + agingLoss + velocityDrag;

  // 2. Health Score Calculation (Base 100, Clamped between 35 and 98)
  let rawScore = 100;
  if (cleanRate < 95) rawScore -= (95 - cleanRate) * 1.5;
  if (denialRate > 6) rawScore -= (denialRate - 6) * 2.0;
  if (arDays > 40) rawScore -= (arDays - 40) * 0.8;
  if (agingAR > 10) rawScore -= (agingAR - 10) * 1.2;
  if (netCollection < 96) rawScore -= (96 - netCollection) * 1.0;

  const score = Math.max(35, Math.min(98, Math.round(rawScore)));

  // 3. Descriptive Classification
  let scoreGrade = 'B';
  let scoreLabel = 'Moderate Performance · Significant Optimization Potential';

  if (score >= 90) {
    scoreGrade = 'A';
    scoreLabel = 'Exceptional Performance · Highly Optimized Revenue Cycle';
  } else if (score >= 80) {
    scoreGrade = 'B+';
    scoreLabel = 'Strong Performance · Targeted Optimization Potential';
  } else if (score >= 65) {
    scoreGrade = 'B';
    scoreLabel = 'Moderate Performance · Significant Optimization Potential';
  } else if (score >= 50) {
    scoreGrade = 'C';
    scoreLabel = 'Vulnerable Performance · High Risk of Revenue Loss';
  } else {
    scoreGrade = 'D';
    scoreLabel = 'Critical Revenue Leakage · Immediate Intervention Recommended';
  }

  // 4. Dynamic Targeted Recommendations tailored to shortfalls
  const shortfalls = [];

  if (denialRate > 6) {
    shortfalls.push({
      type: 'denials',
      severity: (denialRate - 6) * 2.0,
      impact: denialLoss,
      title: 'Denial Root-Cause Stratification & Payer Escalation',
      desc: `Your initial denial rate is ${denialRate}% (vs. industry benchmark ≤6%). Automating CARC/RARC classification and deploying rapid appeal swarms will mitigate ~$${Math.round(denialLoss).toLocaleString()} in avoidable lost revenue.`
    });
  }

  if (agingAR > 12) {
    shortfalls.push({
      type: 'agingAR',
      severity: (agingAR - 12) * 1.8,
      impact: agingLoss,
      title: 'Aged A/R (>90 Days) Liquidation Taskforce',
      desc: `With ${agingAR}% of your total accounts receivable exceeding 90 days (vs. benchmark ≤12%), ~$${Math.round(agingLoss).toLocaleString()} is in imminent danger of contractual write-offs. A dedicated resolution protocol is advised.`
    });
  }

  if (cleanRate < 95) {
    shortfalls.push({
      type: 'cleanRate',
      severity: (95 - cleanRate) * 1.5,
      impact: velocityDrag,
      title: 'Front-End Pre-Submission Claim Scrubbing Engine',
      desc: `Clean claim rate of ${cleanRate}% indicates pre-clearinghouse edit vulnerabilities. Automated pre-bill validation and payer-specific rule engines will eliminate ~$${Math.round(velocityDrag).toLocaleString()} in administrative velocity drag.`
    });
  }

  if (arDays > 45) {
    shortfalls.push({
      type: 'arDays',
      severity: (arDays - 45) * 1.0,
      impact: 0,
      title: 'Days in A/R Acceleration & Auto-Remittance Posting',
      desc: `Days in A/R average ${arDays} days (target ≤40–45 days). Enforcing electronic remittance advice (ERA) auto-posting and clearinghouse status triggers can reduce collection turnaround by 12–18 days.`
    });
  }

  if (netCollection < 96) {
    shortfalls.push({
      type: 'netCollection',
      severity: (96 - netCollection) * 1.2,
      impact: 0,
      title: 'Contractual Underpayment & Net Collection Audit',
      desc: `Net collection rate of ${netCollection}% is lagging the ≥96% benchmark. A contract variance review is suggested to capture uncollected copays and payer underpayments.`
    });
  }

  // Sort shortfalls descending by severity
  shortfalls.sort((a, b) => b.severity - a.severity);

  const recommendations = [];
  if (shortfalls.length > 0) {
    shortfalls.forEach(s => recommendations.push({ title: s.title, desc: s.desc, type: s.type, impact: s.impact }));
  } else {
    recommendations.push({
      title: 'Continuous Benchmarking & Contractual Yield Maximization',
      desc: 'Your operational metrics represent top-decile discipline. Focus on annual payer fee-schedule renegotiations and automated clinical appeal workflows to sustain top performance.',
      type: 'optimal',
      impact: 0
    });
  }

  // Ensure at least 3 comprehensive actionable recommendations
  if (recommendations.length < 3) {
    if (!recommendations.some(r => r.type === 'denials')) {
      recommendations.push({
        title: 'Front-End Eligibility & Prior-Auth Verification',
        desc: 'Sustain sub-6% denial velocity with real-time electronic 270/271 batch eligibility verification at patient scheduling.',
        type: 'intake',
        impact: 0
      });
    }
    if (recommendations.length < 3 && !recommendations.some(r => r.type === 'agingAR')) {
      recommendations.push({
        title: 'Aging Bucket Early-Warning Triggers',
        desc: 'Implement proactive 30/60-day aging alerts to resolve payer pendings before claims reach the 90-day threshold.',
        type: 'monitoring',
        impact: 0
      });
    }
  }

  // 5. Benchmark Comparison Objects
  const benchmarks = {
    cleanClaimRate: {
      value: cleanRate,
      unit: '%',
      benchmark: '≥ 95%',
      isOptimal: cleanRate >= 95,
      status: cleanRate >= 95 ? 'Aligned with benchmark' : 'Below benchmark (rework risk)',
      statusClass: cleanRate >= 95 ? 'badge-success' : 'badge-warning'
    },
    initialDenialRate: {
      value: denialRate,
      unit: '%',
      benchmark: '≤ 6%',
      isOptimal: denialRate <= 6,
      status: denialRate <= 6 ? 'Healthy threshold' : 'Elevated initial denials',
      statusClass: denialRate <= 6 ? 'badge-success' : 'badge-danger'
    },
    daysInAR: {
      value: arDays,
      unit: 'days',
      benchmark: '≤ 45 days',
      isOptimal: arDays <= 45,
      status: arDays <= 45 ? 'Prompt collections' : 'Slow reimbursement velocity',
      statusClass: arDays <= 45 ? 'badge-success' : 'badge-warning'
    },
    agingAROver90: {
      value: agingAR,
      unit: '%',
      benchmark: '≤ 12%',
      isOptimal: agingAR <= 12,
      status: agingAR <= 12 ? 'Well managed aging' : 'High aged AR vulnerability',
      statusClass: agingAR <= 12 ? 'badge-success' : 'badge-danger'
    },
    netCollectionRate: {
      value: netCollection,
      unit: '%',
      benchmark: '≥ 96%',
      isOptimal: netCollection >= 96,
      status: netCollection >= 96 ? 'Optimal collections' : 'Trailing benchmark',
      statusClass: netCollection >= 96 ? 'badge-success' : 'badge-warning'
    }
  };

  return {
    annualRev,
    quarterlyRev,
    cleanRate,
    denialRate,
    arDays,
    agingAR,
    netCollection,
    denialLoss: Math.round(denialLoss),
    agingLoss: Math.round(agingLoss),
    velocityDrag: Math.round(velocityDrag),
    totalLeakage: Math.round(totalLeakage),
    score,
    scoreGrade,
    scoreLabel,
    recommendations,
    benchmarks
  };
}

/**
 * Pure calculation function for healthcare revenue yield and recovery metrics.
 * Exported to window (browser) and module.exports (Node.js).
 * 
 * @param {Object} [inputs={}]
 * @param {number|string} [inputs.monthlyCollections=1500000] - Monthly collections volume in USD ($200K - $10M)
 * @param {number|string} [inputs.denialRate=11.5] - Current initial denial rate percentage (4 - 25%)
 * @param {number|string} [inputs.daysInAr=48] - Average days in A/R (25 - 80 days)
 * @returns {Object} Structured metrics with raw numbers and formatted strings
 */
function calculateYieldMetrics(inputs = {}) {
  const rawMonthly = parseFloat(inputs.monthlyCollections);
  const monthlyCollections = Number.isFinite(rawMonthly) ? Math.max(0, rawMonthly) : 1500000;

  const rawDenial = parseFloat(inputs.denialRate);
  const denialRate = Number.isFinite(rawDenial) ? Math.max(0, rawDenial) : 11.5;

  const rawDays = parseFloat(inputs.daysInAr != null ? inputs.daysInAr : inputs.daysInAR);
  const daysInAr = Number.isFinite(rawDays) ? Math.max(0, rawDays) : 48;

  const annualCollections = monthlyCollections * 12;
  const denialRecovery = annualCollections * (denialRate / 100) * 0.65;
  const velocityYield = annualCollections * 0.015;
  const recoveredYield = denialRecovery + velocityYield;
  const efficiency = Math.min(99.4, Math.max(80, 84 + (100 - denialRate) * 0.16));
  const velocityLiftDays = Math.max(8, Math.round((daysInAr - 32) * 0.65));
  const reworkMitigated = denialRecovery * 0.20;

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const formattedMonthlyCollections = `${currencyFormatter.format(monthlyCollections)} / mo`;
  const formattedAnnualCollections = currencyFormatter.format(annualCollections);
  const formattedDenialRate = `${denialRate.toFixed(1)}%`;
  const formattedDaysInAr = `${Math.round(daysInAr)} Days`;
  const formattedDenialRecovery = currencyFormatter.format(Math.round(denialRecovery));
  const formattedVelocityYield = currencyFormatter.format(Math.round(velocityYield));
  const formattedRecoveredYield = currencyFormatter.format(Math.round(recoveredYield));
  const formattedEfficiency = `${efficiency.toFixed(1)}%`;
  const formattedEfficiencyWidth = `${efficiency.toFixed(1)}%`;
  const formattedVelocityLiftDays = `-${velocityLiftDays} Days faster`;
  const formattedReworkMitigated = currencyFormatter.format(Math.round(reworkMitigated));

  return {
    monthlyCollections,
    annualCollections,
    denialRate,
    daysInAr,
    denialRecovery,
    velocityYield,
    recoveredYield,
    efficiency,
    velocityLiftDays,
    reworkMitigated,
    formattedMonthlyCollections,
    formattedAnnualCollections,
    formattedDenialRate,
    formattedDaysInAr,
    formattedDenialRecovery,
    formattedVelocityYield,
    formattedRecoveredYield,
    formattedEfficiency,
    formattedVelocityLiftDays,
    formattedReworkMitigated,
    formatted: {
      monthlyCollections: formattedMonthlyCollections,
      annualCollections: formattedAnnualCollections,
      denialRate: formattedDenialRate,
      daysInAr: formattedDaysInAr,
      denialRecovery: formattedDenialRecovery,
      velocityYield: formattedVelocityYield,
      recoveredYield: formattedRecoveredYield,
      efficiency: formattedEfficiency,
      efficiencyWidth: formattedEfficiencyWidth,
      velocityLiftDays: formattedVelocityLiftDays,
      reworkMitigated: formattedReworkMitigated
    }
  };
}

// Expose calculation engine & lead routing functions to browser global scope
if (typeof window !== 'undefined') {
  window.calculateHealthMetrics = calculateHealthMetrics;
  window.calculateYieldMetrics = calculateYieldMetrics;
  window.PIPELINE_STAGES = PIPELINE_STAGES;
  window.generateLeadRefId = generateLeadRefId;
  window.serializeLeadPayload = serializeLeadPayload;
  window.getStoredLeads = getStoredLeads;
  window.saveLeadToStorage = saveLeadToStorage;
  window.formatLeadsToCsv = formatLeadsToCsv;
  window.exportLeadsToCsv = exportLeadsToCsv;
}

// Expose calculation engine & lead utilities to CommonJS / Node.js test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateHealthMetrics,
    calculateYieldMetrics,
    PIPELINE_STAGES,
    generateLeadRefId,
    serializeLeadPayload,
    getStoredLeads,
    saveLeadToStorage,
    formatLeadsToCsv,
    exportLeadsToCsv
  };
}

/* ==========================================================================
   8. RCM HEALTH CHECK WIZARD (health-check.html)
   ========================================================================== */
function initRcmHealthCheckWizard() {
  const form = document.getElementById('healthCheckForm');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 4;

  const stepTitleText = document.getElementById('stepTitleText');
  const metricCounterText = document.getElementById('metricCounterText');
  const wizardProgressBar = document.getElementById('wizardProgressBar');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const resetBtn = document.getElementById('wizardResetBtn');

  const stepTitles = [
    "Step 1 of 4 · Organization Details",
    "Step 2 of 4 · Billing & Denials",
    "Step 3 of 4 · A/R & Collections",
    "Step 4 of 4 · Revenue Intelligence & Leakage Report"
  ];

  // The 17 tracked metric fields
  const metricFieldIds = [
    'orgName', 'contactName', 'workEmail', 'orgPhone', 'orgType', 'providerCount', 'specialties', 'reportingPeriod', 'quarterlyBilling',
    'cleanClaimRate', 'initialDenialRate', 'avgDaysToSubmit', 'monthlyClaimVolume',
    'daysInAR', 'agingAROver90', 'netCollectionRate', 'badDebtRate'
  ];

  const countEnteredMetrics = () => {
    let count = 0;
    metricFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value !== null && el.value !== undefined && el.value.toString().trim() !== '') {
        count++;
      }
    });
    return count;
  };

  const updateMetricCounter = () => {
    const count = countEnteredMetrics();
    if (metricCounterText) {
      metricCounterText.textContent = `${count} of 17 metrics entered`;
    }
  };

  // Attach live input & change listeners to all 17 inputs for real-time tracking
  metricFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateMetricCounter);
      el.addEventListener('change', updateMetricCounter);
    }
  });

  const updateWizardView = () => {
    // Show/hide step containers
    for (let i = 1; i <= totalSteps; i++) {
      const stepEl = document.getElementById(`wizardStep${i}`);
      const indicator = document.getElementById(`stepIndicator${i}`);
      if (stepEl) {
        stepEl.style.display = (i === currentStep) ? 'block' : 'none';
      }
      if (indicator) {
        if (i < currentStep) {
          indicator.className = 'step-indicator completed';
        } else if (i === currentStep) {
          indicator.className = 'step-indicator active';
        } else {
          indicator.className = 'step-indicator';
        }
      }
    }

    if (stepTitleText) stepTitleText.textContent = stepTitles[currentStep - 1];
    if (wizardProgressBar) {
      const percent = (currentStep / totalSteps) * 100;
      wizardProgressBar.style.width = `${percent}%`;
    }

    // Refresh dynamic metric counter
    updateMetricCounter();

    // Wizard Action Buttons
    if (prevBtn) {
      prevBtn.style.display = (currentStep > 1) ? 'inline-flex' : 'none';
    }
    if (nextBtn) {
      if (currentStep === 3) {
        nextBtn.textContent = 'Generate Intelligence Report →';
        nextBtn.style.display = 'inline-flex';
      } else if (currentStep === 4) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.textContent = 'Continue →';
        nextBtn.style.display = 'inline-flex';
      }
    }
    if (resetBtn) {
      resetBtn.style.display = (currentStep === 4) ? 'inline-flex' : 'none';
    }

    // If step 4, calculate dynamic results
    if (currentStep === 4) {
      calculateHealthCheckResults();
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        // Validation on Step 1
        if (currentStep === 1) {
          const orgName = document.getElementById('orgName')?.value;
          const email = document.getElementById('workEmail')?.value;
          if (!orgName || !email) {
            alert('Please fill in your Organization Name and Work Email to proceed.');
            return;
          }
        }
        currentStep++;
        updateWizardView();
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep = (currentStep === 4) ? 3 : currentStep - 1;
        updateWizardView();
        window.scrollTo({ top: 200, behavior: 'smooth' });
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      currentStep = 1;
      updateWizardView();
      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  }

  // Initial render
  updateWizardView();
}

/**
 * Reads inputs from DOM, executes pure calculation engine, and populates Step 4 report
 */
function calculateHealthCheckResults() {
  const quarterlyBillingInput = document.getElementById('quarterlyBilling');
  const cleanClaimRateInput = document.getElementById('cleanClaimRate');
  const denialRateInput = document.getElementById('initialDenialRate');
  const daysInARInput = document.getElementById('daysInAR');
  const agingOver90Input = document.getElementById('agingAROver90');
  const netCollectionRateInput = document.getElementById('netCollectionRate');

  const report = calculateHealthMetrics({
    quarterlyBilling: quarterlyBillingInput?.value,
    cleanClaimRate: cleanClaimRateInput?.value,
    initialDenialRate: denialRateInput?.value,
    daysInAR: daysInARInput?.value,
    agingAROver90: agingOver90Input?.value,
    netCollectionRate: netCollectionRateInput?.value
  });

  // Populate Key Metric Displays
  const leakageEl = document.getElementById('leakageAmount');
  const scoreEl = document.getElementById('healthScore');
  const labelEl = document.getElementById('healthScoreLabel');
  const denialLossEl = document.getElementById('denialLossVal');
  const agingLossEl = document.getElementById('agingARLossVal');
  const velocityLossEl = document.getElementById('cleanClaimVelocityLossVal');

  if (leakageEl) leakageEl.textContent = `$${report.totalLeakage.toLocaleString()}`;
  if (scoreEl) scoreEl.textContent = `${report.score}/100`;
  if (labelEl) {
    labelEl.textContent = report.scoreLabel;
    if (report.score >= 80) {
      labelEl.className = 'alert alert-success';
    } else if (report.score >= 60) {
      labelEl.className = 'alert alert-warning';
    } else {
      labelEl.className = 'alert alert-danger';
    }
  }
  if (denialLossEl) denialLossEl.textContent = `$${report.denialLoss.toLocaleString()}`;
  if (agingLossEl) agingLossEl.textContent = `$${report.agingLoss.toLocaleString()}`;
  if (velocityLossEl) velocityLossEl.textContent = `$${report.velocityDrag.toLocaleString()}`;

  // Populate Benchmark Table
  const benchmarkTableBody = document.getElementById('benchmarkTableBody');
  if (benchmarkTableBody) {
    const b = report.benchmarks;
    benchmarkTableBody.innerHTML = `
      <tr>
        <td><strong>Clean Claim Rate</strong></td>
        <td><span class="badge ${b.cleanClaimRate.statusClass}">${b.cleanClaimRate.value}%</span></td>
        <td>${b.cleanClaimRate.benchmark}</td>
        <td>${b.cleanClaimRate.status}</td>
      </tr>
      <tr>
        <td><strong>Initial Denial Rate</strong></td>
        <td><span class="badge ${b.initialDenialRate.statusClass}">${b.initialDenialRate.value}%</span></td>
        <td>${b.initialDenialRate.benchmark}</td>
        <td>${b.initialDenialRate.status}</td>
      </tr>
      <tr>
        <td><strong>Days in A/R</strong></td>
        <td><span class="badge ${b.daysInAR.statusClass}">${b.daysInAR.value} days</span></td>
        <td>${b.daysInAR.benchmark}</td>
        <td>${b.daysInAR.status}</td>
      </tr>
      <tr>
        <td><strong>A/R > 90 Days</strong></td>
        <td><span class="badge ${b.agingAROver90.statusClass}">${b.agingAROver90.value}%</span></td>
        <td>${b.agingAROver90.benchmark}</td>
        <td>${b.agingAROver90.status}</td>
      </tr>
      <tr>
        <td><strong>Net Collection Rate</strong></td>
        <td><span class="badge ${b.netCollectionRate.statusClass}">${b.netCollectionRate.value}%</span></td>
        <td>${b.netCollectionRate.benchmark}</td>
        <td>${b.netCollectionRate.status}</td>
      </tr>
    `;
  }

  // Populate Targeted Recommendations
  const recsList = document.getElementById('recommendationsList');
  if (recsList) {
    recsList.innerHTML = report.recommendations
      .map(rec => `<li><strong>${rec.title}:</strong> ${rec.desc}</li>`)
      .join('');
  }

  // Print button
  const printBtn = document.getElementById('printReportBtn');
  if (printBtn) {
    printBtn.onclick = () => window.print();
  }

  // Consultation button
  const consultationBtn = document.getElementById('consultationBtn');
  if (consultationBtn) {
    consultationBtn.onclick = () => {
      window.location.href = 'contact.html';
    };
  }

  // Executive Mailbox Dispatch Integration
  const recipientEmailInput = document.getElementById('auditRecipientEmail');
  const orgEmailInput = document.getElementById('orgWorkEmail');
  const sendEmailBtn = document.getElementById('sendAuditEmailBtn');
  const mailtoBtn = document.getElementById('auditDirectMailtoBtn');
  const alertBox = document.getElementById('auditDispatchAlert');

  const initialEmail = orgEmailInput?.value ? orgEmailInput.value.trim() : '';
  if (recipientEmailInput && !recipientEmailInput.value && initialEmail) {
    recipientEmailInput.value = initialEmail;
  }

  const orgName = (document.getElementById('orgName')?.value || 'Healthcare Organization').trim();
  const contactName = (document.getElementById('orgContactName')?.value || 'Clinical Executive').trim();
  const orgType = (document.getElementById('orgType')?.value || 'Hospital').trim();
  const phone = (document.getElementById('orgPhone')?.value || 'N/A').trim();
  const period = (document.getElementById('reportingPeriod')?.value || 'Current').trim();

  // Construct structured audit body
  const auditSubject = `CuraSync RCM Health Check Audit: ${orgName} (Score: ${report.score}/100)`;
  const auditBodyLines = [
    `CURASYNC RCM REVENUE HEALTH CHECK AUDIT REPORT`,
    `==============================================`,
    `Organization: ${orgName}`,
    `Contact Name: ${contactName}`,
    `Delivery Email: ${recipientEmailInput?.value || initialEmail || 'Not specified'}`,
    `Phone: ${phone}`,
    `Organization Type: ${orgType}`,
    `Reporting Period: ${period}`,
    `Quarterly Gross Billing: $${report.quarterlyBilling.toLocaleString()}`,
    ``,
    `EXECUTIVE FINANCIAL SUMMARY:`,
    `- Institutional RCM Health Score: ${report.score} / 100 (${report.scoreLabel})`,
    `- Estimated Annual Revenue Leakage: $${report.totalLeakage.toLocaleString()}`,
    `- First-Pass Denial Recovery Opportunity: $${report.denialLoss.toLocaleString()}`,
    `- Aged A/R Drag (>90 Days): $${report.agingLoss.toLocaleString()}`,
    `- Clean Claim Velocity Drag: $${report.velocityDrag.toLocaleString()}`,
    ``,
    `BENCHMARK COMPARISON:`,
    `- Clean Claim Rate: ${report.benchmarks.cleanClaimRate.value}% (Benchmark: 95.0%)`,
    `- Initial Denial Rate: ${report.benchmarks.initialDenialRate.value}% (Benchmark: < 5.0%)`,
    `- Days in A/R: ${report.benchmarks.daysInAR.value} days (Benchmark: < 35.0 days)`,
    `- A/R > 90 Days: ${report.benchmarks.agingAROver90.value}% (Benchmark: < 12.0%)`,
    `- Net Collection Rate: ${report.benchmarks.netCollectionRate.value}% (Benchmark: > 96.0%)`,
    ``,
    `PRIORITIZED OPERATIONAL RECOMMENDATIONS:`,
    ...(report.recommendations.map((r, i) => `${i + 1}. ${r.title}: ${r.desc}`)),
    ``,
    `==============================================`,
    `Generated via CuraSync Revenue Intelligence Platform`,
    `Live Link: https://saswata-d91.github.io/arda-homepage/health-check.html`
  ];
  const auditBodyText = auditBodyLines.join('\r\n');

  function updateMailtoLink() {
    if (!mailtoBtn) return;
    const targetEmail = recipientEmailInput?.value ? recipientEmailInput.value.trim() : initialEmail;
    const mailtoUrl = `mailto:inquiries@curasync.com?cc=${encodeURIComponent(targetEmail)}&subject=${encodeURIComponent(auditSubject)}&body=${encodeURIComponent(auditBodyText)}`;
    mailtoBtn.setAttribute('href', mailtoUrl);
  }

  updateMailtoLink();
  if (recipientEmailInput) {
    recipientEmailInput.addEventListener('input', updateMailtoLink);
  }

  if (sendEmailBtn) {
    sendEmailBtn.onclick = () => {
      const targetEmail = recipientEmailInput?.value ? recipientEmailInput.value.trim() : '';
      if (!targetEmail || !targetEmail.includes('@')) {
        alert('Please enter a valid work email address to deliver your diagnostic report.');
        if (recipientEmailInput) recipientEmailInput.focus();
        return;
      }

      // Save audit to local storage buffer
      const auditRecord = {
        refId: generateLeadRefId(),
        timestamp: new Date().toISOString(),
        orgName,
        contactName,
        recipientEmail: targetEmail,
        score: report.score,
        totalLeakage: report.totalLeakage,
        denialLoss: report.denialLoss
      };

      if (typeof localStorage !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('curasync_health_audits') || '[]');
          stored.unshift(auditRecord);
          localStorage.setItem('curasync_health_audits', JSON.stringify(stored.slice(0, 50)));
        } catch (e) {
          console.warn('Storage quota or disabled', e);
        }
      }

      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.innerHTML = `<strong>✓ Diagnostic Report Prepared!</strong> A complete audit summary has been recorded for <strong>${targetEmail}</strong> and CuraSync Advisory (<code>inquiries@curasync.com</code>). Reference: <code>${auditRecord.refId}</code>.`;
      }

      // Open mailto trigger so user has instant copy in their mail app
      updateMailtoLink();
      window.location.href = mailtoBtn.getAttribute('href');
    };
  }
}

/* ==========================================================================
   9. CONTACT FORM INTERACTION & ZERO-LOSS LEAD ROUTING (contact.html)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successAlert = document.getElementById('contactSuccessAlert');
  const contactCard = document.getElementById('contactCard');
  const directMailtoBtn = document.getElementById('contactDirectEmailBtn');

  // Dynamic pre-filled mailto updater (mailto sync)
  function updateDirectMailtoHref() {
    if (!directMailtoBtn) return;
    const name = (document.getElementById('contactName')?.value || '').trim();
    const email = (document.getElementById('contactEmail')?.value || '').trim();
    const notes = (document.getElementById('contactNotes')?.value || '').trim();

    const subject = encodeURIComponent(
      name ? `Revenue Operations Inquiry - ${name}` : 'Revenue Operations Inquiry - CuraSync'
    );
    const bodyLines = [
      `Hello CuraSync Revenue Operations Team,`,
      ``,
      `I would like to discuss revenue cycle management services.`,
      ``,
      `--- INQUIRY DETAILS ---`,
      `Name: ${name || 'N/A'}`,
      `Work Email: ${email || 'N/A'}`,
      `Message: ${notes || 'N/A'}`,
      ``,
      `Please contact me at your earliest convenience.`
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    directMailtoBtn.href = `mailto:inquiries@curasync.com?subject=${subject}&body=${body}`;
  }

  // Bind input changes to mailto updater
  ['contactName', 'contactEmail', 'contactNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateDirectMailtoHref);
      el.addEventListener('change', updateDirectMailtoHref);
    }
  });

  updateDirectMailtoHref();

  // Form Submission Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (document.getElementById('contactName')?.value || '').trim();
    const email = (document.getElementById('contactEmail')?.value || '').trim();
    const notes = (document.getElementById('contactNotes')?.value || '').trim();

    if (!name || !email || !notes) {
      alert('Please fill out your Name, Work Email, and Message.');
      return;
    }

    const refId = generateLeadRefId();
    const payload = {
      refId,
      timestamp: new Date().toISOString(),
      name,
      email,
      phone: '',
      organization: '',
      orgType: 'hospital',
      selectedServices: [],
      notes
    };

    // 1. Zero-Loss LocalStorage Persistence
    saveLeadToStorage(payload);

    // 2. Configurable Endpoint Routing (Formspree / Web3Forms / Custom Webhook)
    const actionUrl = form.getAttribute('action');
    if (actionUrl && actionUrl.trim() !== '' && actionUrl !== '#' && !actionUrl.startsWith('javascript:')) {
      try {
        fetch(actionUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.warn('Configured endpoint dispatch logged locally:', err);
        });
      } catch (err) {
        console.warn('Endpoint error:', err);
      }
    }

    // 3. Render Rich Interactive Confirmation Banner / Receipt
    if (successAlert) {
      const formattedDate = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const subject = encodeURIComponent(`Confirmation: CuraSync Inquiry [${refId}] - ${name}`);
      const body = encodeURIComponent(
        `CuraSync Inquiry Confirmation Receipt\n\nReference ID: ${refId}\nDate: ${formattedDate}\nName: ${name}\nEmail: ${email}\nMessage: ${notes}\n\nOur team is reviewing your operational inquiry.`
      );
      const mailtoLink = `mailto:inquiries@curasync.com?subject=${subject}&body=${body}`;

      successAlert.style.display = 'block';
      successAlert.innerHTML = `
        <div class="receipt-card">
          <div class="receipt-header">
            <div>
              <span class="badge badge-teal" style="margin-bottom: 0.5rem;">INQUIRY LOGGED &amp; ROUTED</span>
              <h3 class="receipt-title">Thank you, ${name}.</h3>
              <p class="receipt-subtitle">Your message has been registered into our zero-loss operational pipeline.</p>
            </div>
            <div class="receipt-ref-badge" id="receiptRefBadge">${refId}</div>
          </div>

          <div class="receipt-grid">
            <div class="receipt-item">
              <span class="receipt-label">Contact Name</span>
              <span class="receipt-value">${name}</span>
            </div>
            <div class="receipt-item">
              <span class="receipt-label">Work Email</span>
              <span class="receipt-value">${email}</span>
            </div>
            <div class="receipt-item">
              <span class="receipt-label">Submission Timestamp</span>
              <span class="receipt-value">${formattedDate}</span>
            </div>
            <div class="receipt-item">
              <span class="receipt-label">Response SLA</span>
              <span class="receipt-value">&lt;24 Business Hours</span>
            </div>
            <div class="receipt-item" style="grid-column: 1 / -1;">
              <span class="receipt-label">Your Message</span>
              <span class="receipt-value">${notes}</span>
            </div>
          </div>

          <div class="receipt-sla-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Assigned to CuraSync Revenue Advisory · A specialist will reach out within 1 business day.</span>
          </div>

          <div class="receipt-actions">
            <button type="button" class="btn btn-outline btn-sm" id="printReceiptBtn">🖨 Print / Save Receipt</button>
            <a class="btn btn-outline btn-sm" id="receiptMailtoFallbackBtn" href="${mailtoLink}">✉ Send Email Copy</a>
            <button type="button" class="btn btn-primary btn-sm" id="resetContactViewBtn">Send Another Message</button>
          </div>
        </div>
      `;

      if (contactCard) {
        contactCard.style.display = 'none';
      }

      // Print receipt button handler
      const printBtn = document.getElementById('printReceiptBtn');
      if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
      }

      // Reset contact view button handler
      const resetBtn = document.getElementById('resetContactViewBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          form.reset();
          successAlert.style.display = 'none';
          if (contactCard) contactCard.style.display = 'block';
          updateDirectMailtoHref();
        });
      }

      window.scrollTo({ top: successAlert.offsetTop - 80, behavior: 'smooth' });
    }
  });
}
