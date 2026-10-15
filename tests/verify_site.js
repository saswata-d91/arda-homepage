/**
 * ==============================================================================
 * CURASYNC EXHAUSTIVE AUTOMATED TEST SUITE
 * Architecture: Native Node.js Test Runner (Zero external test dependencies)
 * 
 * Test Coverage:
 * 1. Brand Vector Assets (SVG validity, taglines, hex colors)
 * 2. CSS Design System (Custom properties, component classes, bracket balance)
 * 3. Static HTML Page Integrity (10/10 pages exist, DOCTYPE, CSS/JS/favicon links)
 * 4. Full Link & Resource Integrity (Zero broken internal links, valid images)
 * 5. DOM Interactive Structure (All elements/IDs required by app.js exist)
 * 6. RCM Calculation Engine Unit Tests (Healthy, Average, Critical, Boundary, Zeros)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const test = require('node:test');

const ROOT_DIR = path.resolve(__dirname, '..');
const {
  calculateHealthMetrics,
  calculateYieldMetrics,
  PIPELINE_STAGES,
  generateLeadRefId,
  serializeLeadPayload,
  formatLeadsToCsv,
  getStoredLeads,
  saveLeadToStorage,
  exportLeadsToCsv
} = require(path.join(ROOT_DIR, 'assets/js/app.js'));

const ALL_HTML_PAGES = [
  'index.html',
  'services.html',
  'industries.html',
  'about.html',
  'health-check.html',
  'case-studies.html',
  'blog.html',
  'testimonials.html',
  'careers.html',
  'contact.html'
];

/* ==========================================================================
   SUITE 1: BRAND VECTOR ASSETS
   ========================================================================== */
test('1. Brand Vector Assets Verification', async (t) => {
  await t.test('logo.svg exists and conforms to brand specifications', () => {
    const logoPath = path.join(ROOT_DIR, 'assets/images/logo.svg');
    assert.ok(fs.existsSync(logoPath), 'assets/images/logo.svg must exist');

    const content = fs.readFileSync(logoPath, 'utf8');
    assert.match(content, /<svg[^>]+>/, 'Must be valid SVG root element');
    assert.match(content, /<\/svg>/, 'Must have closing svg tag');
    assert.match(content, /Cura/i, 'Must contain "Cura" text');
    assert.match(content, /Sync/i, 'Must contain "Sync" text');
    assert.match(content, /SMARTER RCM\. HEALTHIER REVENUE\./, 'Must contain official brand tagline');
    assert.match(content, /#0B2546/i, 'Must feature deep navy (#0B2546)');
    assert.match(content, /#0891B2/i, 'Must feature surgical teal (#0891B2)');
  });

  await t.test('favicon.svg exists and contains healthcare cross + sync emblem', () => {
    const favPath = path.join(ROOT_DIR, 'assets/images/favicon.svg');
    assert.ok(fs.existsSync(favPath), 'assets/images/favicon.svg must exist');

    const content = fs.readFileSync(favPath, 'utf8');
    assert.match(content, /<svg[^>]+>/, 'Must be valid SVG root element');
    assert.match(content, /<\/svg>/, 'Must have closing svg tag');
    assert.match(content, /#0B2546/i, 'Must feature corporate navy');
    assert.match(content, /#0891B2/i, 'Must feature surgical teal');
  });
});

/* ==========================================================================
   SUITE 2: CSS DESIGN SYSTEM
   ========================================================================== */
test('2. CSS Design System Verification', async (t) => {
  const cssPath = path.join(ROOT_DIR, 'assets/css/styles.css');

  await t.test('styles.css exists and is non-empty', () => {
    assert.ok(fs.existsSync(cssPath), 'assets/css/styles.css must exist');
    const stats = fs.statSync(cssPath);
    assert.ok(stats.size > 2000, 'styles.css must contain comprehensive CSS styles');
  });

  const css = fs.readFileSync(cssPath, 'utf8');

  await t.test('Root custom properties are properly declared', () => {
    const requiredTokens = [
      '--color-navy',
      '--color-navy-dark',
      '--color-navy-light',
      '--color-teal',
      '--color-teal-dark',
      '--color-teal-light',
      '--color-accent',
      '--color-emerald',
      '--color-rose',
      '--color-amber',
      '--bg-body',
      '--bg-card',
      '--bg-subtle',
      '--bg-dark',
      '--border-subtle',
      '--border-medium',
      '--border-accent',
      '--font-sans'
    ];

    for (const token of requiredTokens) {
      assert.ok(css.includes(token), `CSS token ${token} must be defined in :root`);
    }
  });

  await t.test('All required component classes are present', () => {
    const requiredClasses = [
      '.navbar',
      '.mobile-drawer',
      '.drawer-backdrop',
      '.btn',
      '.btn-primary',
      '.btn-secondary',
      '.btn-outline',
      '.btn-dark',
      '.btn-sm',
      '.btn-lg',
      '.btn-block',
      '.eyebrow',
      '.section-title',
      '.section-subtitle',
      '.highlight-text',
      '.ops-visualizer',
      '.ops-tabs',
      '.ops-tab',
      '.ops-panel',
      '.ops-chart',
      '.ops-callout',
      '.care-chips',
      '.care-card',
      '.service-card',
      '.method-card',
      '.step-card',
      '.wizard-header',
      '.wizard-progress-bar',
      '.metric-tracker-badge',
      '.wizard-step-indicator',
      '.wizard-card',
      '.form-grid',
      '.form-group',
      '.form-label',
      '.form-input',
      '.form-select',
      '.form-hint',
      '.report-card',
      '.score-circle',
      '.leakage-banner',
      '.benchmark-table',
      '.recommendation-list',
      '.chip-selector',
      '.filter-chip',
      '.feedback-alert',
      '.form-success',
      '.search-box',
      '.filter-tags',
      '.service-line-item',
      '.modal-backdrop',
      '.modal-container',
      '.modal-header',
      '.modal-body',
      '.modal-close',
      '.site-footer',
      '.staff-link',
      '.flex',
      '.grid',
      '.hidden-mobile',
      '.hidden-desktop',
      '.container'
    ];

    for (const cls of requiredClasses) {
      assert.ok(css.includes(cls), `CSS class ${cls} must be defined in styles.css`);
    }
  });

  await t.test('CSS-to-DOM Class Parity: 100% of HTML classes have corresponding CSS rules', () => {
    // Extract all unique classes across all HTML pages
    const allClasses = new Set();
    const classesByPage = {};

    for (const pageName of ALL_HTML_PAGES) {
      const pagePath = path.join(ROOT_DIR, pageName);
      const content = fs.readFileSync(pagePath, 'utf8');
      const matches = [...content.matchAll(/class="([^"]+)"/g)];
      const pageClasses = new Set();
      for (const m of matches) {
        m[1].split(/\s+/).filter(Boolean).forEach(cls => {
          pageClasses.add(cls);
          allClasses.add(cls);
        });
      }
      classesByPage[pageName] = Array.from(pageClasses).sort();
    }

    // Verify index.html specifically as primary landing surface
    const indexClasses = classesByPage['index.html'] || [];
    const missingIndexClasses = [];
    for (const cls of indexClasses) {
      const regex = new RegExp(`\\.${cls.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}(?=[^-_a-zA-Z0-9]|$)`);
      if (!regex.test(css)) {
        missingIndexClasses.push(cls);
      }
    }
    assert.deepStrictEqual(
      missingIndexClasses,
      [],
      `index.html has classes missing from styles.css: ${missingIndexClasses.join(', ')}`
    );

    // Verify all 10 pages across the entire site
    const missingAllClasses = [];
    for (const cls of Array.from(allClasses).sort()) {
      const regex = new RegExp(`\\.${cls.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}(?=[^-_a-zA-Z0-9]|$)`);
      if (!regex.test(css)) {
        missingAllClasses.push(cls);
      }
    }
    assert.deepStrictEqual(
      missingAllClasses,
      [],
      `Site-wide HTML files have classes missing from styles.css: ${missingAllClasses.join(', ')}`
    );

    assert.ok(allClasses.size >= 100, `Expected at least 100 classes across all HTML pages, found ${allClasses.size}`);
  });

  await t.test('CSS brace syntax is 100% balanced', () => {
    let balance = 0;
    for (let i = 0; i < css.length; i++) {
      if (css[i] === '{') balance++;
      if (css[i] === '}') balance--;
      assert.ok(balance >= 0, `Unmatched closing brace at character index ${i}`);
    }
    assert.strictEqual(balance, 0, 'CSS open and closing braces must match exactly');
  });
});

/* ==========================================================================
   SUITE 3: STATIC HTML PAGE INTEGRITY
   ========================================================================== */
test('3. Static HTML Page Integrity (All 10 Pages)', async (t) => {
  for (const pageName of ALL_HTML_PAGES) {
    await t.test(`${pageName} file presence and foundational structure`, () => {
      const pagePath = path.join(ROOT_DIR, pageName);
      assert.ok(fs.existsSync(pagePath), `${pageName} must exist on disk`);

      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(content.length > 500, `${pageName} must contain substantial content`);
      assert.match(content, /<!DOCTYPE\s+html>/i, `${pageName} must have valid DOCTYPE declaration`);
      assert.match(content, /<html[^>]*lang=["']en["']/i, `${pageName} must specify lang="en"`);
      assert.match(content, /<meta[^>]+viewport/i, `${pageName} must contain viewport meta tag`);
      assert.match(content, /<title>[^<]+<\/title>/i, `${pageName} must have a non-empty <title> tag`);
      assert.match(content, /href=["']assets\/css\/styles\.css["']/i, `${pageName} must link to styles.css`);
      assert.match(content, /src=["']assets\/js\/app\.js["']/i, `${pageName} must reference app.js`);
      assert.match(content, /href=["']assets\/images\/favicon\.svg["']/i, `${pageName} must link to favicon.svg`);
    });
  }
});

/* ==========================================================================
   SUITE 4: FULL LINK & RESOURCE INTEGRITY
   ========================================================================== */
test('4. Full Link & Resource Integrity (0 Broken Links)', async (t) => {
  for (const pageName of ALL_HTML_PAGES) {
    await t.test(`${pageName} internal link and image reference validity`, () => {
      const pagePath = path.join(ROOT_DIR, pageName);
      const content = fs.readFileSync(pagePath, 'utf8');

      // 1. Verify all <a href="..."> references
      const hrefRegex = /href=["']([^"']+)["']/g;
      let match;
      while ((match = hrefRegex.exec(content)) !== null) {
        const rawHref = match[1];

        // Skip external or protocol URIs
        if (rawHref.startsWith('http://') || rawHref.startsWith('https://') ||
            rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') ||
            rawHref.startsWith('javascript:')) {
          continue;
        }

        // Handle pure in-page anchors: '#...'
        if (rawHref.startsWith('#')) {
          if (rawHref === '#' || rawHref === '#main-content') continue;
          const targetId = rawHref.substring(1);
          const hasTarget = content.includes(`id="${targetId}"`) || content.includes(`id='${targetId}'`);
          assert.ok(hasTarget, `Anchor ${rawHref} in ${pageName} must resolve to an element with matching ID`);
          continue;
        }

        // Relative file links, possibly with hash: 'services.html#rcm'
        const [filePath, hash] = rawHref.split('#');
        const resolvedPath = path.join(ROOT_DIR, filePath);
        assert.ok(fs.existsSync(resolvedPath), `Link target ${filePath} referenced in ${pageName} must exist on disk`);

        // If an anchor was targeted on that file, verify anchor exists
        if (hash) {
          const targetContent = fs.readFileSync(resolvedPath, 'utf8');
          const hasTarget = targetContent.includes(`id="${hash}"`) || targetContent.includes(`id='${hash}'`);
          assert.ok(hasTarget, `Anchor #${hash} on target file ${filePath} from ${pageName} must exist`);
        }
      }

      // 2. Verify all <img src="..."> references
      const srcRegex = /src=["']([^"']+)["']/g;
      let srcMatch;
      while ((srcMatch = srcRegex.exec(content)) !== null) {
        const rawSrc = srcMatch[1];
        if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://') || rawSrc.startsWith('data:')) {
          continue;
        }
        const resolvedPath = path.join(ROOT_DIR, rawSrc);
        assert.ok(fs.existsSync(resolvedPath), `Image src "${rawSrc}" referenced in ${pageName} must exist on disk`);
      }
    });
  }
});

/* ==========================================================================
   SUITE 5: DOM INTERACTIVE STRUCTURE
   ========================================================================== */
test('5. DOM Interactive Structure Verification', async (t) => {
  await t.test('index.html contains all expected visualizer and navigation elements', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const expectedIds = [
      'openDrawerBtn',
      'mobileDrawer',
      'drawerBackdrop',
      'opsTabContainer',
      // Floating dark navy tooltip
      'opsChartTooltip',
      // 3 Operational Stages
      'opsStageIntake',
      'opsStageClaims',
      'opsStageResolution',
      // 9 Slim Pill Bars
      'opsBarBatchIntake',
      'opsBarCoverageCheck',
      'opsBarPriorAuth',
      'opsBarScrubbing',
      'opsBarCleanFiling',
      'opsBarGatewayPayer',
      'opsBarFastRemittance',
      'opsBarExceptionRoute',
      'opsBarArPosting',
      // Backward-compatible bar IDs
      'opsBarIntake',
      'opsBarClaims',
      'opsBarResolution',
      // Callout display
      'opsCalloutTitle',
      'opsCalloutText'
    ];
    for (const id of expectedIds) {
      assert.ok(content.includes(`id="${id}"`), `index.html must contain id="${id}"`);
    }

    // Verify Histogram telemetry markers and dashed grid
    assert.ok(content.includes('100%'), 'index.html must include 100% Y-axis marker');
    assert.ok(content.includes('75%'), 'index.html must include 75% Y-axis marker');
    assert.ok(content.includes('50%'), 'index.html must include 50% Y-axis marker');
    assert.ok(content.includes('25%'), 'index.html must include 25% Y-axis marker');
    assert.ok(content.includes('0%'), 'index.html must include 0% Y-axis marker');
    assert.ok(content.includes('ops-grid-lines'), 'index.html must include ops-grid-lines');
  });

  await t.test('services.html contains interactive service detail cards', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'services.html'), 'utf8');
    assert.ok(content.includes('data-service-id='), 'services.html must contain service detail cards with data-service-id');
    assert.ok(content.includes('data-service-id="rcm"'), 'services.html must contain rcm card');
    assert.ok(content.includes('data-service-id="billing"'), 'services.html must contain billing card');
  });

  await t.test('industries.html contains search, filter, and container elements', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'industries.html'), 'utf8');
    assert.ok(content.includes('id="serviceSearchInput"'), 'industries.html must contain serviceSearchInput');
    assert.ok(content.includes('id="serviceLinesContainer"'), 'industries.html must contain serviceLinesContainer');
    assert.ok(content.includes('data-category-filter='), 'industries.html must contain category filter buttons');
  });

  await t.test('health-check.html contains all 17 inputs, steps, and report elements', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'health-check.html'), 'utf8');
    const expectedElements = [
      'healthCheckForm',
      'stepTitleText',
      'metricCounterText',
      'wizardProgressBar',
      'wizardPrevBtn',
      'wizardNextBtn',
      'wizardResetBtn',
      'wizardStep1',
      'wizardStep2',
      'wizardStep3',
      'wizardStep4',
      'stepIndicator1',
      'stepIndicator2',
      'stepIndicator3',
      'stepIndicator4',
      'leakageAmount',
      'healthScore',
      'healthScoreLabel',
      'denialLossVal',
      'agingARLossVal',
      'cleanClaimVelocityLossVal',
      'benchmarkTableBody',
      'recommendationsList',
      'printReportBtn',
      'consultationBtn',
      // All 17 live metric inputs
      'orgName',
      'contactName',
      'workEmail',
      'orgPhone',
      'orgType',
      'providerCount',
      'specialties',
      'reportingPeriod',
      'quarterlyBilling',
      'cleanClaimRate',
      'initialDenialRate',
      'avgDaysToSubmit',
      'monthlyClaimVolume',
      'daysInAR',
      'agingAROver90',
      'netCollectionRate',
      'badDebtRate'
    ];

    for (const id of expectedElements) {
      assert.ok(content.includes(`id="${id}"`), `health-check.html must contain id="${id}"`);
    }
  });

  await t.test('contact.html contains direct contact cards, quick note form, and direct action buttons', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'contact.html'), 'utf8');
    const expectedIds = [
      'contactForm',
      'contactSuccessAlert',
      'contactName',
      'contactEmail',
      'contactNotes',
      'contactSubmitBtn',
      'contactDirectEmailBtn',
      'contactDirectPhoneBtn'
    ];
    for (const id of expectedIds) {
      assert.ok(content.includes(`id="${id}"`), `contact.html must contain id="${id}"`);
    }
    // Direct action links
    assert.ok(content.includes('mailto:inquiries@curasync.com'), 'contact.html must contain direct mailto link');
    assert.ok(content.includes('tel:+18005552872'), 'contact.html must contain direct tel link');
    // Direct contact cards classes
    assert.ok(content.includes('contact-cards-grid'), 'contact.html must contain contact-cards-grid');
    assert.ok(content.includes('contact-direct-card'), 'contact.html must contain contact-direct-card');
    assert.ok(content.includes('contact-quick-note-card'), 'contact.html must contain contact-quick-note-card');
  });

  await t.test('Site-wide verification: neither staffLoginBtn nor staffPortalBtn exists in any HTML page', () => {
    for (const pageName of ALL_HTML_PAGES) {
      const pagePath = path.join(ROOT_DIR, pageName);
      const content = fs.readFileSync(pagePath, 'utf8');
      assert.ok(!content.includes('id="staffLoginBtn"'), `${pageName} must not contain staffLoginBtn`);
      assert.ok(!content.includes("id='staffLoginBtn'"), `${pageName} must not contain staffLoginBtn`);
      assert.ok(!content.includes('id="staffPortalBtn"'), `${pageName} must not contain staffPortalBtn`);
      assert.ok(!content.includes("id='staffPortalBtn'"), `${pageName} must not contain staffPortalBtn`);
      assert.ok(!content.includes('staffLoginModal'), `${pageName} must not contain staffLoginModal`);
    }
  });
});

/* ==========================================================================
   SUITE 6: RCM CALCULATION ENGINE UNIT TESTS
   ========================================================================== */
test('6. RCM Calculation Engine Unit Tests', async (t) => {
  await t.test('Healthy Organization: Score in [90-98], Zero/Low Leakage', () => {
    const result = calculateHealthMetrics({
      quarterlyBilling: 3000000,
      cleanClaimRate: 98,
      initialDenialRate: 4,
      daysInAR: 32,
      agingAROver90: 8,
      netCollectionRate: 98
    });

    assert.ok(result.score >= 90 && result.score <= 98, `Healthy score must be between 90 and 98 (received ${result.score})`);
    assert.strictEqual(result.totalLeakage, 0, 'Healthy organization with metrics exceeding benchmarks has zero leakage');
    assert.strictEqual(result.denialLoss, 0, 'Denial loss should be 0 when denialRate <= 6%');
    assert.strictEqual(result.agingLoss, 0, 'Aging loss should be 0 when agingAR <= 12%');
    assert.strictEqual(result.velocityDrag, 0, 'Velocity drag should be 0 when cleanClaimRate >= 95%');
    assert.strictEqual(result.benchmarks.cleanClaimRate.isOptimal, true);
    assert.strictEqual(result.benchmarks.initialDenialRate.isOptimal, true);
  });

  await t.test('Average Organization: Score in [65-80], Moderate Leakage', () => {
    const result = calculateHealthMetrics({
      quarterlyBilling: 2500000,
      cleanClaimRate: 92,
      initialDenialRate: 9,
      daysInAR: 46,
      agingAROver90: 16,
      netCollectionRate: 94
    });

    assert.ok(result.score >= 65 && result.score <= 80, `Average score must be between 65 and 80 (received ${result.score})`);
    assert.ok(result.totalLeakage > 0, 'Average organization must show revenue leakage');
    
    // Exact formula assertions
    // annualRev = 2,500,000 * 4 = 10,000,000
    // denialLoss = (9 - 6) / 100 * 10,000,000 * 0.40 = 120,000
    // agingLoss = (16 - 12) / 100 * 10,000,000 * 0.18 = 72,000
    // velocityDrag = (95 - 92) / 100 * 10,000,000 * 0.02 = 6,000
    // totalLeakage = 198,000
    assert.strictEqual(result.denialLoss, 120000, 'Denial loss formula exact match');
    assert.strictEqual(result.agingLoss, 72000, 'Aging loss formula exact match');
    assert.strictEqual(result.velocityDrag, 6000, 'Velocity drag formula exact match');
    assert.strictEqual(result.totalLeakage, 198000, 'Total leakage formula exact match');
    assert.ok(result.recommendations.length >= 3, 'Must deliver at least 3 actionable recommendations');
  });

  await t.test('Critical Organization: Score in [35-50], Severe Leakage', () => {
    const result = calculateHealthMetrics({
      quarterlyBilling: 2000000,
      cleanClaimRate: 70,
      initialDenialRate: 25,
      daysInAR: 75,
      agingAROver90: 38,
      netCollectionRate: 80
    });

    assert.ok(result.score >= 35 && result.score <= 50, `Critical score must be between 35 and 50 (received ${result.score})`);
    assert.ok(result.totalLeakage > 500000, 'Critical organization must reflect significant leakage');
    assert.match(result.scoreLabel, /(Critical|Vulnerable)/i, 'Score label must indicate critical or vulnerable state');
    assert.ok(result.recommendations.length >= 3);
  });

  await t.test('Zero / Negative / Empty Inputs: Handled safely without NaN or crashes', () => {
    const result = calculateHealthMetrics({
      quarterlyBilling: -5000,
      cleanClaimRate: -10,
      initialDenialRate: -5,
      daysInAR: -20,
      agingAROver90: -10,
      netCollectionRate: -5
    });

    assert.ok(!Number.isNaN(result.score), 'Score must not be NaN');
    assert.ok(!Number.isNaN(result.totalLeakage), 'Total leakage must not be NaN');
    assert.ok(result.score >= 35 && result.score <= 98, 'Score must stay clamped');
    assert.strictEqual(result.annualRev, 0, 'Negative quarterly billing clamped to 0');
    assert.strictEqual(result.totalLeakage, 0, 'Zero annual revenue produces 0 leakage');
  });

  await t.test('Clamping Boundaries: Strict Clamp between 35 and 98', () => {
    // Upper boundary test
    const maxResult = calculateHealthMetrics({
      quarterlyBilling: 1000000,
      cleanClaimRate: 100,
      initialDenialRate: 0,
      daysInAR: 10,
      agingAROver90: 0,
      netCollectionRate: 100
    });
    assert.strictEqual(maxResult.score, 98, 'Score must be strictly clamped at upper boundary of 98');

    // Lower boundary test
    const minResult = calculateHealthMetrics({
      quarterlyBilling: 1000000,
      cleanClaimRate: 0,
      initialDenialRate: 100,
      daysInAR: 200,
      agingAROver90: 100,
      netCollectionRate: 0
    });
    assert.strictEqual(minResult.score, 35, 'Score must be strictly clamped at lower boundary of 35');
  });
});

/* ==========================================================================
   SUITE 7: LEAD STORAGE & CSV EXPORT UNIT TESTS
   ========================================================================== */
test('7. Lead Routing, Persistence & CSV Export Unit Tests', async (t) => {
  await t.test('generateLeadRefId: produces compliant reference IDs (REF-2026-XXXX)', () => {
    const refId = generateLeadRefId();
    assert.match(refId, /^REF-2026-[A-Z0-9]{4}$/, 'Must match format REF-2026-XXXX');

    // Test entropy / uniqueness
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateLeadRefId());
    }
    assert.strictEqual(ids.size, 100, '100 generated reference IDs must all be unique');
  });

  await t.test('serializeLeadPayload: sanitizes inputs, trims whitespace and assigns defaults', () => {
    const rawData = {
      name: '  Dr. Sarah Connor  ',
      email: '  sconnor@cyberdyne-health.org ',
      phone: '  (555) 019-2834 ',
      organization: ' Cyberdyne Medical Center ',
      orgType: 'hospital',
      selectedServices: ['rcm', 'denial', 'billing'],
      notes: '  Need full billing audit before Q1. '
    };

    const serialized = serializeLeadPayload(rawData);
    assert.match(serialized.refId, /^REF-2026-[A-Z0-9]{4}$/);
    assert.strictEqual(serialized.name, 'Dr. Sarah Connor');
    assert.strictEqual(serialized.email, 'sconnor@cyberdyne-health.org');
    assert.strictEqual(serialized.phone, '(555) 019-2834');
    assert.strictEqual(serialized.organization, 'Cyberdyne Medical Center');
    assert.strictEqual(serialized.orgType, 'hospital');
    assert.deepStrictEqual(serialized.selectedServices, ['rcm', 'denial', 'billing']);
    assert.strictEqual(serialized.notes, 'Need full billing audit before Q1.');
    assert.ok(Date.parse(serialized.timestamp) > 0, 'Timestamp must be valid ISO date string');

    // Test streamlined 3-field quick note payload with optional fields omitted
    const streamlinedLead = serializeLeadPayload({
      name: '  Dr. John Watson  ',
      email: '  watson@bakerstreet.org ',
      notes: '  Need revenue advisory for clinical billing. '
    });
    assert.match(streamlinedLead.refId, /^REF-2026-[A-Z0-9]{4}$/);
    assert.strictEqual(streamlinedLead.name, 'Dr. John Watson');
    assert.strictEqual(streamlinedLead.email, 'watson@bakerstreet.org');
    assert.strictEqual(streamlinedLead.notes, 'Need revenue advisory for clinical billing.');
    assert.strictEqual(streamlinedLead.phone, '');
    assert.strictEqual(streamlinedLead.organization, '');
    assert.strictEqual(streamlinedLead.orgType, 'hospital');
    assert.deepStrictEqual(streamlinedLead.selectedServices, []);

    // Test default fallback values on empty payload
    const emptyLead = serializeLeadPayload({});
    assert.strictEqual(emptyLead.name, '');
    assert.strictEqual(emptyLead.email, '');
    assert.strictEqual(emptyLead.orgType, 'hospital');
    assert.deepStrictEqual(emptyLead.selectedServices, []);
  });

  await t.test('formatLeadsToCsv: generates RFC 4180 compliant CSV formatting with quote escaping', () => {
    // 1. Empty array should output headers only
    const emptyCsv = formatLeadsToCsv([]);
    assert.match(emptyCsv, /^"Reference ID","Timestamp","Name","Email","Phone","Organization","Organization Type","Selected Topics","Notes"$/);

    // 2. Leads array with special characters, commas, and quotes
    const testLeads = [
      {
        refId: 'REF-2026-TEST',
        timestamp: '2026-10-15T12:00:00.000Z',
        name: 'Dr. Jane "JD" Doe',
        email: 'jdoe@testclinic.com',
        phone: '555-1234',
        organization: 'Doe & Associates, LLC',
        orgType: 'practice',
        selectedServices: ['rcm', 'claims scrubbing'],
        notes: 'Notes with, commas and "quotes" and\nline breaks'
      },
      {
        refId: 'REF-2026-BETA',
        timestamp: '2026-10-15T13:00:00.000Z',
        name: 'Mark Miller',
        email: 'mmiller@health.org',
        phone: '555-5678',
        organization: 'Metro Hospital',
        orgType: 'hospital',
        selectedServices: ['credentialing'],
        notes: 'Standard inquiry'
      }
    ];

    const csvOutput = formatLeadsToCsv(testLeads);
    const lines = csvOutput.split('\r\n');
    assert.ok(lines.length >= 3, 'CSV must contain header and at least 2 rows');

    // Verify header line
    assert.strictEqual(lines[0], '"Reference ID","Timestamp","Name","Email","Phone","Organization","Organization Type","Selected Topics","Notes"');

    // Verify row 1 contains escaped quotes
    assert.ok(csvOutput.includes('"Dr. Jane ""JD"" Doe"'), 'Quotes must be escaped as double-quotes');
    assert.ok(csvOutput.includes('"Doe & Associates, LLC"'), 'Commas must be enclosed in quotes');
    assert.ok(csvOutput.includes('rcm; claims scrubbing'), 'Topics must be delimited');
    assert.ok(csvOutput.includes('REF-2026-BETA'), 'Second lead must be included');
  });

  await t.test('Client Persistence & CSV Export Pipeline Simulation', () => {
    // Mock global.localStorage for simulated headless client environment
    const storageMap = new Map();
    const mockLocalStorage = {
      getItem: (key) => storageMap.get(key) || null,
      setItem: (key, val) => storageMap.set(key, String(val)),
      removeItem: (key) => storageMap.delete(key),
      clear: () => storageMap.clear()
    };

    global.testStorage = mockLocalStorage;

    try {
      // 1. Initial storage is empty
      assert.deepStrictEqual(getStoredLeads(), []);

      // 2. Save lead 1
      saveLeadToStorage({
        name: 'Alice Springs',
        email: 'asprings@clinic.org',
        organization: 'Springs Health',
        selectedServices: ['eligibility']
      });

      // 3. Save lead 2
      saveLeadToStorage({
        name: 'Bob Vance',
        email: 'bvance@refrigeration.com',
        organization: 'Vance Medical',
        selectedServices: ['ar', 'billing']
      });

      const stored = getStoredLeads();
      assert.strictEqual(stored.length, 2, 'Must contain 2 stored leads');
      // LIFO order: newest first
      assert.strictEqual(stored[0].name, 'Bob Vance');
      assert.strictEqual(stored[1].name, 'Alice Springs');

      // 4. Test CSV export logic
      const csvExport = exportLeadsToCsv();
      assert.ok(csvExport.includes('Alice Springs'), 'Exported CSV must contain Alice Springs');
      assert.ok(csvExport.includes('Bob Vance'), 'Exported CSV must contain Bob Vance');
      assert.ok(csvExport.includes('Springs Health'), 'Exported CSV must contain Springs Health');
    } finally {
      delete global.testStorage;
    }
  });
});

/* ==========================================================================
   SUITE 8: REVENUE YIELD CALCULATOR & PIPELINE VISUALIZER ENGINES
   ========================================================================== */
test('8. Revenue Yield Calculator & Pipeline Visualizer Verification', async (t) => {
  await t.test('calculateYieldMetrics: standard benchmark calculations (defaults and typical inputs)', () => {
    // 1. Default fallback parameters
    const defaultRes = calculateYieldMetrics();
    assert.strictEqual(defaultRes.monthlyCollections, 1500000);
    assert.strictEqual(defaultRes.annualCollections, 18000000);
    assert.strictEqual(defaultRes.denialRate, 11.5);
    assert.strictEqual(defaultRes.daysInAr, 48);
    assert.strictEqual(defaultRes.denialRecovery, 1345500);
    assert.strictEqual(defaultRes.velocityYield, 270000);
    assert.strictEqual(defaultRes.recoveredYield, 1615500);
    assert.strictEqual(Number(defaultRes.efficiency.toFixed(2)), 98.16);
    assert.strictEqual(defaultRes.velocityLiftDays, 10);
    assert.strictEqual(defaultRes.reworkMitigated, 269100);

    // Formatted output verification
    assert.strictEqual(defaultRes.formatted.monthlyCollections, '$1,500,000 / mo');
    assert.strictEqual(defaultRes.formatted.annualCollections, '$18,000,000');
    assert.strictEqual(defaultRes.formatted.denialRate, '11.5%');
    assert.strictEqual(defaultRes.formatted.daysInAr, '48 Days');
    assert.strictEqual(defaultRes.formatted.denialRecovery, '$1,345,500');
    assert.strictEqual(defaultRes.formatted.velocityYield, '$270,000');
    assert.strictEqual(defaultRes.formatted.recoveredYield, '$1,615,500');
    assert.strictEqual(defaultRes.formatted.efficiency, '98.2%');
    assert.strictEqual(defaultRes.formatted.velocityLiftDays, '-10 Days faster');
    assert.strictEqual(defaultRes.formatted.reworkMitigated, '$269,100');

    // 2. Typical mid-sized healthcare system
    const midRes = calculateYieldMetrics({
      monthlyCollections: 3200000,
      denialRate: 14.5,
      daysInAr: 52
    });
    // annualCollections = 3.2M * 12 = 38.4M
    assert.strictEqual(midRes.annualCollections, 38400000);
    // denialRecovery = 38.4M * 0.145 * 0.65 = 3,619,200
    assert.strictEqual(midRes.denialRecovery, 3619200);
    // velocityYield = 38.4M * 0.015 = 576,000
    assert.strictEqual(midRes.velocityYield, 576000);
    // recoveredYield = 3,619,200 + 576,000 = 4,195,200
    assert.strictEqual(midRes.recoveredYield, 4195200);
    // efficiency = 84 + (100 - 14.5) * 0.16 = 84 + 13.68 = 97.68%
    assert.strictEqual(Number(midRes.efficiency.toFixed(2)), 97.68);
    // velocityLiftDays = Math.max(8, Math.round((52 - 32) * 0.65)) = Math.max(8, 13) = 13
    assert.strictEqual(midRes.velocityLiftDays, 13);
    // reworkMitigated = 3,619,200 * 0.20 = 723,840
    assert.strictEqual(midRes.reworkMitigated, 723840);
  });

  await t.test('calculateYieldMetrics: boundary handling (minimum volume $200k, maximum $10M, denial 4-25%, AR 25-80)', () => {
    // Lower slider boundaries: $200K / mo, 4% denial rate, 25 days AR
    const minRes = calculateYieldMetrics({
      monthlyCollections: 200000,
      denialRate: 4,
      daysInAr: 25
    });
    assert.strictEqual(minRes.annualCollections, 2400000);
    // denialRecovery = 2.4M * 0.04 * 0.65 = 62,400
    assert.strictEqual(minRes.denialRecovery, 62400);
    // velocityYield = 2.4M * 0.015 = 36,000
    assert.strictEqual(minRes.velocityYield, 36000);
    assert.strictEqual(minRes.recoveredYield, 98400);
    // efficiency = 84 + (100 - 4) * 0.16 = 84 + 15.36 = 99.36% (under 99.4 cap)
    assert.strictEqual(Number(minRes.efficiency.toFixed(2)), 99.36);
    // velocityLiftDays = Math.max(8, Math.round((25 - 32) * 0.65)) = 8 (floor at 8)
    assert.strictEqual(minRes.velocityLiftDays, 8);
    assert.strictEqual(minRes.reworkMitigated, 12480);

    // Upper slider boundaries: $10M / mo, 25% denial rate, 80 days AR
    const maxRes = calculateYieldMetrics({
      monthlyCollections: 10000000,
      denialRate: 25,
      daysInAr: 80
    });
    assert.strictEqual(maxRes.annualCollections, 120000000);
    // denialRecovery = 120M * 0.25 * 0.65 = 19,500,000
    assert.strictEqual(maxRes.denialRecovery, 19500000);
    // velocityYield = 120M * 0.015 = 1,800,000
    assert.strictEqual(maxRes.velocityYield, 1800000);
    assert.strictEqual(maxRes.recoveredYield, 21300000);
    // efficiency = 84 + (100 - 25) * 0.16 = 84 + 12 = 96.0%
    assert.strictEqual(maxRes.efficiency, 96);
    // velocityLiftDays = Math.max(8, Math.round((80 - 32) * 0.65)) = Math.max(8, 31) = 31
    assert.strictEqual(maxRes.velocityLiftDays, 31);
    assert.strictEqual(maxRes.reworkMitigated, 3900000);
  });

  await t.test('calculateYieldMetrics: edge cases (zero, negative, string inputs, clamping limits)', () => {
    // Zero / negative inputs
    const zeroRes = calculateYieldMetrics({
      monthlyCollections: 0,
      denialRate: 0,
      daysInAr: 0
    });
    assert.strictEqual(zeroRes.monthlyCollections, 0);
    assert.strictEqual(zeroRes.annualCollections, 0);
    assert.strictEqual(zeroRes.denialRecovery, 0);
    assert.strictEqual(zeroRes.velocityYield, 0);
    assert.strictEqual(zeroRes.recoveredYield, 0);
    // Clamped efficiency cap at 99.4% (84 + 100 * 0.16 = 100 -> cap 99.4)
    assert.strictEqual(zeroRes.efficiency, 99.4);
    // Minimum velocity lift floor of 8 days
    assert.strictEqual(zeroRes.velocityLiftDays, 8);

    // Negative inputs clamped to 0
    const negRes = calculateYieldMetrics({
      monthlyCollections: -500000,
      denialRate: -10,
      daysInAr: -20
    });
    assert.strictEqual(negRes.monthlyCollections, 0);
    assert.strictEqual(negRes.denialRate, 0);

    // Extremely high denial rate: checks efficiency minimum clamp of 80%
    const criticalRes = calculateYieldMetrics({
      monthlyCollections: 1000000,
      denialRate: 150,
      daysInAr: 40
    });
    // 84 + (100 - 150) * 0.16 = 84 - 8 = 76 -> clamped to 80%
    assert.strictEqual(criticalRes.efficiency, 80);

    // String input support (e.g. from range input value)
    const strRes = calculateYieldMetrics({
      monthlyCollections: '2500000',
      denialRate: '12.0',
      daysInAr: '45'
    });
    assert.strictEqual(strRes.monthlyCollections, 2500000);
    assert.strictEqual(strRes.annualCollections, 30000000);
    assert.strictEqual(strRes.denialRecovery, 2340000);
    assert.strictEqual(strRes.velocityYield, 450000);
    assert.strictEqual(strRes.recoveredYield, 2790000);
  });

  await t.test('DOM Verification: #roi-calculator-section elements present in index.html', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

    // Section presence
    assert.ok(content.includes('id="roi-calculator-section"'), 'index.html must contain #roi-calculator-section');

    // Inputs
    const expectedInputIds = [
      'monthlyCollectionsRange',
      'denialRateRange',
      'daysInArRange'
    ];
    for (const id of expectedInputIds) {
      assert.ok(content.includes(`id="${id}"`), `index.html must contain input #${id}`);
      assert.ok(content.includes(`for="${id}"`), `index.html must contain label for #${id}`);
    }

    // Displays and metric outputs
    const expectedDisplayIds = [
      'monthlyCollectionsDisplay',
      'denialRateDisplay',
      'daysInArDisplay',
      'recoveredYieldDisplay',
      'efficiencyDisplay',
      'efficiencyFill',
      'denialRecoveryVal',
      'velocityLiftVal',
      'reworkMitigatedVal'
    ];
    for (const id of expectedDisplayIds) {
      assert.ok(content.includes(`id="${id}"`), `index.html must contain display #${id}`);
    }

    // Range slider attribute configuration
    assert.ok(content.includes('min="200000"'), 'monthlyCollectionsRange must configure min=200000');
    assert.ok(content.includes('max="10000000"'), 'monthlyCollectionsRange must configure max=10000000');
    assert.ok(content.includes('min="4"'), 'denialRateRange must configure min=4');
    assert.ok(content.includes('max="25"'), 'denialRateRange must configure max=25');
    assert.ok(content.includes('min="25"'), 'daysInArRange must configure min=25');
    assert.ok(content.includes('max="80"'), 'daysInArRange must configure max=80');

    // CTA routing link to audit wizard
    assert.ok(content.includes('href="health-check.html"'), 'ROI calculator must link to health-check.html');
  });

  await t.test('DOM Verification: #pipeline-section interactive 5-stage architecture present in index.html', () => {
    const content = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

    // Section and container presence
    assert.ok(content.includes('id="pipeline-section"'), 'index.html must contain #pipeline-section');
    assert.ok(content.includes('id="pipelineFlowContainer"'), 'index.html must contain #pipelineFlowContainer');
    assert.ok(content.includes('id="pipelineDetailsPanel"'), 'index.html must contain #pipelineDetailsPanel');
    assert.ok(content.includes('id="pipelineDetailTitle"'), 'index.html must contain #pipelineDetailTitle');
    assert.ok(content.includes('id="pipelineDetailDesc"'), 'index.html must contain #pipelineDetailDesc');
    assert.ok(content.includes('id="pipelineCalloutGrid"'), 'index.html must contain #pipelineCalloutGrid');

    // Stage buttons 1 through 5 with data-stage
    for (let stageNum = 1; stageNum <= 5; stageNum++) {
      assert.ok(
        content.includes(`data-stage="${stageNum}"`),
        `index.html must contain pipeline stage button with data-stage="${stageNum}"`
      );
    }

    // First stage initially active
    assert.ok(content.includes('class="pipeline-stage-btn active"'), 'Initial active stage button must have .active class');
    assert.ok(content.includes('aria-selected="true"'), 'Active stage button must have aria-selected="true"');

    // Verify PIPELINE_STAGES data dictionary
    assert.ok(PIPELINE_STAGES, 'PIPELINE_STAGES data dictionary must be exported');
    for (let i = 1; i <= 5; i++) {
      const stage = PIPELINE_STAGES[i];
      assert.ok(stage, `Stage ${i} must exist in PIPELINE_STAGES`);
      assert.ok(typeof stage.title === 'string' && stage.title.length > 0, `Stage ${i} must have title`);
      assert.ok(typeof stage.desc === 'string' && stage.desc.length > 0, `Stage ${i} must have desc`);
      assert.ok(Array.isArray(stage.callouts) && stage.callouts.length === 3, `Stage ${i} must have 3 callouts`);
      for (const callout of stage.callouts) {
        assert.ok(callout.icon, `Stage ${i} callout must have icon`);
        assert.ok(callout.title, `Stage ${i} callout must have title`);
        assert.ok(callout.text, `Stage ${i} callout must have text`);
      }
    }
  });
});


