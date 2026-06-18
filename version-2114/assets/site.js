(function () {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.addEventListener("error", function (event) {
    const target = event.target;

    if (target && target.tagName === "IMG") {
      target.classList.add("is-missing");
    }
  }, true);

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const localFilter = document.querySelector("[data-local-filter]");

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll("[data-card]"));

    localFilter.addEventListener("input", function () {
      const keyword = localFilter.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre
        ].join(" ").toLowerCase();

        card.style.display = haystack.includes(keyword) ? "" : "none";
      });
    });
  }

  const searchForm = document.querySelector(".search-page-form");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const searchTitle = document.querySelector("[data-search-title]");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function cardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"play-chip\">▶ 播放</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <a class=\"movie-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"movie-meta\">",
      "      <span>" + escapeHtml(movie.year) + "</span>",
      "      <span>" + escapeHtml(movie.region) + "</span>",
      "      <span>" + escapeHtml(movie.category) + "</span>",
      "    </div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function runSearch(keyword) {
    if (!searchResults || !window.MOVIE_INDEX) {
      return;
    }

    const normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    const matched = window.MOVIE_INDEX.filter(function (movie) {
      return movie.searchText.toLowerCase().includes(normalized);
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = "搜索结果：" + keyword + "（" + matched.length + "）";
    }

    if (!matched.length) {
      searchResults.innerHTML = "<div class=\"no-results\">未找到相关内容，请尝试更换关键词。</div>";
      return;
    }

    searchResults.innerHTML = matched.map(cardTemplate).join("");
  }

  if (searchForm && searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get("q") || "";

    if (initialKeyword) {
      searchInput.value = initialKeyword;
      runSearch(initialKeyword);
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const keyword = searchInput.value.trim();

      if (keyword) {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("q", keyword);
        window.history.replaceState(null, "", nextUrl.toString());
        runSearch(keyword);
      }
    });
  }
}());
