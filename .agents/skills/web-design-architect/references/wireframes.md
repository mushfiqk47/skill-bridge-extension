# Reference Guide: UI Wireframes & Page Builders

This document details the low-fidelity structural components, flowchart modules, and website builder wireframe blocks. Use these blocks to map out sitemaps and compile page layouts.

---

## Part 1: Page-Level Wireframe Columns

When architecting a page structure, select and stack blocks from these 8 functional categories:

### 1. Header Menu
*   **Logo Left, Nav Center, CTAs Right:** Classic navigation header.
*   **Split Navigation:** Centered logo with split links on left/right.
*   **Search Integrated Header:** Header featuring a prominent center input.
*   **Compact burger-menu Header:** Compact header for mobile-first screen widths.
*   **Mega Dropdown Drawer:** Expandable horizontal panels displaying multiple link grids, promotion cards, or media alerts on hover.
*   **Structural HTML Pattern:**
    ```html
    <header class="header">
      <div class="logo">Brand</div>
      <nav class="nav-links">
        <a href="#">Features</a>
        <a href="#">Pricing</a>
      </nav>
      <div class="header-actions">
        <button class="btn btn-secondary">Log In</button>
        <button class="btn btn-primary">Sign Up</button>
      </div>
    </header>
    ```

### 2. Hero, Media & Sliders
*   **Hero Visual Background:** Full-width image background with overlay title.
*   **Asymmetric Split Hero:** Text block left, mockup/video frame right.
*   **Slideshow Slider:** Banner featuring left/right nav arrows and pagination dots.
*   **Video Playlist Showcase:** Featured player flanked by a vertical playlist feed.
*   **Structural HTML Pattern (Split Hero):**
    ```html
    <section class="hero-split">
      <div class="hero-content">
        <h1>Transform Your Workflow</h1>
        <p>A simple dashboard to track metric results in real-time.</p>
        <button class="btn btn-primary">Get Started</button>
      </div>
      <div class="hero-media-wrapper">
        <div class="media-placeholder video-player"></div>
      </div>
    </section>
    ```

### 3. E-Shop (E-commerce)
*   **Product Card Grid:** Modular cards showing images, titles, ratings, prices, and CTA.
*   **Faceted Catalog Search:** Sidebar containing category filters (checkboxes, price sliders) paired with product results.
*   **Wishlist Drawer:** Drawer tracking saved items with quick remove/cart buttons.
*   **Shopping Cart Summary:** Checkout checklist highlighting selected items, quantity selectors, pricing, and total.
*   **Payment Gateway Form:** Payment form fields (card number, billing details, submit checkout).
*   **Structural HTML Pattern (Product Grid):**
    ```html
    <div class="products-grid">
      <article class="product-card">
        <div class="product-image-wrapper"></div>
        <h3>Premium Matte Bottle</h3>
        <p class="price">$24.00</p>
        <button class="btn btn-primary btn-sm">Add to Cart</button>
      </article>
    </div>
    ```

### 4. Registration, Utilities & Board
*   **Simple Login/Register forms:** Stacked credential inputs, recovery links, and social oauth buttons.
*   **Newsletter Subscribe Card:** Single input box with a high-contrast action button.
*   **Dashboard Board (Kanban):** Columns representing task lanes (To Do, Doing, Done) with drag cards.
*   **404 Error Page:** Centered vector icon (e.g. rocket/shuttle) with back-to-home button.

### 5. Blog & Magazines (Editorial)
*   **Blog Card Feed:** Vertical list of posts with small thumbnails and metadata (author, date).
*   **Magazine Column Grid:** Dynamic news grid featuring a large prominent article block and side text headlines.
*   **News Ticker Feed:** High-density vertical timeline of text headlines.

### 6. Articles & Written Content
*   **Post Details Layout:** Clean text column featuring author profile avatar, date, subheadings, pull-quotes, and paragraphs.
*   **Text Blocks:**
    *   1-column full width paragraphs.
    *   2-column or 3-column text sheets.
    *   Checklists, bullet points, and high-visibility lead text.

### 7. Portfolio (Creative Portals)
*   **Mixed Portfolio Grid:** Layout showing cards with photography, tagging categories, project details, and hover-state overlays.
*   **Masonry Gallery:** Infinite height photo grids packing items tightly.
*   **Project Detail View:** Case studies displaying hero image banners, tag columns, description text, and statistics charts.

### 8. Device Frames & Connectors
*   **Mockup Outlines:** Browser frame, Laptop frame, Tablet frame, Mobile phone frame.
*   **Flowchart Badges:** Step Indicators (1-9), Connector lines, arrows.

---

## Part 2: Page Block Stack Recipes

When building page templates, stack wireframe blocks in these recommended combinations:

*   **SaaS Landing Page:**
    1. Header (Logo left, Nav center)
    2. Split Hero (Text left, Mockup/Video right)
    3. Logo Cloud (Partners)
    4. 3-Column Features (with icons)
    5. Pricing Comparison Matrix
    6. FAQ Accordion Grid
    7. Newsletter Subscribe card
    8. Footer
*   **E-Commerce Shop page:**
    1. Sticky Header (with cart icon indicator)
    2. Faceted Catalog (Left Filter Sidebar + Right Product Grid)
    3. Newsletter panel
    4. Footer
*   **Company About / Team Page:**
    1. Sticky Header
    2. Hero Banner (centered title)
    3. Company Bio (Asymmetrical Split text/image)
    4. Team Grid (Avatars + bio description cards)
    5. Core Values (3 columns)
    6. Footer
