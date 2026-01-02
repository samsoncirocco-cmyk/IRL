export function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
    <div class="container">
      <div class="footer-grid grid grid-3">
        <div>
          <h3>IRL</h3>
          <p>Integration Resilience Layer. The Universal Governance Layer for AI and Microservices.</p>
        </div>
        <div>
          <h4>Resources</h4>
          <ul>
            <li><a href="/blog.html">Blog</a></li>
            <li><a href="https://github.com/your-repo/irl">Documentation</a></li>
            <li><a href="/community.html">Community</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="/pricing.html">Pricing</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 IRL Project. All rights reserved.</p>
      </div>
    </div>
  `;
    document.body.appendChild(footer);
}
