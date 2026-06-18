(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var scopeSelector = panel.getAttribute('data-filter-panel');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var regionInput = panel.querySelector('[data-filter-region]');
        var typeInput = panel.querySelector('[data-filter-type]');
        var yearInput = panel.querySelector('[data-filter-year]');
        var emptyState = document.querySelector(panel.getAttribute('data-empty-target'));

        function norm(value) {
            return String(value || '').toLowerCase().trim();
        }

        function filterCards() {
            var keyword = norm(keywordInput && keywordInput.value);
            var region = norm(regionInput && regionInput.value);
            var type = norm(typeInput && typeInput.value);
            var year = norm(yearInput && yearInput.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.type,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (region && norm(card.dataset.region).indexOf(region) === -1) {
                    matched = false;
                }

                if (type && norm(card.dataset.type).indexOf(type) === -1) {
                    matched = false;
                }

                if (year && norm(card.dataset.year) !== year) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', filterCards);
                input.addEventListener('change', filterCards);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && keywordInput) {
            keywordInput.value = query;
        }

        filterCards();
    });
})();
