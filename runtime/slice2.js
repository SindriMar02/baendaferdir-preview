/* Functional additions are outside the decorative-motion early return. */
addEventListener('DOMContentLoaded', () => {
 if (document.documentElement.dataset.brand !== 'baendaferdir') return;
 window.jQuery(() => {
  document.querySelectorAll('.inclusion-toggle').forEach(button => {
   const panel = document.getElementById(button.getAttribute('aria-controls'));
   if (!panel) return;
   button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('span').textContent = open ? '−' : '+';
    panel.inert = !open;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .3;
    window.gsap.to(panel, {height:open ? panel.scrollHeight : 0, duration, ease:'power2.out', overwrite:true,
     onComplete:() => {if(open) panel.style.height='auto'; window.ScrollTrigger?.refresh(true);}});
   });
  });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
   if(event.matches) document.querySelectorAll('.inclusion-toggle').forEach(button => {
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    window.gsap.killTweensOf(panel);panel.style.height=button.getAttribute('aria-expanded')==='true'?'auto':'0px';
   });
  });
  document.querySelectorAll('[data-guide]').forEach((card, index) => {
   const trigger = card.querySelector('.guide-toggle'), panel = card.querySelector('.coaches-person-info');
   card.removeAttribute('tabindex'); card.removeAttribute('aria-controls');
   if (!trigger || !panel) return;
   panel.id = 'guide-panel-' + index; trigger.setAttribute('aria-controls', panel.id);
   const close = (restore = false) => {
    card.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false'); panel.inert = true;
    if(restore) trigger.focus({preventScroll:true});
   };
   trigger.addEventListener('click', e => {
    if (trigger.getAttribute('aria-expanded') === 'true' && panel.contains(document.activeElement)) { close(true); return; }
    card.classList.add('is-open'); trigger.setAttribute('aria-expanded','true');panel.inert=false;
    (e.detail === 0 ? (panel.querySelector('a,button') || panel) : panel).focus({preventScroll:true});
   });
   panel.querySelector('.guide-close')?.addEventListener('click',() => close(true));
   card.addEventListener('keydown', e => {if(e.key === 'Escape'){e.preventDefault();close(true);}});
   document.addEventListener('pointerdown',e => {if(!card.contains(e.target)) close();});
   if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    card.addEventListener('mouseenter',()=>{card.classList.add('is-open');trigger.setAttribute('aria-expanded','true');panel.inert=false;});
    card.addEventListener('mouseleave',()=>{if(!card.contains(document.activeElement))close();});
   }
  });
  document.querySelectorAll('.form .inp-group').forEach((group, index) => {
   const field = group.querySelector('input,textarea');
   if (!field) return;
   const error = document.createElement('p');
   error.id = 'form-error-' + index; error.className = 'body-sm'; error.hidden = true;
   error.textContent = field.type === 'email' ? 'Sláðu inn gilt netfang.' : 'Fylltu út þennan reit.';
   error.setAttribute('aria-live','polite'); group.appendChild(error);
   field.setAttribute('aria-describedby',error.id);
   const update = () => { const invalid = group.classList.contains('is-error'); field.setAttribute('aria-invalid',String(invalid)); error.hidden = !invalid; };
   new MutationObserver(update).observe(group,{attributes:true,attributeFilter:['class']}); update();
  });
  const message = document.querySelector('.form textarea[name="message"]');
  const tripName = new URLSearchParams(location.search).get('ferd');
  if (message && tripName) message.value = tripName.slice(0, message.maxLength > 0 ? message.maxLength : 5000);
  const map = document.querySelector('.destination__dots');
  const asia = map?.querySelector('.map-asia');
  if (map && asia) {
   const mobile = matchMedia('(max-width:479px)');
   const arrange = () => {
    map.setAttribute('viewBox', mobile.matches ? '100 0 1000 1050' : '0 0 1260 700');
    asia.setAttribute('x', mobile.matches ? '650' : '1005');
    asia.setAttribute('y', mobile.matches ? '700' : '30');
    window.ScrollTrigger?.refresh(true);
   };
   arrange(); mobile.addEventListener('change',arrange);
  }
  const mapBox = document.querySelector('.destination__code');
  if (mapBox) {
   const tip = document.createElement('div');
   tip.className = 'map-tip'; tip.setAttribute('aria-hidden','true'); tip.hidden = true; mapBox.appendChild(tip);
   let active = null;
   const show = pin => {
    active = pin;
    const meta = [pin.dataset.place, pin.dataset.dates].filter(Boolean).join(' · ');
    tip.innerHTML = '';
    [['map-tip__title', pin.getAttribute('aria-label')], ['map-tip__meta', meta], ['map-tip__price', pin.dataset.price]].forEach(([cls, text]) => {
     if (!text) return; const el = document.createElement('span'); el.className = cls; el.textContent = text; tip.appendChild(el);
    });
    tip.hidden = false;
    const dot = pin.querySelector('.map-hit').getBoundingClientRect(), box = mapBox.getBoundingClientRect();
    const x = dot.left + dot.width / 2 - box.left, y = dot.top - box.top;
    const half = tip.offsetWidth / 2, left = Math.min(Math.max(x, half + 8), box.width - half - 8);
    tip.style.left = left + 'px'; tip.style.top = y + 'px';
    tip.classList.toggle('is-below', y < tip.offsetHeight + 16);
    if (tip.classList.contains('is-below')) tip.style.top = (dot.bottom - box.top) + 'px';
   };
   const hide = () => { active = null; tip.hidden = true; };
   mapBox.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(pin); });
    pin.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
    pin.addEventListener('focus', () => show(pin));
    pin.addEventListener('blur', hide);
    // Touch: first tap names the trip, a second tap on the same pin opens it.
    pin.addEventListener('click', e => { if (e.pointerType === 'touch' && active !== pin) { e.preventDefault(); show(pin); } });
   });
   document.addEventListener('pointerdown', e => { if (active && !e.target.closest?.('.map-pin')) hide(); });
   addEventListener('scroll', () => { if (active && document.activeElement !== active) hide(); }, {passive:true});
  }
  document.querySelectorAll('.header__l,.footer-logo').forEach(a => {
   a.addEventListener('click', e => {
    if (location.pathname !== '/baendaferdir-preview/') return;
    e.preventDefault();
    const smoother = window.ScrollSmoother?.get();
    if(smoother) smoother.scrollTo(0,true); else scrollTo({top:0,behavior:'instant'});
   });
  });
 });
});
