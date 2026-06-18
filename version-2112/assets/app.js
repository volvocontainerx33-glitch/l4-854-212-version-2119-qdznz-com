(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var chips = selectAll('[data-filter-chip]');
    var cards = selectAll('[data-card]');
    if (!input || !cards.length) {
      return;
    }

    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (query) {
      input.value = query;
    }

    function activeKeyword() {
      var active = chips.find(function (chip) {
        return chip.classList.contains('is-active');
      });
      return active ? active.getAttribute('data-filter-chip') || '' : '';
    }

    function apply() {
      var text = normalize(input.value);
      var key = normalize(activeKeyword());
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var textMatch = !text || haystack.indexOf(text) !== -1;
        var keyMatch = !key || haystack.indexOf(key) !== -1;
        card.classList.toggle('is-hidden', !(textMatch && keyMatch));
      });
    }

    input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        apply();
      });
    });
    apply();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-player-cover]');
      var url = player.getAttribute('data-play-url');
      var loaded = false;
      var hls = null;

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      function start() {
        if (!video || !url) {
          return;
        }
        if (!loaded) {
          loaded = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              lowLatencyMode: true,
              enableWorker: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
              hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            }
            window.setTimeout(playVideo, 600);
          } else {
            video.src = url;
            playVideo();
          }
        } else {
          playVideo();
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
