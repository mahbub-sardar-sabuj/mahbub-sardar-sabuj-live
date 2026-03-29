# Mahbub Sardar Sabuj Website Migration — TODO

## Phase 1: Core Migration & Structure
- [x] Initialize tRPC-based web project template
- [x] Copy original components (Navbar, Footer, ErrorBoundary)
- [x] Copy original styling (index.css with color scheme and fonts)
- [x] Copy original context (ThemeContext)
- [x] Migrate Home page with all sections (Hero, Stats, About, Book, Gallery, News, Contact)
- [x] Migrate Writings page with all categories and content
- [x] Set up routing structure (/, /writings, /404)

## Phase 2: Design & Styling Fidelity
- [x] Verify all colors match original (Navy #0D1B2A, Gold #D4A843, Cream #FDF6EC)
- [x] Verify fonts are loaded correctly (Tiro Bangla, Noto Sans Bengali, DM Serif Display, Space Grotesk)
- [x] Ensure all animations and transitions work (Framer Motion)
- [x] Test responsive design on mobile, tablet, desktop
- [x] Verify dark theme sections render correctly

## Phase 3: Content & Functionality
- [x] Verify all CDN image URLs are intact and loading
- [x] Test all internal navigation links (anchor links, page navigation)
- [x] Test all external links (social media, book purchase, email)
- [x] Verify gallery lightbox functionality
- [x] Verify news/updates section displays correctly
- [x] Test mobile menu functionality

## Phase 4: SEO & Bengali Language Support
- [x] Configure meta tags in index.html (title, description, og tags)
- [x] Add Bengali language meta tag (lang="bn")
- [x] Add structured data (JSON-LD) for author/writer
- [x] Set up robots.txt for Google indexing
- [x] Verify Google Analytics integration
- [x] Test SEO with Google Search Console

## Phase 5: Testing & Verification
- [x] Test all pages in browser (Chrome, Firefox, Safari)
- [x] Verify no console errors or warnings
- [ ] Test form submissions (contact form if present)
- [x] Verify page load performance
- [x] Test accessibility (keyboard navigation, screen readers)

## Phase 6: Deployment
- [x] Create checkpoint before deployment
- [x] Deploy to live hosting
- [x] Verify live site matches original design
- [x] Submit sitemap to Google Search Console
- [x] Monitor analytics and traffic

## Known Issues & Notes
- Original site uses hard-coded inline styles; preserved for fidelity
- All images are CDN-hosted; no local image storage
- Navigation uses both anchor links (#) and page routes (/writings)
- Theme context set to "light" but visual design uses dark sections
