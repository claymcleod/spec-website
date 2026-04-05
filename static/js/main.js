// Version handling
const defaultVersion = window.DEFAULT_VERSION || '1.2';
const basePath = (() => {
    try { return new URL(window.BASE_URL || '/', window.location.origin).pathname.replace(/\/$/, ''); }
    catch { return ''; }
})();
const escapedBasePath = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const versionPattern = new RegExp('^' + escapedBasePath + '/([\\d.]+)/');
const versionPatternFull = new RegExp('(^https?://[^/]*)?' + escapedBasePath + '/([\\d.]+)/');
const contentFrameId = 'content-frame';
const versionDiffCache = new Map();


function compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA !== numB) return numA - numB;
    }
    return 0;
}

function getVersionFromUrl() {
    const match = window.location.pathname.match(versionPattern);
    return match ? match[1] : null;
}

function rewriteVersionedLinks(targetVersion) {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (versionPatternFull.test(href)) {
            link.setAttribute('href', href.replace(versionPatternFull, (match, origin) => {
                return (origin || '') + basePath + '/' + targetVersion + '/';
            }));
        }
    });
}

function updateVersionVisibility(version) {
    document.querySelectorAll('[data-min-version]').forEach(el => {
        const minV = el.getAttribute('data-min-version');
        el.style.display = compareVersions(version, minV) < 0 ? 'none' : '';
        // Add "new" pill for items introduced in this version
        const existing = el.querySelector('.new-in-version');
        if (existing) existing.remove();
        if (minV === version) {
            // Append to the link, not the container div
            const target = el.tagName === 'A' ? el : el.querySelector('a.sidebar-link');
            if (target) {
                target.classList.add('whitespace-nowrap');
                const badge = document.createElement('span');
                badge.className = 'new-in-version inline-flex items-center align-middle px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 ml-2 shrink-0';
                badge.textContent = 'new';
                target.appendChild(badge);
            }
        } else {
            const target = el.tagName === 'A' ? el : el.querySelector('a.sidebar-link');
            if (target) target.classList.remove('whitespace-nowrap');
        }
    });
    document.querySelectorAll('[data-max-version]').forEach(el => {
        el.style.display = compareVersions(version, el.getAttribute('data-max-version')) > 0 ? 'none' : '';
    });

    // Add "New in vX.Y" pill below page h1 if this page was introduced in a later version
    const header = document.querySelector('article > header');
    if (header) {
        const existingBadge = header.querySelector('.new-in-version');
        if (existingBadge) existingBadge.remove();
        const currentPath = window.location.pathname;
        const activeLink = document.querySelector('a.sidebar-link[href="' + currentPath + '"]');
        if (activeLink) {
            const pageMinVersion = activeLink.getAttribute('data-min-version') || activeLink.closest('[data-min-version]')?.getAttribute('data-min-version');
            if (pageMinVersion) {
                const badge = document.createElement('span');
                badge.className = 'new-in-version inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 mb-4';
                badge.textContent = 'New in v' + pageMinVersion;
                const h1 = header.querySelector('h1');
                h1.insertAdjacentElement('afterend', badge);
            }
        }
    }
}

// Sync dropdown display to match active version
const latestVersion = window.LATEST_VERSION || defaultVersion;
function updateDropdownDisplay(version) {
    const pill = version === latestVersion
        ? ' <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold bg-teal-800 text-white dark:bg-teal-400 dark:text-gray-900 ml-1.5">latest</span>'
        : '';
    document.querySelectorAll('.version-dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.version-dropdown-toggle > span');
        toggle.innerHTML = 'Version ' + version + pill;
        dropdown.querySelectorAll('.version-dropdown-item').forEach(item => {
            const isSelected = item.getAttribute('data-version') === version;
            item.classList.toggle('font-semibold', isSelected);
            item.classList.toggle('bg-gray-100', isSelected);
            item.classList.toggle('dark:bg-gray-600', isSelected);
        });
    });
}

// Version dropdown
function toggleVersionMenu(btn) {
    const dropdown = btn.closest('.version-dropdown');
    const menu = dropdown.querySelector('.version-dropdown-menu');
    const isOpen = !menu.classList.contains('hidden');
    closeAllVersionMenus();
    if (!isOpen) {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
    }
}

async function selectVersion(btn) {
    const newVersion = btn.getAttribute('data-version');
    localStorage.setItem('wdl-version', newVersion);
    closeAllVersionMenus();
    const urlVersion = getVersionFromUrl();
    if (urlVersion) {
        const newUrl = window.location.pathname.replace(versionPattern, basePath + '/' + newVersion + '/');
        const hash = window.location.hash;
        try {
            const resp = await fetch(newUrl + (hash || ''), { method: 'HEAD' });
            if (resp.ok) {
                window.location.href = newUrl + hash;
            } else {
                window.location.href = basePath + '/' + newVersion + '/introduction/';
            }
        } catch {
            window.location.href = basePath + '/' + newVersion + '/introduction/';
        }
    } else {
        rewriteVersionedLinks(newVersion);
        updateVersionVisibility(newVersion);
        updateDropdownDisplay(newVersion);
    }
}

function closeAllVersionMenus() {
    document.querySelectorAll('.version-dropdown-menu').forEach(m => m.classList.add('hidden'));
    document.querySelectorAll('.version-dropdown-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.version-dropdown')) closeAllVersionMenus();
});

function initThemeToggle() {
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    if (!lightBtn || !darkBtn) return;

    const activeClasses = ['bg-white', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'font-medium', 'shadow-sm'];
    const inactiveClasses = ['text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200'];
    const allClasses = [...activeClasses, ...inactiveClasses];

    const updateThemeButtons = () => {
        const isDark = document.documentElement.classList.contains('dark');
        [lightBtn, darkBtn].forEach(btn => btn.classList.remove(...allClasses));
        const [active, inactive] = isDark ? [darkBtn, lightBtn] : [lightBtn, darkBtn];
        active.classList.add(...activeClasses);
        inactive.classList.add(...inactiveClasses);
    };

    updateThemeButtons();

    if (lightBtn.dataset.bound !== 'true') {
        lightBtn.dataset.bound = 'true';
        lightBtn.addEventListener('click', () => {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateThemeButtons();
        });
    }

    if (darkBtn.dataset.bound !== 'true') {
        darkBtn.dataset.bound = 'true';
        darkBtn.addEventListener('click', () => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeButtons();
        });
    }
}

// Mobile sidebar toggle
function initMobileSidebar() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    if (sessionStorage.getItem('mobileSidebarOpen') === 'true') {
        mobileSidebar?.classList.remove('hidden');
    }

    const openMobileSidebar = () => {
        mobileSidebar?.classList.remove('hidden');
        sessionStorage.setItem('mobileSidebarOpen', 'true');
    };

    const closeMobileSidebar = () => {
        mobileSidebar?.classList.add('hidden');
        sessionStorage.removeItem('mobileSidebarOpen');
    };

    if (mobileMenuButton && mobileMenuButton.dataset.bound !== 'true') {
        mobileMenuButton.dataset.bound = 'true';
        mobileMenuButton.addEventListener('click', openMobileSidebar);
    }
    if (mobileSidebarClose && mobileSidebarClose.dataset.bound !== 'true') {
        mobileSidebarClose.dataset.bound = 'true';
        mobileSidebarClose.addEventListener('click', closeMobileSidebar);
    }
    if (mobileSidebarOverlay && mobileSidebarOverlay.dataset.bound !== 'true') {
        mobileSidebarOverlay.dataset.bound = 'true';
        mobileSidebarOverlay.addEventListener('click', closeMobileSidebar);
    }
}

// Active navigation highlighting
function initSidebarNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-link[href]');
    navLinks.forEach(link => link.setAttribute('data-turbo-frame', contentFrameId));
    document.querySelectorAll('.sidebar-link-active').forEach(link => link.classList.remove('sidebar-link-active'));

    const activeSections = new Set();
    const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';

    navLinks.forEach(link => {
        const rawHref = link.getAttribute('href');
        if (rawHref && rawHref.startsWith('#')) return;
        const linkPath = new URL(link.href).pathname;
        const normalizedLinkPath = linkPath.endsWith('/') ? linkPath : linkPath + '/';
        if (normalizedCurrentPath === normalizedLinkPath) {
            link.classList.add('sidebar-link-active');
            let element = link;
            while (element) {
                element = element.parentElement;
                if (element && element.classList && element.classList.contains('sidebar-section')) {
                    const sectionName = element.getAttribute('data-section');
                    if (sectionName) activeSections.add(sectionName);
                }
            }
        }
    });

    document.querySelectorAll('.sidebar-section').forEach(section => {
        const chevronButton = section.querySelector('.chevron-toggle');
        const content = section.querySelector('.sidebar-content');
        const chevron = section.querySelector('.sidebar-chevron');
        const sectionName = section.getAttribute('data-section');
        if (!content || !chevron) return;

        if (activeSections.has(sectionName)) {
            content.classList.remove('hidden');
            chevron.classList.remove('chevron-closed');
            chevron.classList.add('chevron-open');
            chevron.style.transition = 'none';
            setTimeout(() => {
                chevron.style.transition = '';
            }, 0);
        } else {
            chevron.classList.remove('chevron-open');
            chevron.classList.add('chevron-closed');
        }

        if (chevronButton && chevronButton.dataset.bound !== 'true') {
            chevronButton.dataset.bound = 'true';
            chevronButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = !content.classList.contains('hidden');
                if (isOpen) {
                    content.classList.add('hidden');
                    chevron.classList.remove('chevron-open');
                    chevron.classList.add('chevron-closed');
                } else {
                    content.classList.remove('hidden');
                    chevron.classList.remove('chevron-closed');
                    chevron.classList.add('chevron-open');
                }
            });
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.dataset.bound === 'true') return;
        anchor.dataset.bound = 'true';
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const hash = this.getAttribute('href');
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, '', hash);
            }
        });
    });
}

// Example label headers for code blocks
function initExampleLabels() {
    const patterns = ['Example:', 'Example input:', 'Example output:', 'Test config:'];
    document.querySelectorAll('.prose p').forEach(p => {
        if (p.classList.contains('example-label')) return;
        const text = p.textContent.trim();
        if (!patterns.some(pat => text.startsWith(pat))) return;
        const next = p.nextElementSibling;
        if (!next || next.tagName !== 'PRE') return;
        p.classList.add('example-label');
        next.classList.add('example-code');
    });
}

// Copy code button functionality
function initCopyButtons() {
    document.querySelectorAll('pre code').forEach((block) => {
        if (block.parentElement.querySelector('.copy-code-button')) return;
        const button = document.createElement('button');
        button.className = 'copy-code-button absolute top-2 right-2 px-2 py-1 text-xs text-gray-400 hover:text-teal-400 bg-gray-900 rounded transition-colors';
        button.textContent = 'Copy';
        block.parentElement.style.position = 'relative';
        block.parentElement.appendChild(button);
        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent);
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        });
    });
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeArticleHtmlForDiff(html) {
    const parsed = new DOMParser().parseFromString(`<div id="diff-root">${html}</div>`, 'text/html');
    const root = parsed.getElementById('diff-root');
    if (!root) return html;

    root.querySelectorAll('.copy-code-button').forEach((button) => button.remove());
    root.querySelectorAll('pre[style]').forEach((pre) => {
        const style = pre.getAttribute('style') || '';
        const cleaned = style.replace(/position\s*:\s*relative;?/gi, '').trim();
        if (cleaned) {
            pre.setAttribute('style', cleaned);
        } else {
            pre.removeAttribute('style');
        }
    });

    return root.innerHTML;
}

function getCurrentDiffContext() {
    const pageProse = document.querySelector('article > .prose');
    if (pageProse) return { container: pageProse, sectionMode: false };
    const sectionProse = document.querySelector('article.prose');
    if (sectionProse) return { container: sectionProse, sectionMode: true };
    return null;
}

function extractComparableArticleHtml(root) {
    const pageProse = root.querySelector('article > .prose');
    if (pageProse) return normalizeArticleHtmlForDiff(pageProse.innerHTML);

    const sectionProse = root.querySelector('article.prose');
    if (sectionProse) {
        const clone = sectionProse.cloneNode(true);
        clone.querySelector('header.not-prose')?.remove();
        return normalizeArticleHtmlForDiff(clone.innerHTML);
    }

    return null;
}

function getCurrentArticleHtml() {
    const context = getCurrentDiffContext();
    if (!context) return '';

    const { container, sectionMode } = context;
    if (!sectionMode) {
        return normalizeArticleHtmlForDiff(container.dataset.originalHtml || container.innerHTML);
    }

    if (container.dataset.originalDiffHtml) {
        return normalizeArticleHtmlForDiff(container.dataset.originalDiffHtml);
    }
    const clone = container.cloneNode(true);
    clone.querySelector('header.not-prose')?.remove();
    return normalizeArticleHtmlForDiff(clone.innerHTML);
}

function restoreInlineArticleContent() {
    const context = getCurrentDiffContext();
    if (!context || !context.container.dataset.originalHtml) return;
    context.container.innerHTML = context.container.dataset.originalHtml;
    delete context.container.dataset.originalHtml;
    delete context.container.dataset.originalDiffHtml;
}

function buildComparePath(targetVersion) {
    const currentPath = window.location.pathname;
    if (!versionPattern.test(currentPath)) return null;
    return currentPath.replace(versionPattern, `${basePath}/${targetVersion}/`.replace(/\/{2,}/g, '/'));
}

async function getCompareVersionDiffLines(targetVersion) {
    const comparePath = buildComparePath(targetVersion);
    if (!comparePath) throw new Error('Current page does not include a version in the URL.');
    const absoluteCompareUrl = new URL(comparePath, window.location.origin).toString();

    const cacheKey = `${targetVersion}:${comparePath}`;
    if (versionDiffCache.has(cacheKey)) return versionDiffCache.get(cacheKey);

    const response = await fetch(absoluteCompareUrl, { headers: { 'Accept': 'text/html' } });
    if (!response.ok) throw new Error(`Could not load prior version page at ${absoluteCompareUrl}`);

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const compareHtml = extractComparableArticleHtml(parsed);
    if (!compareHtml) throw new Error(`No comparable article content found at ${absoluteCompareUrl}`);

    versionDiffCache.set(cacheKey, compareHtml);
    return compareHtml;
}

function renderInlineArticleDiff(diffHtml) {
    const context = getCurrentDiffContext();
    if (!context) return;
    const { container, sectionMode } = context;

    if (!container.dataset.originalHtml) {
        container.dataset.originalHtml = container.innerHTML;
        if (sectionMode) {
            const clone = container.cloneNode(true);
            clone.querySelector('header.not-prose')?.remove();
            container.dataset.originalDiffHtml = clone.innerHTML;
        }
    }

    if (sectionMode) {
        const header = container.querySelector('header.not-prose');
        const headerHtml = header ? header.outerHTML : '';
        container.innerHTML = `${headerHtml}${diffHtml}`;
        return;
    }

    container.innerHTML = diffHtml;
}

function countDiffMarkers(diffHtml) {
    const parsed = new DOMParser().parseFromString(diffHtml, 'text/html');
    return {
        added: parsed.querySelectorAll('ins, .diffins').length,
        removed: parsed.querySelectorAll('del, .diffdel').length
    };
}

function initVersionDiff() {
    const controls = document.getElementById('version-diff-controls');
    const popoverTrigger = document.getElementById('version-diff-popover-trigger');
    const popoverPanel = document.getElementById('version-diff-popover-panel');
    const toggle = document.getElementById('version-diff-toggle');
    const compareSelect = document.getElementById('version-diff-compare-version');
    const results = document.getElementById('version-diff-results');
    if (!controls || !popoverTrigger || !popoverPanel || !toggle || !compareSelect || !results) return;

    // Hide diff controls on full spec page
    const version = getVersionFromUrl();
    if (version && window.location.pathname.includes('/' + version + '/full')) {
        controls.style.display = 'none';
        return;
    }
    restoreInlineArticleContent();

    const currentVersion = getActiveVersion();
    const availableVersions = Array.from(new Set(
        Array.from(document.querySelectorAll('.version-dropdown-item'))
            .map((item) => item.getAttribute('data-version'))
            .filter(Boolean)
    )).sort((a, b) => compareVersions(b, a));
    const compareOptions = availableVersions.filter((version) => version !== currentVersion);
    const hasComparableVersion = compareOptions.length > 0 && Boolean(getVersionFromUrl());
    const diffStateKeys = {
        open: 'wdl-diff-open',
        applied: 'wdl-diff-applied',
        compareVersion: 'wdl-diff-compare-version'
    };
    const getDiffState = (key) => sessionStorage.getItem(key) || '';
    const setDiffState = (key, value) => sessionStorage.setItem(key, value);

    popoverPanel.classList.add('hidden');
    popoverTrigger.setAttribute('aria-expanded', 'false');
    if (hasComparableVersion) {
        compareSelect.innerHTML = compareOptions
            .map((version) => `<option value="${escapeHtml(version)}">Version ${escapeHtml(version)}</option>`)
            .join('');
        const storedCompareVersion = getDiffState(diffStateKeys.compareVersion);
        compareSelect.value = compareOptions.includes(storedCompareVersion) ? storedCompareVersion : compareOptions[0];
        setDiffState(diffStateKeys.compareVersion, compareSelect.value);
    } else {
        compareSelect.innerHTML = '<option value="">No compare version available</option>';
        setDiffState(diffStateKeys.applied, 'false');
    }
    compareSelect.disabled = !hasComparableVersion;
    results.classList.add('hidden');
    toggle.disabled = !hasComparableVersion;
    toggle.textContent = hasComparableVersion ? 'Show changes' : 'Unavailable';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.classList.toggle('opacity-60', !hasComparableVersion);
    toggle.classList.toggle('cursor-not-allowed', !hasComparableVersion);

    const closePopover = () => {
        popoverPanel.classList.add('hidden');
        popoverTrigger.setAttribute('aria-expanded', 'false');
        results.classList.add('hidden');
        toggle.textContent = hasComparableVersion ? 'Show changes' : 'Unavailable';
        toggle.setAttribute('aria-pressed', 'false');
        setDiffState(diffStateKeys.open, 'false');
        setDiffState(diffStateKeys.applied, 'false');
        restoreInlineArticleContent();
    };

    popoverTrigger.onclick = () => {
        const isClosed = popoverPanel.classList.contains('hidden');
        if (isClosed) {
            popoverPanel.classList.remove('hidden');
            popoverTrigger.setAttribute('aria-expanded', 'true');
            setDiffState(diffStateKeys.open, 'true');
            if (!hasComparableVersion) {
                results.classList.remove('hidden');
                results.innerHTML = '<div class="text-xs text-gray-700 dark:text-gray-100">Diff is available on versioned spec pages.</div>';
            }
            return;
        }
        closePopover();
    };

    const loadAndRenderDiff = async () => {
        const selectedVersion = compareSelect.value;
        setDiffState(diffStateKeys.compareVersion, selectedVersion);
        results.classList.remove('hidden');
        results.innerHTML = '<div class="text-sm text-gray-700 dark:text-gray-100">Loading diff...</div>';
        const currentHtml = getCurrentArticleHtml();
        try {
            if (!window.HtmlDiff || typeof window.HtmlDiff.execute !== 'function') {
                throw new Error('Diff library failed to load.');
            }
            const compareHtml = await getCompareVersionDiffLines(selectedVersion);
            const diffHtml = window.HtmlDiff.execute(compareHtml, currentHtml);
            renderInlineArticleDiff(diffHtml);
            const markerCounts = countDiffMarkers(diffHtml);
            results.innerHTML = `<div class="text-xs text-gray-700 dark:text-gray-100">Inline diff vs v${escapeHtml(selectedVersion)}: <span class="text-green-700 dark:text-green-300">+${markerCounts.added}</span> <span class="text-red-700 dark:text-red-300">-${markerCounts.removed}</span></div>`;
            setDiffState(diffStateKeys.applied, 'true');
            setDiffState(diffStateKeys.open, 'true');
        } catch (error) {
            const errorMessage = error?.message || 'Could not build diff.';
            const priorPageUnavailable = errorMessage.includes('Could not load prior version page at') || errorMessage.includes('No comparable article content found at');
            if (priorPageUnavailable && window.HtmlDiff && typeof window.HtmlDiff.execute === 'function') {
                const allAddedHtml = window.HtmlDiff.execute('', currentHtml);
                renderInlineArticleDiff(allAddedHtml);
                const markerCounts = countDiffMarkers(allAddedHtml);
                results.innerHTML = `<div class="text-xs text-gray-700 dark:text-gray-100">Inline diff vs v${escapeHtml(selectedVersion)}: <span class="text-green-700 dark:text-green-300">+${markerCounts.added}</span> <span class="text-red-700 dark:text-red-300">-0</span></div>`;
                setDiffState(diffStateKeys.applied, 'true');
                setDiffState(diffStateKeys.open, 'true');
                return;
            }
            results.innerHTML = `<div class="text-sm text-red-700 dark:text-red-300">${escapeHtml(errorMessage)}</div>`;
            setDiffState(diffStateKeys.applied, 'false');
        }
    };

    toggle.onclick = async () => {
        if (!hasComparableVersion) return;
        const isVisible = !results.classList.contains('hidden');
        if (isVisible) {
            results.classList.add('hidden');
            toggle.textContent = 'Show changes';
            toggle.setAttribute('aria-pressed', 'false');
            setDiffState(diffStateKeys.applied, 'false');
            setDiffState(diffStateKeys.open, 'true');
            restoreInlineArticleContent();
            return;
        }
        toggle.textContent = 'Hide changes';
        toggle.setAttribute('aria-pressed', 'true');
        await loadAndRenderDiff();
    };

    compareSelect.onchange = async () => {
        if (!hasComparableVersion) return;
        setDiffState(diffStateKeys.compareVersion, compareSelect.value);
        if (results.classList.contains('hidden')) return;
        await loadAndRenderDiff();
    };

    const shouldOpen = getDiffState(diffStateKeys.open) === 'true';
    const shouldApply = getDiffState(diffStateKeys.applied) === 'true';
    if (shouldOpen) {
        popoverPanel.classList.remove('hidden');
        popoverTrigger.setAttribute('aria-expanded', 'true');
        if (!hasComparableVersion) {
            results.classList.remove('hidden');
            results.innerHTML = '<div class="text-xs text-gray-700 dark:text-gray-100">Diff is available on versioned spec pages.</div>';
        }
    }
    if (shouldApply && hasComparableVersion) {
        toggle.textContent = 'Hide changes';
        toggle.setAttribute('aria-pressed', 'true');
        loadAndRenderDiff();
    }
}

// Search functionality
let searchInput = null;
let searchResults = null;
let searchIndex = null;
let selectedIndex = -1;

function getActiveVersion() {
    return getVersionFromUrl() || localStorage.getItem('wdl-version') || defaultVersion;
}

function isResultInVersion(resultUrl, version) {
    const path = resultUrl.replace(/^https?:\/\/[^\/]+/, '');
    const normalizedPath = path.endsWith('/') ? path : `${path}/`;
    const versionPrefix = `${basePath}/${version}/`.replace(/\/{2,}/g, '/');
    return normalizedPath.startsWith(versionPrefix);
}

async function loadSearchIndex() {
    if (searchIndex) return;

    // Check if index is already loaded (via script tag)
    if (window.searchIndex) {
        searchIndex = elasticlunr.Index.load(window.searchIndex);
        return;
    }

    // Dynamically load the search index script
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${basePath}/search_index.en.js`.replace(/\/{2,}/g, '/');
        script.onload = () => {
            if (window.searchIndex) {
                searchIndex = elasticlunr.Index.load(window.searchIndex);
                resolve();
            } else {
                reject(new Error('Search index not found'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load search index'));
        document.head.appendChild(script);
    });
}

function performSearch(query) {
    if (!searchResults) return;
    if (!searchIndex || !query.trim()) {
        hideResults();
        return;
    }

    const activeVersion = getActiveVersion();
    const results = searchIndex.search(query, {
        fields: { title: { boost: 2 }, body: { boost: 1 } },
        expand: true
    }).filter((result) => isResultInVersion(result.ref, activeVersion)).slice(0, 8);

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="px-4 py-3 text-sm text-gray-500 dark:text-gray-100" role="status">No results found</div>';
        showResults();
        return;
    }

    const html = results.map((result, index) => {
        const url = result.ref;
        // Try to get doc from documentStore, fall back to URL-based title
        let title = '';
        let snippet = '';

        const doc = searchIndex.documentStore?.getDoc(url);
        if (doc && doc.title) {
            title = doc.title;
            snippet = doc.body ? doc.body.substring(0, 120).replace(/\n/g, ' ') + '...' : '';
        } else {
            // Extract title from URL path
            const parts = url.split('/').filter(p => p);
            title = parts[parts.length - 1]?.replace(/-/g, ' ') || url;
            title = title.charAt(0).toUpperCase() + title.slice(1);
        }

        // Convert absolute URL to relative path
        const path = url.replace(/^https?:\/\/[^\/]+/, '');

        return `
            <a href="${path}" data-turbo-frame="${contentFrameId}" class="search-result block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 border-b border-gray-200 dark:border-gray-700 last:border-0 ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}" data-index="${index}" role="option" aria-selected="${index === selectedIndex}" tabindex="0">
                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">${title}</div>
                ${snippet ? `<div class="text-xs text-gray-500 dark:text-gray-100 mt-1 line-clamp-2">${snippet}</div>` : `<div class="text-xs text-gray-500 dark:text-gray-100 mt-1">${path}</div>`}
            </a>
        `;
    }).join('');

    searchResults.innerHTML = html;
    showResults();
}

function showResults() {
    searchResults?.classList.remove('hidden');
    searchInput?.setAttribute('aria-expanded', 'true');
}

function hideResults() {
    searchResults?.classList.add('hidden');
    searchInput?.setAttribute('aria-expanded', 'false');
    selectedIndex = -1;
}

function updateSelection(results) {
    results.forEach((el, i) => {
        el.classList.toggle('bg-gray-100', i === selectedIndex);
        el.classList.toggle('dark:bg-gray-700', i === selectedIndex);
    });
}

let debounceTimer;
function initSearch() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');

    if (searchInput && searchInput.dataset.bound !== 'true') {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('focus', loadSearchIndex);
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => performSearch(e.target.value), 300);
        });
        searchInput.addEventListener('keydown', (e) => {
            const results = searchResults?.querySelectorAll('.search-result') || [];
            if (results.length === 0) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
                updateSelection(results);
                results[selectedIndex]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelection(results);
                results[selectedIndex]?.focus();
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                results[selectedIndex].click();
            } else if (e.key === 'Escape') {
                hideResults();
                searchInput.blur();
            }
        });
    }

    if (searchResults && searchResults.dataset.bound !== 'true') {
        searchResults.dataset.bound = 'true';
        searchResults.addEventListener('keydown', (e) => {
            const results = searchResults?.querySelectorAll('.search-result') || [];
            if (results.length === 0) return;
            const currentIndex = Array.from(results).findIndex(el => el === document.activeElement);
            if (currentIndex === -1) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = Math.min(currentIndex + 1, results.length - 1);
                results[nextIndex]?.focus();
                selectedIndex = nextIndex;
                updateSelection(results);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentIndex === 0) {
                    searchInput?.focus();
                    selectedIndex = -1;
                } else {
                    const prevIndex = currentIndex - 1;
                    results[prevIndex]?.focus();
                    selectedIndex = prevIndex;
                    updateSelection(results);
                }
            } else if (e.key === 'Escape') {
                hideResults();
                searchInput?.focus();
            }
        });
    }
}

document.addEventListener('click', (e) => {
    if (!searchInput?.contains(e.target) && !searchResults?.contains(e.target)) {
        hideResults();
    }
});

// Keyboard shortcut: "/" to focus search
document.addEventListener('keydown', (e) => {
    // Only trigger if not already in an input/textarea
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput?.focus();
        loadSearchIndex();
    }
});

// Deduplicate heading IDs in full spec view by prefixing with chapter slug
function deduplicateFullSpecIds() {
    const content = document.querySelector('.full-spec-content');
    if (!content) return;

    const seen = new Set();
    content.querySelectorAll('[id]').forEach(el => {
        if (!seen.has(el.id)) {
            seen.add(el.id);
            return;
        }
        // Find the closest chapter or section ancestor to build a prefix
        const chapter = el.closest('.full-spec-chapter');
        if (!chapter) return;
        const section = el.closest('section[id]');
        const prefix = section ? section.id : chapter.id;
        const newId = prefix + '-' + el.id;
        // Update any anchor links pointing to this id
        const anchor = el.querySelector('a.zola-anchor[href="#' + el.id + '"]');
        if (anchor) anchor.setAttribute('href', '#' + newId);
        el.id = newId;
    });
}

// Full spec scroll-spy
function initFullSpecScrollSpy() {
    const toc = document.querySelector('[data-full-spec-toc]');
    if (!toc) return;

    const tocItems = toc.querySelectorAll('.full-spec-toc-item');
    if (!tocItems.length) return;

    const entries = [];
    tocItems.forEach(item => {
        const id = item.getAttribute('data-target');
        const el = document.getElementById(id);
        if (el) entries.push({ el, tocItem: item });
    });

    if (!entries.length) return;

    const activeClass = 'text-teal-600';
    const darkActiveClass = 'dark:text-teal-400';
    let current = null;

    const update = () => {
        let best = null;
        for (const entry of entries) {
            const rect = entry.el.getBoundingClientRect();
            if (rect.top <= 100) {
                best = entry;
            } else {
                break;
            }
        }
        if (!best) best = entries[0];
        if (best && best.tocItem !== current) {
            if (current) {
                current.classList.remove(activeClass, darkActiveClass, 'font-medium');
            }
            best.tocItem.classList.add(activeClass, darkActiveClass, 'font-medium');
            current = best.tocItem;
            current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            const id = best.el.id;
            if (id && window.location.hash !== '#' + id) {
                history.replaceState(null, '', '#' + id);
            }
        }
    };

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => { update(); ticking = false; });
            ticking = true;
        }
    };
    window.addEventListener('scroll', onScroll);
    document.querySelector('main')?.addEventListener('scroll', onScroll);
    update();
}

// View switcher (Sections <-> Full Spec)
function initViewSwitcher() {
    const switcher = document.getElementById('view-switcher');
    const sectionsBtn = document.getElementById('view-sections');
    const fullBtn = document.getElementById('view-full');
    if (!switcher || !sectionsBtn || !fullBtn) return;

    const path = window.location.pathname;
    const version = getVersionFromUrl();
    if (!version) return;

    const isFullSpec = path.includes('/' + version + '/full');
    const versionBase = basePath + '/' + version;

    switcher.classList.remove('sm:hidden');
    switcher.classList.add('sm:flex');

    const activeClasses = ['bg-gray-200', 'dark:bg-gray-600', 'text-gray-900', 'dark:text-white', 'font-medium', 'shadow-sm'];
    const inactiveClasses = ['text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200'];
    const allClasses = [...activeClasses, ...inactiveClasses];

    // Reset both buttons before applying new state
    [sectionsBtn, fullBtn].forEach(btn => {
        btn.classList.remove(...allClasses);
        btn.removeAttribute('aria-selected');
        btn.style.cursor = '';
        btn.setAttribute('tabindex', '0');
    });

    const [activeBtn, inactiveBtn] = isFullSpec ? [fullBtn, sectionsBtn] : [sectionsBtn, fullBtn];
    activeBtn.classList.add(...activeClasses);
    activeBtn.setAttribute('aria-selected', 'true');
    activeBtn.setAttribute('tabindex', '0');
    activeBtn.removeAttribute('href');
    activeBtn.style.cursor = 'default';
    inactiveBtn.classList.add(...inactiveClasses);
    inactiveBtn.setAttribute('aria-selected', 'false');
    inactiveBtn.setAttribute('tabindex', '0');

    // Keyboard support: navigate on Enter or Space
    inactiveBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (inactiveBtn.href) window.location.href = inactiveBtn.href;
        }
    });

    // Disable Turbo entirely on switcher links so anchors work on full page loads
    sectionsBtn.setAttribute('data-turbo', 'false');
    fullBtn.setAttribute('data-turbo', 'false');

    if (isFullSpec) {
        sectionsBtn.href = versionBase + '/introduction/';

        // Build id→section-page-path map from TOC data attributes
        const idToHref = new Map();
        document.querySelectorAll('.full-spec-toc-item[data-target][data-section-path]').forEach(item => {
            idToHref.set(item.getAttribute('data-target'), basePath + item.getAttribute('data-section-path'));
        });

        const updateSectionsLink = () => {
            const sections = document.querySelectorAll('.full-spec-chapter, .full-spec-content section[id]');
            let best = null;
            for (const section of sections) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 120) {
                    best = section;
                } else {
                    break;
                }
            }
            if (!best) return;

            const href = idToHref.get(best.id);
            if (href) {
                sectionsBtn.href = href;
            } else {
                sectionsBtn.href = versionBase + '/introduction/';
            }
        };

        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => { updateSectionsLink(); ticking = false; });
                ticking = true;
            }
        };
        document.querySelector('main')?.addEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll);
    } else {
        const afterVersion = path.replace(new RegExp('^' + escapedBasePath + '/' + version + '/'), '');
        const anchor = afterVersion.replace(/\//g, '-').replace(/-$/, '');
        fullBtn.href = versionBase + '/full/' + (anchor ? '#' + anchor : '');
    }
}

// Settings dropdown
function initSettingsDropdown() {
    const toggle = document.getElementById('settings-toggle');
    const panel = document.getElementById('settings-panel');
    if (!toggle || !panel) return;
    if (toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    toggle.addEventListener('click', () => {
        const isOpen = !panel.classList.contains('hidden');
        if (isOpen) {
            panel.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            panel.classList.remove('hidden');
            toggle.setAttribute('aria-expanded', 'true');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#settings-dropdown')) {
            panel.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

function initializePage() {
    const urlVersion = getVersionFromUrl();
    const currentVersion = urlVersion || localStorage.getItem('wdl-version') || defaultVersion;
    localStorage.setItem('wdl-version', currentVersion);
    if (currentVersion !== defaultVersion) rewriteVersionedLinks(currentVersion);
    updateVersionVisibility(currentVersion);
    updateDropdownDisplay(currentVersion);
    initThemeToggle();
    initMobileSidebar();
    initSidebarNavigation();
    initSmoothScroll();
    initCopyButtons();
    initExampleLabels();
    initVersionDiff();
    initSearch();
    deduplicateFullSpecIds();
    initFullSpecScrollSpy();
    initViewSwitcher();
    initSettingsDropdown();
}

initializePage();
document.addEventListener('turbo:load', initializePage);
document.addEventListener('turbo:frame-load', (event) => {
    if (event.target.id !== contentFrameId) return;
    const currentVersion = getVersionFromUrl() || localStorage.getItem('wdl-version') || defaultVersion;
    rewriteVersionedLinks(currentVersion);
    updateVersionVisibility(currentVersion);
    updateDropdownDisplay(currentVersion);
    initSidebarNavigation();
    initSmoothScroll();
    initCopyButtons();
    initExampleLabels();
    initVersionDiff();
    deduplicateFullSpecIds();
    initFullSpecScrollSpy();
    initViewSwitcher();
    initSettingsDropdown();
});
document.addEventListener('turbo:before-cache', () => {
    hideResults();
    restoreInlineArticleContent();
});
