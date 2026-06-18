(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayers();
  });

  function initNavigation() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-nav-toggle]");

    if (!header || !toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var picks = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-pick]"));
    var backdrop = hero.querySelector("[data-hero-backdrop]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });

      picks.forEach(function (pick, pickIndex) {
        pick.classList.toggle("is-active", pickIndex === index);
      });

      if (backdrop) {
        var activeImage = slides[index].querySelector(".hero-poster img");
        if (activeImage) {
          backdrop.style.backgroundImage = "url('" + activeImage.getAttribute("src") + "')";
        }
      }
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
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    picks.forEach(function (pick) {
      pick.addEventListener("mouseenter", function () {
        show(Number(pick.getAttribute("data-hero-pick")) || 0);
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector("[data-live-search]");
    var category = document.querySelector("[data-category-filter]");
    var clear = document.querySelector("[data-clear-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty]");

    if (!cards.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input.value);
      var selectedCategory = category ? normalize(category.value) : "";
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = !selectedCategory || cardCategory === selectedCategory;
        var visible = matchedKeyword && matchedCategory;

        card.style.display = visible ? "" : "none";

        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    input.addEventListener("input", apply);

    if (category) {
      category.addEventListener("change", apply);
    }

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        if (category) {
          category.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video[data-hls-url]");
      var overlay = player.querySelector(".player-overlay");

      if (!video || !overlay) {
        return;
      }

      var url = video.getAttribute("data-hls-url");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached || !url) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }

        attached = true;
      }

      function play() {
        attach();
        var promise = video.play();
        player.classList.add("is-playing");

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      overlay.addEventListener("click", play);

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
})();
