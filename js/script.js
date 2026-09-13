/* =========================================================================
   AABCO ENGINEERING — INTERACTIONS
   1. Preloader           6. Scroll-reveal (IntersectionObserver)
   2. Custom cursor       7. Collage slider
   3. Scroll progress     8. Machine-table sticky polish (native)
   4. Header + nav        9. Contact form validation
   5. 3D tilt + magnetic  10. Backend hookup notes (see bottom)
   ========================================================================= */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------------
   * 1. PRELOADER — waits for full load, keeps a minimum dwell time so the
   *    plane animation always gets to play at least once.
   * ------------------------------------------------------------------- */
  (function preloader(){
    var el = document.querySelector('[data-preloader]');
    if(!el) return;
    var minDelay = reduceMotion ? 0 : 900;
    var start = Date.now();
    var finished = false;
    function done(){
      if(finished) return;
      finished = true;
      var elapsed = Date.now() - start;
      var wait = Math.max(0, minDelay - elapsed);
      setTimeout(function(){
        document.body.classList.add('is-loaded');
        setTimeout(function(){ if(el.parentNode) el.remove(); }, 800);
      }, wait);
    }
    if(document.readyState === 'complete'){ done(); }
    else{ window.addEventListener('load', done); }
    // Safety net so a slow/broken asset never traps the user behind the preloader.
    setTimeout(done, 4000);
  })();

  /* ---------------------------------------------------------------------
   * 2. CUSTOM CURSOR — smoothed dot + ring, scales on hoverable targets.
   * ------------------------------------------------------------------- */
  (function cursor(){
    if(isCoarse) return;
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    (function loop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    var hoverables = 'a, button, .tilt, input, textarea, select, [data-dd-trigger]';
    document.addEventListener('mouseover', function(e){
      if(e.target.closest && e.target.closest(hoverables)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest && e.target.closest(hoverables)) ring.classList.remove('is-active');
    });
    document.addEventListener('mouseleave', function(){ ring.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', function(){ ring.style.opacity = '1'; dot.style.opacity = '1'; });
  })();

  /* ---------------------------------------------------------------------
   * 3. SCROLL PROGRESS BAR
   * ------------------------------------------------------------------- */
  (function scrollProgress(){
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    function update(){
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    }
    document.addEventListener('scroll', update, { passive:true });
    update();
  })();

  /* ---------------------------------------------------------------------
   * 4. HEADER SHRINK + NAV (mobile drawer + dropdown)
   * ------------------------------------------------------------------- */
  (function header(){
    var head = document.querySelector('.site-header');
    if(!head) return;
    function onScroll(){
      if(window.scrollY > 40) head.classList.add('is-scrolled');
      else head.classList.remove('is-scrolled');
    }
    document.addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav-primary');
    if(toggle && nav){
      toggle.addEventListener('click', function(){
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('a:not([data-dd-trigger])').forEach(function(a){
        a.addEventListener('click', function(){
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

var ddTrigger = document.querySelector('[data-dd-trigger]');

if(ddTrigger){
  var wrap = ddTrigger.closest('.nav-item-dropdown');
  var ddPanel = wrap ? wrap.querySelector('.dropdown-panel') : null;

  /* On mobile the trigger only expands/collapses the submenu (see below),
     so there was previously no way to actually reach products.html from
     a phone. Add a persistent "View All" link inside the panel itself. */
  if(ddPanel && !ddPanel.querySelector('.dd-view-all')){
    var viewAll = document.createElement('a');
    viewAll.href = 'products.html';
    viewAll.className = 'dd-view-all';
    viewAll.textContent = 'View All Products / Services';
    ddPanel.appendChild(viewAll);
  }

  ddTrigger.addEventListener('click', function(e){
    var isMobile = window.matchMedia('(max-width:980px)').matches;

    if(isMobile){
      e.preventDefault();

      var open = wrap.classList.toggle('is-open');
      ddTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }else{
      window.location.href = 'products.html';
    }
  });
}
  })();

  /* ---------------------------------------------------------------------
   * 5. 3D TILT + MAGNETIC BUTTONS + HERO PARALLAX
   * ------------------------------------------------------------------- */
  (function tilt(){
    if(isCoarse || reduceMotion) return;
    document.querySelectorAll('.tilt').forEach(function(card){
      var raf = null;
      card.style.perspective = '900px';
      card.addEventListener('mousemove', function(e){
        if(raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function(){
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          var rx = (py * -9).toFixed(2);
          var ry = (px * 11).toFixed(2);
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px) scale(1.015)';
        });
      });
      card.addEventListener('mouseleave', function(){
        if(raf) cancelAnimationFrame(raf);
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0) scale(1)';
      });
    });
  })();

  (function magnetic(){
    if(isCoarse || reduceMotion) return;
    document.querySelectorAll('.btn-primary').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.28;
        var my = (e.clientY - r.top - r.height / 2) * 0.42;
        btn.style.setProperty('--mx', mx.toFixed(1) + 'px');
        btn.style.setProperty('--my', my.toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  })();

  (function heroParallax(){
    var media = document.querySelector('.hero-blueprint');
    if(!media || reduceMotion || isCoarse) return;
    document.addEventListener('scroll', function(){
      var y = window.scrollY;
      if(y < window.innerHeight){
        media.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';
      }
    }, { passive:true });
  })();

  /* ---------------------------------------------------------------------
   * 6. SCROLL REVEAL
   * ------------------------------------------------------------------- */
  (function reveal(){
    var targets = document.querySelectorAll('[data-scroll-reveal], .reveal-up');
    if(!targets.length) return;
    if(reduceMotion || !('IntersectionObserver' in window)){
      targets.forEach(function(t){ t.classList.add('is-visible'); });
      return;
    }
    // Stagger children of grid containers for a orchestrated cascade.
    var groups = document.querySelectorAll('.card-grid, .industry-grid, .why-grid, .values-grid, .award-grid, .mv-grid, .hero-industries');
    groups.forEach(function(g){
      Array.prototype.forEach.call(g.children, function(child, i){
        child.style.transitionDelay = (i * 0.09) + 's';
      });
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
    targets.forEach(function(t){ io.observe(t); });
  })();

  /* ---------------------------------------------------------------------
   * 6b. STAT COUNTERS — count up once visible, honours reduced-motion.
   * ------------------------------------------------------------------- */
  (function counters(){
    var nums = document.querySelectorAll('[data-count]');
    if(!nums.length) return;
    if(reduceMotion || !('IntersectionObserver' in window)){
      nums.forEach(function(el){ el.textContent = el.getAttribute('data-count'); });
      return;
    }
    function animate(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var duration = 1300;
      var start = null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.4 });
    nums.forEach(function(el){ io.observe(el); });
  })();
  
 window.openCertificate = function(src, alt){
  var viewer = document.getElementById('certificateViewer');
  var image = document.getElementById('certificateLargeImage');

  if(!viewer || !image) return;

  image.src = src;
  image.alt = alt || 'Certificate';

  viewer.classList.add('is-open');
  document.body.style.overflow = 'hidden';
};

window.closeCertificate = function(event){
  if(event){
    event.stopPropagation();
  }

  var viewer = document.getElementById('certificateViewer');

  if(!viewer) return;

  viewer.classList.remove('is-open');
  document.body.style.overflow = '';
};


  /* ---------------------------------------------------------------------
   * 7. COLLAGE SLIDER — cross-fade + dots + swipe, pauses on hover.
   * ------------------------------------------------------------------- */
 (function collage(){

  document.querySelectorAll('[data-collage]').forEach(function(root){

    var sets = root.querySelectorAll('.collage-set');

    if(!sets.length) return;

    var dotsWrap = root.parentElement.querySelector('[data-collage-dots]');
    var pageLabel = root.parentElement.querySelector('[data-collage-pagelabel]');

    var index = 0;
    var timer = null;

    /* Auto-advance every 5 seconds */
    var interval = 5000;

    /* Create page dots */
    if(dotsWrap){
      sets.forEach(function(_, i){
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show gallery page ' + (i + 1) + ' of ' + sets.length);

        if(i === 0){
          b.classList.add('is-active');
        }

        b.addEventListener('click', function(){
          show(i);
          restart();
        });

        dotsWrap.appendChild(b);
      });
    }

    function show(i){
      sets[index].classList.remove('is-active');
      index = (i + sets.length) % sets.length;
      sets[index].classList.add('is-active');

      if(dotsWrap){
        dotsWrap.querySelectorAll('button').forEach(function(button, buttonIndex){
          button.classList.toggle('is-active', buttonIndex === index);
        });
      }

      if(pageLabel){
        pageLabel.textContent = String(index + 1).padStart(2,'0') + ' / ' + String(sets.length).padStart(2,'0');
      }
    }

    function next(){
      show(index + 1);
    }

    function start(){
      stop();
      timer = setInterval(next, interval);
    }

    function stop(){
      if(timer){
        clearInterval(timer);
        timer = null;
      }
    }

    function restart(){
      start();
    }

    var touchX = null;

    root.addEventListener('touchstart', function(e){
      touchX = e.touches[0].clientX;
    }, { passive:true });

    root.addEventListener('touchend', function(e){
      if(touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;

      if(Math.abs(dx) > 40){
        show(index + (dx < 0 ? 1 : -1));
        restart();
      }
      touchX = null;
    }, { passive:true });

    start();

  });

})();
  /* ---------------------------------------------------------------------
   * 9. CONTACT FORM — front-end validation + success state (no backend).
   * ------------------------------------------------------------------- */
  (function contactForm(){
    var form = document.querySelector('[data-enquiry-form]');
    if(!form) return;
    var success = document.querySelector('[data-form-success]');

    var rules = {
      name:    function(v){ return v.trim().length > 1; },
      email:   function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      phone:   function(v){ return v.trim() === '' || /^[+()\d\s-]{7,}$/.test(v.trim()); },
      message: function(v){ return v.trim().length >= 10; }
    };

    function validateField(input){
      var name = input.name;
      if(!rules[name]) return true;
      var field = input.closest('.field');
      var ok = rules[name](input.value);
      if(field) field.classList.toggle('has-error', !ok);
      return ok;
    }

    form.querySelectorAll('input, textarea').forEach(function(input){
      input.addEventListener('blur', function(){ validateField(input); });
      input.addEventListener('input', function(){
        var field = input.closest('.field');
        if(field && field.classList.contains('has-error')) validateField(input);
      });
    });

    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var fields = form.querySelectorAll('input[required], textarea[required]');
      var allValid = true;
      fields.forEach(function(input){ if(!validateField(input)) allValid = false; });
      if(!allValid){
        var firstError = form.querySelector('.has-error input, .has-error textarea');
        if(firstError) firstError.focus();
        return;
      }

      /* Sends the enquiry to info@aabco.my via FormSubmit (no backend
         required). The form's action/method attributes are kept as a
         no-JS fallback; this fetch call is what lets us show the inline
         success message instead of redirecting the page. */
      var formNote = form.querySelector('.form-note');
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
      .then(function(res){
        if(!res.ok) throw new Error('Request failed');
        if(success){
          success.classList.add('is-visible');
          success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'center' });
        }
        form.reset();
      })
      .catch(function(){
        if(formNote){
          formNote.textContent = 'Something went wrong sending your enquiry — please email info@aabco.my directly or try again.';
          formNote.classList.add('is-visible');
        }
      })
      .finally(function(){
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Send Enquiry'; }
      });
    });
  })();

})();
