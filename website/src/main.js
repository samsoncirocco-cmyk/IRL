import './style.css'
import { renderNavbar } from './components/navbar.js'
import { renderFooter } from './components/footer.js'

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});
