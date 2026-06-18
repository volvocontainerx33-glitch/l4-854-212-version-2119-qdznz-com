(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  onReady(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          start();
        });
      });
      show(0);
      start();
    }

    var filterBar = document.querySelector("[data-filter-bar]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];

    if (filterBar && cards.length) {
      filterBar.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter]");
        if (!button) {
          return;
        }
        var value = button.getAttribute("data-filter");
        filterBar.querySelectorAll("[data-filter]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var match = value === "all" || card.getAttribute("data-category") === value;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    }

    var searchResults = document.querySelector("[data-search-results]");
    if (searchResults && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = normalize(params.get("q"));
      document.querySelectorAll("input[name='q']").forEach(function (input) {
        input.value = params.get("q") || "";
      });
      if (q) {
        var found = 0;
        cards.forEach(function (card) {
          var words = normalize(card.getAttribute("data-keywords") || card.textContent);
          var match = words.indexOf(q) !== -1;
          card.hidden = !match;
          if (match) {
            found += 1;
          }
        });
        if (empty) {
          empty.hidden = found !== 0;
        }
      }
    }
  });
})();
