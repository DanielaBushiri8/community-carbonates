// Mobile nav toggle
(function () {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  var mq = window.matchMedia('(max-width: 960px)');
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-open', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  }
  function sync() { if (mq.matches) setOpen(false); else nav.removeAttribute('data-open'); }
  toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A' && mq.matches) setOpen(false); });
  mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
  sync();
})();

// Placeholder links: when data-href is filled in, the card becomes a real link.
['book-call', 'feedback'].forEach(function (id) {
  var el = document.getElementById(id);
  if (!el) return;
  var href = el.getAttribute('data-href');
  if (href) {
    el.href = href;
    el.target = '_blank';
    el.rel = 'noopener';
    var note = document.getElementById(id + '-note');
    if (note) note.textContent = id === 'book-call' ? 'Pick a time that works for you.' : 'Tell us what you think.';
  }
});

// Copy email
(function () {
  var btn = document.getElementById('copy-email');
  var email = document.getElementById('email');
  if (!btn || !email) return;
  btn.addEventListener('click', function () {
    var text = email.textContent.trim();
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = 'Copy'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done('Copied'); }, function () { selectText(); done('Selected'); });
    } else { selectText(); done('Selected'); }
    function selectText() {
      var r = document.createRange(); r.selectNodeContents(email);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
  });
})();

var y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
