// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIconDark = document.getElementById('theme-icon-dark');
const themeIconLight = document.getElementById('theme-icon-light');

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    // Show sun in dark mode (to switch to light), moon in light mode (to switch to dark)
    themeIconDark?.classList.toggle('hidden', isDark);
    themeIconLight?.classList.toggle('hidden', !isDark);
}

updateThemeIcons();

themeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons();
});

// Mobile sidebar toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileSidebar = document.getElementById('mobile-sidebar');
const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

function openMobileSidebar() {
  mobileSidebar?.classList.remove('hidden');
}

function closeMobileSidebar() {
  mobileSidebar?.classList.add('hidden');
}

mobileMenuButton?.addEventListener('click', openMobileSidebar);
mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
mobileSidebarOverlay?.addEventListener('click', closeMobileSidebar);

// Active navigation highlighting
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.sidebar-link[href]');

const activeSections = new Set();

// Normalize path by ensuring it has a trailing slash
const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';

// Check regular links
navLinks.forEach(link => {
  // Get the pathname from the link's href (handles base URL automatically)
  const linkPath = new URL(link.href).pathname;
  const normalizedLinkPath = linkPath.endsWith('/') ? linkPath : linkPath + '/';

  // Only highlight if exact match
  if (normalizedCurrentPath === normalizedLinkPath) {
    link.classList.add('sidebar-link-active');

    // Walk up the DOM tree and collect all parent sections
    let element = link;
    while (element) {
      element = element.parentElement;
      if (element && element.classList && element.classList.contains('sidebar-section')) {
        const sectionName = element.getAttribute('data-section');
        if (sectionName) {
          activeSections.add(sectionName);
        }
      }
    }
  }
});

// Sidebar accordion functionality
const sidebarSections = document.querySelectorAll('.sidebar-section');

sidebarSections.forEach(section => {
  const chevronButton = section.querySelector('.chevron-toggle');
  const content = section.querySelector('.sidebar-content');
  const chevron = section.querySelector('.sidebar-chevron');
  const sectionName = section.getAttribute('data-section');

  // Open the section if it or any of its ancestors are active
  if (activeSections.has(sectionName)) {
    content.classList.remove('hidden');
    // When open, chevron should point down
    chevron.classList.remove('chevron-closed');
    chevron.classList.add('chevron-open');
    chevron.style.transition = 'none';
    setTimeout(() => {
      chevron.style.transition = '';
    }, 0);
  } else {
    // When closed, chevron should point right
    chevron.classList.remove('chevron-open');
    chevron.classList.add('chevron-closed');
  }

  chevronButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = !content.classList.contains('hidden');

    if (isOpen) {
      // Closing: hide content and point chevron right
      content.classList.add('hidden');
      chevron.classList.remove('chevron-open');
      chevron.classList.add('chevron-closed');
    } else {
      // Opening: show content and point chevron down
      content.classList.remove('hidden');
      chevron.classList.remove('chevron-closed');
      chevron.classList.add('chevron-open');
    }
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Copy code button functionality
document.querySelectorAll('pre code').forEach((block) => {
  const button = document.createElement('button');
  button.className = 'absolute top-2 right-2 px-2 py-1 text-xs text-gray-400 hover:text-teal-400 bg-gray-900 rounded transition-colors';
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

// Search functionality
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchIndex = null;
let selectedIndex = -1;

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
    if (!searchIndex || !query.trim()) {
        hideResults();
        return;
    }

    const results = searchIndex.search(query, {
        fields: { title: { boost: 2 }, body: { boost: 1 } },
        expand: true
    }).slice(0, 8);

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
            <a href="${path}" class="search-result block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 border-b border-gray-200 dark:border-gray-700 last:border-0 ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}" data-index="${index}" role="option" aria-selected="${index === selectedIndex}" tabindex="0">
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

searchInput?.addEventListener('focus', loadSearchIndex);

let debounceTimer;
searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(e.target.value), 300);
});

searchInput?.addEventListener('keydown', (e) => {
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

// Allow arrow key navigation within search results
searchResults?.addEventListener('keydown', (e) => {
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
