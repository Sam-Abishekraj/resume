/* SAM-OS v3.0 — vanilla JS, no dependencies */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- boot overlay ---------- */
  function boot(done) {
    var el = $('#boot');
    if (!root.classList.contains('boot') || !el) { done(); return; }
    var log = $('#boot-log');
    var lines = [
      'mounting /home/sam ............... ',
      'loading toolchain: crm · sql · rag · notify · mcp ',
      'reading ~/sutraops/eval ........ 22/25 passed ',
      'starting interface ............. '
    ];
    var i = 0, finished = false, timer;
    function finish() {
      if (finished) return; finished = true;
      clearTimeout(timer);
      try { sessionStorage.setItem('samos-booted', '1'); } catch (e) {}
      el.classList.add('done');
      root.classList.remove('boot');
      setTimeout(function () { el.remove(); }, 500);
      document.removeEventListener('keydown', finish);
      el.removeEventListener('click', finish);
      done();
    }
    function next() {
      if (i < lines.length) {
        var row = document.createElement('div');
        row.textContent = '[ ' + String(i + 1).padStart(2, '0') + ' ] ' + lines[i];
        var ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = 'ok';
        row.appendChild(ok);
        log.appendChild(row);
        i++; timer = setTimeout(next, 230);
      } else { timer = setTimeout(finish, 350); }
    }
    document.addEventListener('keydown', finish);
    el.addEventListener('click', finish);
    timer = setTimeout(next, 150);
  }

  /* ---------- clock (IST) ---------- */
  function clock() {
    var c = $('#clock'); if (!c) return;
    var f = function () {
      c.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST';
    };
    f(); setInterval(f, 1000);
  }

  /* ---------- nav: menu + active section ---------- */
  function nav() {
    var btn = $('#menu-btn'), links = $('#nav-links');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      links.classList.toggle('open', open);
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () {
        btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); links.classList.remove('open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { btn.click(); btn.focus(); }
    });
    if (!('IntersectionObserver' in window)) return;
    var map = {};
    $$('a[href^="#"]', links).forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    map.eval = map.sutraops;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          $$('a', links).forEach(function (a) { a.classList.remove('active'); });
          if (map[en.target.id]) map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['hero', 'sutraops', 'eval', 'projects', 'experience', 'skills', 'education', 'contact'].forEach(function (id) {
      var s = document.getElementById(id); if (s) io.observe(s);
    });
  }

  /* ---------- reveal on scroll ---------- */
  function reveals() {
    var els = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- hero typing ---------- */
  function typing() {
    var el = $('#type-text'); if (!el) return;
    var cmds = [
      'sutraops --connect crm sql rag notify mcp',
      'sutraops eval --langs en,ta,hi   # 22/25 passed',
      'guardrails --redact-injection --mask-pii',
      'approve --refunds-above 2000 --human'
    ];
    if (reduce) { el.textContent = cmds[0]; return; }
    var ci = 0, i = 0, del = false;
    (function tick() {
      var s = cmds[ci];
      if (!del) {
        el.textContent = s.slice(0, ++i);
        if (i === s.length) { del = true; return setTimeout(tick, 2200); }
        setTimeout(tick, 38 + Math.random() * 40);
      } else {
        el.textContent = s.slice(0, --i);
        if (i === 0) { del = false; ci = (ci + 1) % cmds.length; return setTimeout(tick, 350); }
        setTimeout(tick, 16);
      }
    })();
  }

  /* ---------- statement words ---------- */
  var words = [];
  function splitStatement() {
    var p = $('#statement'); if (!p) return;
    var acc = /^(tool|calls,|guardrails,|human|approvals|traces|trust)$/;
    var parts = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    parts.forEach(function (w, idx) {
      var s = document.createElement('span');
      s.className = 'w' + (acc.test(w) ? ' acc' : '');
      s.textContent = w;
      p.appendChild(s);
      if (idx < parts.length - 1) p.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  }

  /* ---------- SutraOps sticky story ---------- */
  function story() {
    var steps = $$('.step'), shots = $$('.shot'), dots = $$('#frame-dots i');
    var title = $('#frame-title'), count = $('#frame-count'), cmd = $('#frame-cmd');
    if (!steps.length || !('IntersectionObserver' in window)) return;
    function activate(n) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
      shots.forEach(function (s) { s.classList.toggle('is-active', +s.dataset.step === n); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i <= n); });
      var st = steps[n];
      title.textContent = '~/sutraops/screens/' + st.dataset.title;
      count.textContent = String(n + 1).padStart(2, '0') + '/' + String(steps.length).padStart(2, '0');
      cmd.textContent = st.dataset.cmd;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(+en.target.dataset.step); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(function (s) { io.observe(s); });
    // warm the image cache for the sticky frame once the section is near
    var warm = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { shots.forEach(function (s) { s.loading = 'eager'; }); warm.disconnect(); }
    }, { rootMargin: '600px 0px' });
    warm.observe($('#sutraops'));
  }

  /* ---------- counters ---------- */
  function counters() {
    var els = $$('.count');
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), t0 = null, dur = 1400;
        (function step(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = (to * e).toFixed(dec);
          if (k < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { e.textContent = (0).toFixed(+(e.dataset.dec || 0)); io.observe(e); });
  }

  /* ---------- scroll-linked: progress, nav, hero parallax, statement, timeline ---------- */
  function scrollFx() {
    var bar = $('.scroll-progress span'), navEl = $('.nav'), heroTitle = $('.hero-title');
    var stmt = $('#statement'), tl = $('#timeline'), fill = $('.tl-fill span');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      navEl.classList.toggle('scrolled', y > 8);
      if (reduce) return;
      if (heroTitle && y < vh * 1.2) {
        heroTitle.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
        heroTitle.style.opacity = String(Math.max(0, 1 - y / (vh * 0.9)));
      }
      if (stmt && words.length) {
        var r = stmt.getBoundingClientRect();
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('lit', i < n);
      }
      if (tl && fill) {
        var t = tl.getBoundingClientRect();
        var q = (vh * 0.6 - t.top) / t.height;
        fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, q)) + ')';
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- contact terminal ---------- */
  function contactTerm() {
    var out = $('#term-out'), form = $('#term-form'), input = $('#term-in');
    if (!out || !form) return;
    var LINKS = {
      github: 'https://github.com/Sam-Abishekraj',
      linkedin: 'https://www.linkedin.com/in/sam-abishekraj/',
      sutraops: 'https://github.com/Sam-Abishekraj/sutraops'
    };
    function line(text, cls) {
      var p = document.createElement('p');
      if (cls) p.className = cls;
      p.textContent = text;
      out.appendChild(p); out.scrollTop = out.scrollHeight; return p;
    }
    function link(name, href, desc) {
      var p = document.createElement('p'), a = document.createElement('a');
      a.href = href; a.textContent = name; a.target = '_blank'; a.rel = 'noopener';
      p.appendChild(a); p.appendChild(document.createTextNode('  ' + desc));
      out.appendChild(p); out.scrollTop = out.scrollHeight;
    }
    var cmds = {
      help: function () {
        ['available commands:',
         '  whoami       who is behind this terminal',
         '  email        primary contact',
         '  github       open GitHub profile',
         '  linkedin     open LinkedIn profile',
         '  sutraops     open the flagship project',
         '  projects     list projects',
         '  send <msg>   draft an email to Sam with your message',
         '  clear        clear the screen'].forEach(function (t) { line(t); });
      },
      whoami: function () {
        line('Sam Abishekraj D');
        line('AI Engineer · Forward Deployed Engineer (entry level)');
        line('Data Science & ML Trainer @ Knowledge Hive Learning Services');
        line('Madurai, Tamil Nadu, India');
      },
      email: function () { var p = line('samabishek7@gmail.com  '); var a = document.createElement('a'); a.href = 'mailto:samabishek7@gmail.com'; a.textContent = '[open mail]'; p.appendChild(a); },
      github: function () { line('opening GitHub…'); window.open(LINKS.github, '_blank', 'noopener'); },
      linkedin: function () { line('opening LinkedIn…'); window.open(LINKS.linkedin, '_blank', 'noopener'); },
      sutraops: function () { line('opening SutraOps repo…'); window.open(LINKS.sutraops, '_blank', 'noopener'); },
      projects: function () {
        link('sutraops/', LINKS.sutraops, 'enterprise integration agent (flagship)');
        link('trueailab-rag-assistant/', 'https://github.com/Sam-Abishekraj/trueailab-rag-assistant', 'TechVerse University RAG assistant');
        link('Fraud_Sense/', 'https://github.com/Sam-Abishekraj/Fraud_Sense', 'fake job posting & review detection');
        link('Job-Learning-Path-Recommendation/', 'https://github.com/Sam-Abishekraj/Job-Learning-Path-Recommendation', 'GenAI learning paths');
        link('crop-recommendation-project/', 'https://github.com/Sam-Abishekraj/crop-recommendation-project', 'ML crop recommendations');
      },
      clear: function () { out.textContent = ''; }
    };
    line("SAM-OS contact shell. type 'help' to list commands.");
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = input.value.trim(); input.value = '';
      if (!raw) return;
      line('guest@sam-os:~$ ' + raw, 'u');
      var sp = raw.indexOf(' ');
      var c = (sp === -1 ? raw : raw.slice(0, sp)).toLowerCase(), arg = sp === -1 ? '' : raw.slice(sp + 1).trim();
      if (c === 'send') {
        if (arg.length < 2) { line('usage: send <your message>'); return; }
        line('opening your mail app with the message pre-filled…');
        window.location.href = 'mailto:samabishek7@gmail.com?subject=' + encodeURIComponent('Hello from your portfolio') + '&body=' + encodeURIComponent(arg);
        return;
      }
      if (c === 'sudo') { line('nice try. permission denied.'); return; }
      if (c === 'matrix') { line('wake up, neo…'); return; }
      if (cmds[c]) cmds[c](); else { line("command not found: " + c); line("type 'help' to see available commands."); }
    });
    $$('.term-chips button').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.dataset.cmd; form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); });
    });
    $('.contact-term').addEventListener('click', function (e) { if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') input.focus({ preventScroll: true }); });
  }

  /* ---------- init ---------- */
  splitStatement();
  nav();
  clock();
  contactTerm();
  story();
  counters();
  scrollFx();
  boot(function () {
    reveals();
    var t = $('.hero-title');
    requestAnimationFrame(function () { t.classList.add('in'); });
    typing();
  });
})();
