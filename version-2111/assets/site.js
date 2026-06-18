(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var index = 0;

        var showSlide = function (nextIndex) {
            index = nextIndex;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((index + 1) % slides.length);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('[data-card-filter]');

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var source = (card.getAttribute('data-card-search') || '').toLowerCase();
                card.style.display = source.indexOf(query) >= 0 ? '' : 'none';
            });
        });
    }

    var results = document.querySelector('[data-search-results]');

    if (results && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');

        if (input) {
            input.value = query;
        }

        var render = function (value) {
            var keyword = value.trim().toLowerCase();
            var matched = window.SEARCH_MOVIES.filter(function (item) {
                var source = [item.title, item.category, item.genre, item.region, item.year, item.tags, item.desc].join(' ').toLowerCase();
                return !keyword || source.indexOf(keyword) >= 0;
            }).slice(0, 120);

            if (!matched.length) {
                results.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
                return;
            }

            results.innerHTML = matched.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-link" href="' + item.url + '">',
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="poster-overlay"><span class="play-round">▶</span></span>',
                    '</a>',
                    '<div class="movie-body">',
                    '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span class="score-badge">' + escapeHtml(item.score) + '</span></div>',
                    '<h2 class="movie-title"><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                    '<p class="movie-desc">' + escapeHtml(item.desc) + '</p>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        };

        var escapeHtml = function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        render(query);

        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }
}());
