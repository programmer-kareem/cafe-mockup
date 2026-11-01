const burger = document.getElementById('burger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuHost = document.getElementById('menuHost');
const menuStatus = document.getElementById('menuStatus');

function setNavigationOpen(isOpen) {
  burger.setAttribute('aria-expanded', String(isOpen));
  burger.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  sidebar.classList.toggle('open', isOpen);
  sidebar.inert = !isOpen;
  overlay.classList.toggle('show', isOpen);
  overlay.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

burger.addEventListener('click', () => {
  setNavigationOpen(burger.getAttribute('aria-expanded') !== 'true');
});
overlay.addEventListener('click', () => setNavigationOpen(false));
sidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setNavigationOpen(false));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setNavigationOpen(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) setNavigationOpen(false);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function appendMenu(data) {
  if (!Array.isArray(data) || data.length === 0) throw new Error('Menu data is empty or invalid.');
  
  const fragment = document.createDocumentFragment();
  let validItems = 0;
  
  data.forEach((group) => {
    const sectionName = safeText(group?.section);
    if (!sectionName || !Array.isArray(group.items)) return;
    
    const heading = document.createElement('h2');
    heading.textContent = sectionName;
    fragment.appendChild(heading);
    
    const grid = document.createElement('div');
    grid.className = 'menu-grid';
    
    group.items.forEach((item) => {
      const name = safeText(item?.name);
      const description = safeText(item?.desc);
      const price = typeof item?.price === 'number' && Number.isFinite(item.price) ?
        item.price :
        (typeof item?.price === 'string' && /^\d+(?:\.\d{1,2})?$/.test(item.price.trim()) ? Number(item.price.trim()) : null);
      if (!name || price === null || price < 0) return;
      
      const card = document.createElement('article');
      card.className = 'item';
      const imageUrl = safeText(item?.image);
      if (imageUrl && /^https:\/\//i.test(imageUrl)) {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = name;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => image.remove(), { once: true });
        card.appendChild(image);
      }
      const copy = document.createElement('div');
      copy.className = 'item-copy';
      const title = document.createElement('h3');
      title.append(document.createTextNode(name));
      const priceLabel = document.createElement('span');
      priceLabel.textContent = `₹${price}`;
      title.appendChild(priceLabel);
      copy.appendChild(title);
      if (description) {
        const descriptionNode = document.createElement('p');
        descriptionNode.textContent = description;
        copy.appendChild(descriptionNode);
      }
      card.appendChild(copy);
      grid.appendChild(card);
      validItems += 1;
    });
    
    if (grid.childElementCount) fragment.appendChild(grid);
    else heading.remove();
  });
  
  if (!validItems) throw new Error('No valid menu items were found.');
  menuHost.replaceChildren(fragment);
}

async function loadMenu() {
  try {
    const response = await fetch("data/menu.json", { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Menu request failed (${response.status}).`);
    const data = await response.json();
    appendMenu(data);
    menuStatus.textContent = '';
    menuStatus.hidden = true;
  } catch (error) {
    menuStatus.textContent = 'Our menu could not load right now. Please refresh the page or contact us for today’s selection.';
    menuStatus.classList.add('menu-error');
    menuStatus.hidden = false;
    console.error('Unable to load menu:', error);
  }
}

loadMenu();