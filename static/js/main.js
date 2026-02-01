// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIconDark = document.getElementById('theme-icon-dark');
const themeIconLight = document.getElementById('theme-icon-light');

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    themeIconDark?.classList.toggle('hidden', !isDark);
    themeIconLight?.classList.toggle('hidden', isDark);
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
const navLinks = document.querySelectorAll('.sidebar-link[data-path]');

const activeSections = new Set();

// Normalize path by ensuring it has a trailing slash
const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';

// Check regular links
navLinks.forEach(link => {
  const linkPath = link.getAttribute('data-path');

  // Only highlight if exact match
  if (normalizedCurrentPath === linkPath) {
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
