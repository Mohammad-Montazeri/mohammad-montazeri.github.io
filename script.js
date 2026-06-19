document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling active links highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

// Search Toggle and Functionality
const searchToggle = document.getElementById('search-toggle');
const searchInput = document.getElementById('search-input');
const contentAreas = document.querySelectorAll('.content-area');

// Toggle search input visibility
searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.classList.toggle('active');
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    }
});

// Hide search input if clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchInput.classList.remove('active');
    }
});

// Live filter text as user types
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();

    contentAreas.forEach(section => {
        const structuralElements = section.querySelectorAll('p, .project-title, h1, h3, h4, li');
        let hasMatch = false;

        structuralElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            
            if (query === '') {
                // Reset styling if query is empty
                element.style.opacity = '1';
                section.style.display = 'block';
            } else if (text.includes(query)) {
                element.style.opacity = '1';
                hasMatch = true;
            } else {
                element.style.opacity = '0.3'; // Fade out non-matching elements
            }
        });

        // Hide entire section if absolutely nothing matches
        if (query !== '' && !hasMatch) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
});
});