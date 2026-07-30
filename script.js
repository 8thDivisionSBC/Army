(() => {
    'use strict';

    // ===== DOM ELEMENTS =====
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('section[id]');
    const menuGrid = document.getElementById('menu-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const currentYearSpan = document.getElementById('current-year');
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    let lightboxImages = [];
    let currentLightboxIndex = 0;

    // ===== SET CURRENT YEAR =====
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ===== NAVBAR SCROLL EFFECT =====
    const updateNavbar = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // ===== ACTIVE NAV LINK ON SCROLL =====
    const setActiveNavLink = () => {
        let currentSectionId = '';
        const scrollPos = window.scrollY + 120;

        allSections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinkItems.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSectionId) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', setActiveNavLink, { passive: true });

    // ===== MOBILE HAMBURGER MENU =====
    hamburger.addEventListener('click', () => {
        const isActive = navLinks.classList.contains('active');
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', !isActive);
    });

    // Close mobile menu when a link is clicked
    navLinkItems.forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });

    // ===== MENU FILTERING =====
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            menuCards.forEach((card) => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ===== "ASK ABOUT THIS ITEM" BUTTONS =====
    document.querySelectorAll('.btn-ask').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.menu-card');
            const itemName = card ? card.querySelector('h3').textContent : 'this item';
            alert(
                `Thank you for your interest in "${itemName}"!\n\nPlease visit us at 2021 Yonge St, Toronto, or message us on Instagram @lasalumeriatoronto for pricing and availability.`
            );
        });
    });

    // ===== GALLERY LIGHTBOX =====
    const updateLightboxImages = () => {
        lightboxImages = Array.from(
            galleryGrid.querySelectorAll('.gallery-item img')
        ).map((img) => ({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
        }));
    };
    updateLightboxImages();

    const openLightbox = (index) => {
        if (lightboxImages.length === 0) return;
        currentLightboxIndex = index;
        const image = lightboxImages[currentLightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const prevLightboxImage = () => {
        if (lightboxImages.length === 0) return;
        currentLightboxIndex =
            (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        const image = lightboxImages[currentLightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
    };

    const nextLightboxImage = () => {
        if (lightboxImages.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
        const image = lightboxImages[currentLightboxIndex];
        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
    };

    galleryGrid.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (!galleryItem) return;
        const img = galleryItem.querySelector('img');
        if (!img) return;
        const index = lightboxImages.findIndex((item) => item.src === img.getAttribute('src'));
        if (index !== -1) {
            openLightbox(index);
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevLightboxImage);
    lightboxNext.addEventListener('click', nextLightboxImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevLightboxImage();
                break;
            case 'ArrowRight':
                nextLightboxImage();
                break;
            default:
                break;
        }
    });

    // ===== SCROLL REVEAL ANIMATIONS =====
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.getAttribute('data-delay');
                    if (delay) {
                        el.style.transitionDelay = `${parseInt(delay) * 0.1}s`;
                    } else {
                        el.style.transitionDelay = '0s';
                    }
                    el.classList.add('revealed');
                    revealObserver.unobserve(el);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    revealElements.forEach((el) => {
        revealObserver.observe(el);
    });

    // ===== INITIAL LOAD ACTIONS =====
    // Ensure active nav link is set on load
    setActiveNavLink();

    // Log ready message
    console.log('🥖 La Salumeria — Website ready. Benvenuti!');
})();