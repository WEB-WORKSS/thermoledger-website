{
  document.documentElement.classList.remove('no-js');

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }

  // Reveal on scroll
  const els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('in'));

  // Stacked tables on phones: label cells from the header row
  document.querySelectorAll('table.stack').forEach((t) => {
    const heads = [...t.tHead.rows[0].cells].map((c) => c.textContent.trim());
    [...t.tBodies[0].rows].forEach((r) => [...r.cells].forEach((c, i) => { if (c.tagName === 'TD') c.dataset.l = heads[i] || ''; }));
  });

  // Contact form
  const form = document.getElementById('contact-form');
  if (form) {
    const cfg = window.TL_CONFIG || {};
    const plan = new URLSearchParams(location.search).get('plan');
    const sel = form.querySelector('#plan');
    if (plan && sel && [...sel.options].some((o) => o.value === plan)) sel.value = plan;
    const msg = document.getElementById('form-msg');
    const show = (cls, html) => { msg.className = 'form-msg ' + cls; msg.innerHTML = html; msg.hidden = false; msg.focus(); };
    const escText = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const validate = () => {
      let ok = true;
      form.querySelectorAll('[required]').forEach((f) => {
        const err = document.getElementById(f.id + '-err');
        let m = '';
        if (f.type === 'checkbox' ? !f.checked : !f.value.trim()) m = 'This field is required.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) m = 'Enter a valid work email address.';
        f.setAttribute('aria-invalid', m ? 'true' : 'false');
        if (err) err.textContent = m;
        if (m) ok = false;
      });
      return ok;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) { form.querySelector('[aria-invalid=true]')?.focus(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.website) return; // honeypot
      const submit = form.querySelector('[type=submit]');
      if (cfg.formEndpoint) {
        submit.disabled = true; submit.textContent = 'Sending…';
        try {
          const r = await fetch(cfg.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error(r.status);
          form.reset();
          show('ok', '<strong>Thank you — your request was received.</strong> We reply to every early-access request personally, usually within two working days.');
        } catch (err) {
          show('bad', 'Your request could not be sent. Please try again in a moment' + (cfg.email ? ', or email <a href="mailto:' + escText(cfg.email) + '">' + escText(cfg.email) + '</a>.' : '.'));
        } finally { submit.disabled = false; submit.textContent = 'Send request'; }
      } else if (cfg.email) {
        const body = Object.entries(data).filter(([k]) => k !== 'website' && k !== 'consent').map(([k, v]) => k + ': ' + v).join('\n');
        location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Early access request — ' + (data.company || '')) + '&body=' + encodeURIComponent(body);
        show('ok', 'Your email app should open with your request filled in. If it does not, write to <strong>' + escText(cfg.email) + '</strong>.');
      } else {
        show('bad', 'Online submission is not available right now. Your details have not been sent.');
      }
    });
    form.querySelectorAll('[required]').forEach((f) => f.addEventListener('blur', () => { if (f.getAttribute('aria-invalid') === 'true') validate(); }));
  }
}
