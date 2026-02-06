export function renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'glass navbar';
    nav.innerHTML = `
    <div class="container nav-container">
      <a href="/" class="logo">IRL</a>
      <div class="nav-links-wrapper">
        <button class="mobile-menu-btn" aria-label="Toggle menu">☰</button>
        <ul class="nav-links">
          <li><a href="/features.html">Features</a></li>
          <li><a href="/pricing.html">Pricing</a></li>
          <li><a href="/blog.html">Blog</a></li>
          <li><a href="/community.html">Community</a></li>
          <li><a href="https://github.com/samson/irl" class="btn btn-primary">GitHub</a></li>
        </ul>
      </div>
    </div>
  `;

    document.body.prepend(nav);

    // Mobile menu toggle
    const btn = nav.querySelector('.mobile-menu-btn');
    const links = nav.querySelector('.nav-links');
    if (btn && links) {
        btn.addEventListener('click', () => {
            links.classList.toggle('nav-open');
        });
    }
}
