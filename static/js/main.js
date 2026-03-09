// Version handling
const defaultVersion = window.DEFAULT_VERSION || '1.2';
const basePath = (() => {
    try { return new URL(window.BASE_URL).pathname.replace(/\/$/, ''); }
    catch { return ''; }
})();
const versionPattern = new RegExp('^' + basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/([\\d.]+)/');
const contentFrameId = 'content-frame';


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
        if (versionPattern.test(href)) {
            link.setAttribute('href', href.replace(versionPattern, basePath + '/' + targetVersion + '/'));
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

function selectVersion(btn) {
    const newVersion = btn.getAttribute('data-version');
    localStorage.setItem('wdl-version', newVersion);
    closeAllVersionMenus();
    const urlVersion = getVersionFromUrl();
    if (urlVersion) {
        window.location.href = window.location.pathname.replace(versionPattern, basePath + '/' + newVersion + '/');
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
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle || themeToggle.dataset.bound === 'true') return;
    themeToggle.dataset.bound = 'true';
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
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
        const baseUrl = window.BASE_URL || '';
        script.src = baseUrl + '/search_index.en.js';
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
    initSearch();
}

initializePage();
document.addEventListener('turbo:load', initializePage);
document.addEventListener('turbo:frame-load', (event) => {
    if (event.target.id !== contentFrameId) return;
    const currentVersion = getVersionFromUrl() || localStorage.getItem('wdl-version') || defaultVersion;
    updateVersionVisibility(currentVersion);
    initSidebarNavigation();
    initSmoothScroll();
    initCopyButtons();
});
document.addEventListener('turbo:before-cache', hideResults);
