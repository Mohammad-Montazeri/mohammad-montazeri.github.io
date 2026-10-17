document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.navbar');
    const sections = [...document.querySelectorAll('.content-area')];
    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const progress = document.getElementById('reading-progress-fill');
    let framePending = false;

    function updatePageState() {
        framePending = false;
        const headerHeight = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
        progress.style.transform = 'scaleX(' + fraction + ')';
        const visible = sections.filter(section => !section.hidden);
        let current = visible[0]?.id;
        for (const section of visible) {
            if (section.getBoundingClientRect().top <= headerHeight + 48) current = section.id;
        }
        if (distance > 0 && window.scrollY >= distance - 2) current = visible.at(-1)?.id;
        navLinks.forEach(link => {
            const active = link.getAttribute('href') === '#' + current;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
    function schedulePageUpdate() {
        if (!framePending) { framePending = true; requestAnimationFrame(updatePageState); }
    }
    window.addEventListener('scroll', schedulePageUpdate, { passive: true });
    window.addEventListener('resize', schedulePageUpdate);
    new ResizeObserver(schedulePageUpdate).observe(document.body);
    updatePageState();
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    if (location.hash === '#research') document.getElementById('projects').scrollIntoView();

    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('search-input');
    function filterSections() {
        const query = searchInput.value.toLowerCase().trim();
        sections.forEach(section => {
            section.hidden = !!query && !section.textContent.toLowerCase().includes(query);
        });
        document.querySelectorAll('.section-divider').forEach(divider => {
            const next = divider.nextElementSibling;
            divider.hidden = !!query && (!next || next.hidden);
        });
        schedulePageUpdate();
    }
    function closeSearch() {
        searchInput.classList.remove('active');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchInput.value = '';
        filterSections();
    }
    searchToggle.addEventListener('click', () => {
        if (searchInput.classList.contains('active')) closeSearch();
        else {
            searchInput.classList.add('active');
            searchToggle.setAttribute('aria-expanded', 'true');
            searchInput.focus();
        }
    });
    searchInput.addEventListener('input', filterSections);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Escape') { closeSearch(); searchToggle.focus(); }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.search-container')) closeSearch();
    });

    const carousel = document.querySelector('.research-carousel');
    const track = carousel.querySelector('.carousel-track');
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    const dots = [...carousel.querySelectorAll('.carousel-dot')];
    const status = carousel.querySelector('.carousel-status');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, paused = reducedMotion.matches, hovered = false, focused = false, inView = true;
    let timer, touchStart = null;
    function updateTimer() {
        clearInterval(timer);
        if (!paused && !hovered && !focused && inView && !document.hidden) {
            timer = setInterval(() => showSlide(current + 1, false), 6000);
        }
    }
    function showSlide(index, manual = true) {
        current = (index + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + current * 100 + '%)';
        slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', String(i !== current));
            slide.inert = i !== current;
            if (i === current) dots[i].setAttribute('aria-current', 'true');
            else dots[i].removeAttribute('aria-current');
        });
        if (manual) {
            paused = true;
            status.textContent = 'Image ' + (current + 1) + ' of ' + slides.length + ': ' + slides[current].querySelector('figcaption').textContent;
        }
        updateTimer();
    }
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    carousel.querySelectorAll('[data-direction]').forEach(button => {
        button.addEventListener('click', () => showSlide(current + Number(button.dataset.direction)));
    });
    carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showSlide(current + (event.key === 'ArrowLeft' ? -1 : 1));
        }
    });
    carousel.addEventListener('mouseenter', () => { hovered = true; updateTimer(); });
    carousel.addEventListener('mouseleave', () => { hovered = false; updateTimer(); });
    carousel.addEventListener('focusin', () => { focused = true; updateTimer(); });
    carousel.addEventListener('focusout', event => { focused = carousel.contains(event.relatedTarget); updateTimer(); });
    carousel.addEventListener('touchstart', event => {
        touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }, { passive: true });
    carousel.addEventListener('touchend', event => {
        if (!touchStart) return;
        const dx = event.changedTouches[0].clientX - touchStart.x, dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showSlide(current + (dx < 0 ? 1 : -1));
        touchStart = null;
    }, { passive: true });
    carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
    document.addEventListener('visibilitychange', updateTimer);
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) paused = true;
        updateTimer();
    });
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updateTimer(); }).observe(carousel);
    carousel.classList.add('carousel-ready');
    carousel.querySelector('.carousel-controls').hidden = false;
    showSlide(0, false);
});
