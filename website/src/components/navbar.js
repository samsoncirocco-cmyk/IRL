export function renderNavbar() {
    const nav = document.createElement('nav');
    nav.className = 'glass navbar';
    nav.innerHTML = `
    <div class="container nav-container">
      <a href="/" class="logo">IRL</a>
      <ul class="nav-links">
        <li><a href="/features.html">Features</a></li>
        <li><a href="/pricing.html">Pricing</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/community.html">Community</a></li>
        <li><a href="https://github.com/your-repo/irl" class="btn btn-primary">GitHub</a></li>
      </ul>
    </div>
  `;
    document.body.prepend(nav);
}
