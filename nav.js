/* Shared "Where you are" panel.
   Loaded by every page. Injects a Menu button into the header, and a panel that
   reads the wizard's saved progress so a returning visitor can see what they
   already finished and jump straight to the part they want.

   Each page sets window.JH_PAGE before loading this file:
     'home' | 'resume' | 'leaders' | 'intro' | 'help'
*/
(function () {
  var PAGE = window.JH_PAGE || '';

  // ---- read whatever the wizard saved (same key resume.html writes) ----
  var D = {}, step = 1;
  try {
    var raw = localStorage.getItem('rw2');
    if (raw) { var o = JSON.parse(raw); D = (o && o.D) || {}; step = (o && o.step) || 1; }
  } catch (e) {}

  var has = {
    started: !!(D.contact && D.contact.name) || (D.jobs && D.jobs.length) || (D.skills && D.skills.length),
    resume:  !!(D.resume && D.resume.trim()),
    posting: !!(D.posting && D.posting.trim()),
    cover:   !!(D.cover && D.cover.trim())
  };

  // Where the wizard would drop them if they just reopened it.
  function whereLeftOff() {
    if (PAGE !== 'resume' && !has.started) return null;
    if (step >= 23) return 'Getting ready for an interview';
    if (step >= 18) return 'Writing a cover letter';
    if (step === 17) return 'Looking for a job to apply for';
    if (step >= 14) return 'Saving your resume';
    if (step >= 2)  return 'Building your resume';
    return null;
  }

  var STYLE =
  '.jh-menu{margin-left:auto;font:600 16px Barlow,system-ui,sans-serif;color:var(--steel,#5A6B7D);' +
    'background:none;border:0;padding:8px 4px;cursor:pointer;display:flex;align-items:center;gap:7px}' +
  '.jh-menu:hover{color:var(--ink,#1A2332)}' +
  '.jh-menu:focus-visible{outline:3px solid var(--amber,#E09200);outline-offset:3px;border-radius:4px}' +
  '.jh-menu svg{display:block}' +
  '.jh-scrim{position:fixed;inset:0;background:rgba(10,14,20,.5);z-index:998;border:0;padding:0;' +
    'width:100%;height:100%;cursor:pointer}' +
  '.jh-panel{position:fixed;z-index:999;left:0;right:0;top:0;max-height:100%;overflow-y:auto;' +
    'background:var(--paper,#FBFAF7);color:var(--ink,#1A2332);' +
    'border-bottom:1px solid var(--line,#D9D4C8);' +
    'padding:calc(18px + env(safe-area-inset-top,0px)) 20px 26px;' +
    'font-family:Barlow,system-ui,-apple-system,sans-serif}' +
  '.jh-in{max-width:640px;margin:0 auto}' +
  '.jh-top{display:flex;align-items:baseline;gap:12px;margin-bottom:4px}' +
  '.jh-top h2{font-size:24px;font-weight:700;margin:0;letter-spacing:-.01em}' +
  '.jh-close{margin-left:auto;font:600 16px Barlow,sans-serif;color:var(--steel,#5A6B7D);' +
    'background:none;border:0;padding:6px 2px;cursor:pointer}' +
  '.jh-close:hover{color:var(--ink,#1A2332)}' +
  '.jh-left{background:var(--amber-soft,#FFF4DC);border-left:5px solid var(--amber,#E09200);' +
    'border-radius:0 6px 6px 0;padding:13px 16px;margin:14px 0 4px;font-size:16px}' +
  '.jh-left b{display:block;font-size:17px}' +
  '.jh-h{font-size:13px;font-weight:700;color:var(--steel,#5A6B7D);letter-spacing:.07em;' +
    'text-transform:uppercase;margin:24px 0 10px;padding-bottom:7px;' +
    'border-bottom:1px solid var(--line,#D9D4C8)}' +
  '.jh-done{list-style:none;padding:0;margin:0}' +
  '.jh-done li{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:16px}' +
  '.jh-tick{flex:none;width:21px;height:21px;border-radius:50%;display:flex;align-items:center;' +
    'justify-content:center;font-size:13px;font-weight:700}' +
  '.jh-yes .jh-tick{background:#2F6B4F;color:#fff}' +
  '.jh-no .jh-tick{background:transparent;border:2px solid var(--line,#D9D4C8);color:transparent}' +
  '.jh-no{color:var(--ink-soft,#4A5768)}' +
  '.jh-go{display:block;background:var(--card,#fff);border:2px solid var(--line,#D9D4C8);' +
    'border-radius:7px;padding:13px 15px;margin-bottom:9px;text-decoration:none;' +
    'color:var(--ink,#1A2332);font-weight:700;font-size:17px}' +
  '.jh-go:hover{border-color:var(--steel,#5A6B7D)}' +
  '.jh-go:focus-visible{outline:3px solid var(--amber,#E09200);outline-offset:2px}' +
  '.jh-go small{display:block;font-weight:400;font-size:15px;color:var(--ink-soft,#4A5768);margin-top:2px}' +
  '.jh-go[aria-current="true"]{border-color:var(--amber,#E09200);background:var(--amber-soft,#FFF4DC)}' +
  '.jh-here{float:right;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;' +
    'color:var(--amber,#E09200)}' +
  '@media (prefers-reduced-motion:no-preference){.jh-panel{animation:jhDrop .18s ease-out}}' +
  '@keyframes jhDrop{from{transform:translateY(-12px);opacity:.4}to{transform:none;opacity:1}}';

  function esc(s){ return String(s == null ? '' : s)
    .replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function row(ok, doneText, notText) {
    return '<li class="' + (ok ? 'jh-yes' : 'jh-no') + '">' +
           '<span class="jh-tick">✓</span>' + esc(ok ? doneText : notText) + '</li>';
  }

  function link(href, page, title, sub) {
    var here = (page === PAGE);
    return '<a class="jh-go" href="' + href + '"' + (here ? ' aria-current="true"' : '') + '>' +
      (here ? '<span class="jh-here">You are here</span>' : '') +
      esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</a>';
  }

  function build() {
    var left = whereLeftOff();
    var h = '<div class="jh-in">' +
      '<div class="jh-top"><h2>Where you are</h2>' +
      '<button class="jh-close" type="button">Close</button></div>';

    if (left) {
      h += '<div class="jh-left"><b>You left off here</b>' + esc(left) + '</div>';
    } else {
      h += '<div class="jh-left"><b>Nothing saved yet</b>Start with your resume ' +
           'and everything after it gets easier.</div>';
    }

    h += '<div class="jh-h">What you have so far</div><ul class="jh-done">' +
      row(has.resume,  'Resume — saved on this phone', 'Resume — not saved yet') +
      row(has.posting, 'Job posting — saved',          'Job posting — none yet') +
      row(has.cover,   'Cover letter — saved',         'Cover letter — not written yet') +
      '</ul>';

    h += '<div class="jh-h">Go to</div>' +
      link('index.html', 'home', 'Home', 'The main page') +
      link('resume.html', 'resume',
           has.started ? 'My resume' : 'Build my resume',
           has.started ? 'Pick up where you left off' : 'About 15 minutes') +
      link('resume.html?go=links', '', 'Find a job to apply for', 'Places to look, and scams to avoid') +
      link('resume.html?go=cover', '', 'Write a cover letter',
           has.posting ? 'For the posting you saved' : 'Paste a job posting first') +
      link('resume.html?go=interview', '', 'Get ready for an interview', 'Practise the questions') +
      '<div class="jh-h">Other</div>' +
      link('leaders.html', 'leaders', 'For ministers and leaders', 'Two short videos') +
      link('intro.html', 'intro', 'How this works', 'A short overview');

    return h + '</div>';
  }

  var panel, scrim, btn;

  function close() {
    if (panel) { panel.remove(); panel = null; }
    if (scrim) { scrim.remove(); scrim = null; }
    document.documentElement.style.overflow = '';
    if (btn) btn.focus();
  }

  function open() {
    if (panel) { close(); return; }
    scrim = document.createElement('button');
    scrim.className = 'jh-scrim';
    scrim.setAttribute('aria-label', 'Close menu');
    scrim.addEventListener('click', close);

    panel = document.createElement('div');
    panel.className = 'jh-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Where you are');
    panel.innerHTML = build();
    panel.querySelector('.jh-close').addEventListener('click', close);

    document.body.appendChild(scrim);
    document.body.appendChild(panel);
    document.documentElement.style.overflow = 'hidden';
    panel.querySelector('.jh-close').focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel) close();
  });

  function init() {
    // one favicon for every page, rather than a <link> in each file
    if (!document.querySelector('link[rel="icon"]')) {
      var ic = document.createElement('link');
      ic.rel = 'icon'; ic.type = 'image/svg+xml'; ic.href = 'favicon.svg';
      document.head.appendChild(ic);
    }

    var st = document.createElement('style');
    st.textContent = STYLE;
    document.head.appendChild(st);

    btn = document.createElement('button');
    btn.className = 'jh-menu';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Where you are');
    btn.innerHTML = '<svg width="17" height="13" viewBox="0 0 17 13" aria-hidden="true">' +
      '<rect y="0" width="17" height="2.2" rx="1.1" fill="currentColor"/>' +
      '<rect y="5.4" width="17" height="2.2" rx="1.1" fill="currentColor"/>' +
      '<rect y="10.8" width="17" height="2.2" rx="1.1" fill="currentColor"/></svg>Menu';
    btn.addEventListener('click', open);

    // Drop it into whichever header bar this page uses.
    var bar = document.getElementById('jh-bar') ||
              document.getElementById('barrow') ||
              document.querySelector('header .wrap') ||
              document.querySelector('header');
    if (bar) bar.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
