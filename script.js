/**
 * Portfolio Interaction Script
 * Handles navigation active states, scroll animations, sticky header, 
 * and mobile navigation toggling.
 */

// ==========================================
// 1. DOM Element Caching
// ==========================================
// Cache DOM selections at the top level to avoid querying the DOM repeatedly during scroll events.
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const header = document.querySelector('header');
const footer = document.querySelector('footer');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('header nav a');

// Map to associate section IDs with their corresponding navigation link.
// This allows O(1) link highlighting lookup without executing querySelector queries during scrolls.
const navLinksMap = {};
navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
        const id = href.substring(1);
        if (id) {
            navLinksMap[id] = link;
        }
    }
});

// Variable to track the currently active section ID to prevent redundant class list edits.
let currentActiveSectionId = '';

// ==========================================
// 2. Mobile Menu Toggle
// ==========================================
// Toggles the hamburger icon shape and opens/closes the menu drawer.
menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// ==========================================
// 3. Scroll Handler (Optimized & Throttled)
// ==========================================
/**
 * Main scroll logic. Handles sticky header toggling, section active links,
 * scroll animations, and footer reveal.
 */
const handleScroll = () => {
    const top = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollHeight = document.scrollingElement.scrollHeight;

    // A. Header: Toggle sticky class when scrolled past 100px
    header.classList.toggle('sticky', top > 100);

    // B. Section Animations & Active Navbar Highlighting
    sections.forEach(sec => {
        const offset = sec.offsetTop - 100;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');

        // Check if the current scroll position is within the boundaries of this section
        if (top >= offset && top < offset + height) {
            // Highlight navigation link if active section has changed
            if (currentActiveSectionId !== id) {
                currentActiveSectionId = id;
                
                // Clear active class from all links and set it on the current link
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLinksMap[id]) {
                    navLinksMap[id].classList.add('active');
                }
            }

            // Trigger enter scroll animation
            sec.classList.add('show-animate');
        }
    });

    // C. Close Mobile Navigation Menu on Scroll (Only if it's currently open)
    if (navbar.classList.contains('active')) {
        menuIcon.classList.remove('bx-x');
        navbar.classList.remove('active');
    }

    // D. Footer Animation: Trigger show-animate when scrolled close to the bottom
    const isAtBottom = (windowHeight + top) >= (scrollHeight - 15);
    footer.classList.toggle('show-animate', isAtBottom);
};

// E. Scroll Listener Throttling using requestAnimationFrame.
// Prevents scroll events from firing too fast, avoiding layout thrashing.
let scrollScheduled = false;

window.onscroll = () => {
    if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(() => {
            handleScroll();
            scrollScheduled = false;
        });
    }
};

// Trigger handleScroll once on load to initialize active states correctly.
window.addEventListener('DOMContentLoaded', handleScroll);

// ==========================================
// 4. Certificate Fullscreen Lightbox
// ==========================================
// When a certificate card's overlay is clicked, open the certificate image
// in a fullscreen lightbox modal for easy viewing.

const lightbox = document.getElementById('cert-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

// Attach click listeners to all certificate overlay buttons
document.querySelectorAll('.cert-overlay-view').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();

        // Find the sibling <img> inside the same .cert-img-wrap parent
        const imgSrc = overlay.parentElement.querySelector('img').src;

        // Set the lightbox image source and show the modal
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');

        // Prevent background page from scrolling while modal is open
        document.body.style.overflow = 'hidden';
    });
});

// Close lightbox when clicking the X button
lightboxClose.addEventListener('click', closeLightbox);

// Close lightbox when clicking on the dark backdrop (outside the image)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Close lightbox on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

/**
 * Closes the lightbox modal and restores page scrolling.
 */
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
}