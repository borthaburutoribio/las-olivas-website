// Las Olivas — espejo que cambia de look, prendas por categoría, campaña, etiqueta viva y movimiento.
document.documentElement.classList.add('js');
const WA = '5491178173858';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Entradas escalonadas por sección */
const rise = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    rise.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('section, header, footer').forEach((sec) => {
  sec.querySelectorAll('[data-rise]').forEach((el, i) => {
    el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
    rise.observe(el);
  });
});

/* El espejo: cada sección de la columna pone su look */
const mirrorImgs = [...document.querySelectorAll('.mirror__frame img')];
const setMirror = (key) => mirrorImgs.forEach((img) => img.classList.toggle('is-on', img.dataset.key === key));
const mirrorObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) setMirror(e.target.dataset.mirror); });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('[data-mirror]').forEach((s) => mirrorObs.observe(s));

/* Menú móvil */
const menuBtn = document.querySelector('.nav__menu');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) { menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
});

/* Prendas por categoría (datos de lasolivas.com.ar) */
const CATS = {
  camisas: { t: 'Camisas y blusas', p: 'Blancas, rayadas, con bordados o caladas. En la tienda está, por ejemplo, la camisa Nataly, y hay más en los locales.', img: 'cat-camisas-blusas', alt: 'Camisa blanca con chaleco de gamuza color caramelo', url: 'camisas-blusas' },
  sacos: { t: 'Sacos, chaquetas y chalecos', p: 'Del blazer Alquímico a sacos de tweed y chalecos, para ponerle encima a cualquier remera y cambiar el look.', img: 'cat-sacos-chaquetas-chalecos', alt: 'Saco de tweed sobre camisa blanca', url: 'sacos-chaquetas-chalecos' },
  tejidos: { t: 'Tejidos y buzos', p: 'Sacos de punto, cárdigans y buzos para las noches que todavía refrescan en Pringles y en Suárez.', img: 'cat-tejidos-buzos', alt: 'Cárdigan crudo con vivos negros sobre sweater negro', url: 'tejidos-buzos' },
  pantalones: { t: 'Pantalones y shorts', p: 'Estampados, rectos, anchos y jeans, entre otros. Si no sabés qué calce te queda, te lo decimos por WhatsApp.', img: 'cat-pantalones-shorts', alt: 'Pantalón blanco con estampa de letras rojas y azules', url: 'pantalones-shorts' },
  vestidos: { t: 'Vestidos, faldas y monos', p: 'Faldas plisadas, vestidos y monos, para el día a día o para un evento. Lo que buscan muchas para un civil.', img: 'cat-vestidos-faldas-monos', alt: 'Conjunto amplio en tonos tostados con pantalón ancho', url: 'vestidos-faldas-monos' },
  remeras: { t: 'Remeras, musculosas y tops', p: 'Remeras, tops calados y el body Eva, para usar solos o debajo de un saco.', img: 'cat-remeras-musculosas-tops', alt: 'Remera tejida calada en color crudo', url: 'remeras-musculosas-tops' },
};
const plateImg = document.getElementById('plate-img');
const tabs = [...document.querySelectorAll('[data-cat]')];
const showCat = (key) => {
  const c = CATS[key];
  tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.cat === key)));
  document.getElementById('cat-title').textContent = c.t;
  document.getElementById('cat-text').textContent = c.p;
  document.getElementById('cat-shop').href = `https://www.lasolivas.com.ar/${c.url}/`;
  document.getElementById('cat-ask').href = `https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Quiero consultar talles de ${c.t.toLowerCase()}.`)}`;
  plateImg.classList.add('is-swapping');
  setTimeout(() => {
    plateImg.src = `assets/img/${c.img}.webp`;
    plateImg.alt = c.alt;
    plateImg.classList.remove('is-swapping');
  }, reduce ? 0 : 220);
};
tabs.forEach((b, i) => {
  b.addEventListener('click', () => showCat(b.dataset.cat));
  b.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); showCat(n.dataset.cat);
  });
});
Object.values(CATS).forEach((c) => { const i = new Image(); i.src = `assets/img/${c.img}.webp`; });

/* Campaña: un solo cuadro que cambia de foto */
const stack = document.querySelector('.frame__stack');
const frames = [...stack.querySelectorAll('img')];
const cap = document.getElementById('frame-cap');
let fi = 0;
const nextFrame = () => {
  frames[fi].classList.remove('is-on');
  fi = (fi + 1) % frames.length;
  frames[fi].classList.add('is-on');
  cap.textContent = frames[fi].dataset.cap;
};
let frameTimer = null;
const startFrames = () => { if (!reduce && !frameTimer) frameTimer = setInterval(nextFrame, 3000); };
const stopFrames = () => { clearInterval(frameTimer); frameTimer = null; };
new IntersectionObserver(([e]) => (e.isIntersecting ? startFrames() : stopFrames())).observe(stack);
stack.addEventListener('click', () => { nextFrame(); stopFrames(); startFrames(); });
stack.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextFrame(); } });

/* La etiqueta "Esto es para ___" arma el mensaje de WhatsApp */
const form = document.getElementById('tag-form');
const tag = document.getElementById('tag');
const joinList = (arr) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} o ${arr[arr.length - 1]}`);
const readTag = () => {
  const fd = new FormData(form);
  const name = (fd.get('nombre') || '').toString().trim();
  const colors = fd.getAll('color');
  return { name, oc: fd.get('ocasion'), ta: fd.get('talle'), co: colors.length ? joinList(colors) : 'cualquiera', lo: fd.get('local') };
};
const paintTag = (bump) => {
  const d = readTag();
  document.getElementById('tag-name').textContent = d.name || 'vos';
  document.getElementById('tag-oc').textContent = d.oc;
  document.getElementById('tag-ta').textContent = d.ta;
  document.getElementById('tag-co').textContent = d.co;
  document.getElementById('tag-lo').textContent = { 'el local de Pringles': 'local de Pringles', 'el local de Suárez': 'local de Suárez', 'que me lo manden': 'envío a domicilio' }[d.lo] || d.lo;
  const hola = d.name ? `Hola Las Olivas! Soy ${d.name}.` : 'Hola Las Olivas!';
  const talle = d.ta === 'no sé, ayudame' ? 'no sé mi talle, necesito ayuda' : `talle ${d.ta}`;
  const donde = d.lo === 'que me lo manden' ? 'Necesitaría envío.' : `Me queda cómodo ${d.lo}.`;
  document.getElementById('t-text').value = `${hola} Busco algo para ${d.oc}, ${talle}, en ${d.co}. ${donde} ¿Qué me recomiendan?`;
  if (bump && !reduce) { tag.classList.remove('is-bump'); void tag.offsetWidth; tag.classList.add('is-bump'); }
};
form.addEventListener('input', (e) => paintTag(e.target.type !== 'text'));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  paintTag(false);
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(document.getElementById('t-text').value)}`, '_blank', 'noopener');
});
paintTag(false);

/* Nombre que pesa: se achica un poco al dejar el hero y crece al llegar al pie */
const scaleEls = [...document.querySelectorAll('[data-scale], [data-scale-in]')];
const onScroll = () => {
  const vh = window.innerHeight;
  scaleEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (el.hasAttribute('data-scale')) {
      const p = Math.min(Math.max(window.scrollY / vh, 0), 1);
      el.style.transform = `scale(${1 - p * 0.07})`;
    } else {
      const p = Math.min(Math.max((vh - r.top) / vh, 0), 1);
      el.style.transform = `scale(${0.93 + p * 0.07})`;
    }
  });
  fab && fab.classList.toggle('is-shown', window.scrollY > vh * 0.6);
};
const fab = document.querySelector('.wa-fab');
// El botón fijo se esconde donde ya hay un botón de WhatsApp propio
if (fab) {
  const hideIn = new Set();
  new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? hideIn.add(e.target) : hideIn.delete(e.target)));
    fab.classList.toggle('is-hidden', hideIn.size > 0);
  }).observe(document.querySelector('.tagger'));
}
if (!reduce) window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
if (fab && reduce) window.addEventListener('scroll', () => fab.classList.toggle('is-shown', window.scrollY > 400), { passive: true });
onScroll();

/* Compartir */
document.querySelector('[data-share]').addEventListener('click', async (e) => {
  const data = { title: 'Las Olivas', text: 'Ropa de diseño en Coronel Pringles y Coronel Suárez', url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch (_) { /* cancelado */ } return; }
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Link copiado'; } catch (_) { /* sin portapapeles */ }
});
