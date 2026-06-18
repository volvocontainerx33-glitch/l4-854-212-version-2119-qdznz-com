(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = document.body.classList.toggle("menu-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = parseInt(dot.getAttribute("data-target-slide"), 10) || 0;
                show(target);
                play();
            });
        });

        show(0);
        play();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
        if (!inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        inputs.forEach(function (input) {
            if (initial) {
                input.value = initial;
            }
            applyFilter(input.value);
            input.addEventListener("input", function () {
                applyFilter(input.value);
            });
        });
    }

    function applyFilter(value) {
        var query = String(value || "").trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card"));
        var empty = document.querySelector(".empty-state");
        var visible = 0;
        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
            var matched = !query || text.indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-stream]"));
        videos.forEach(function (video) {
            var shell = video.closest(".player-shell");
            var button = shell ? shell.querySelector(".play-toggle") : null;
            var overlay = shell ? shell.querySelector(".player-overlay") : null;
            var loaded = false;
            var hls = null;

            function attach() {
                if (loaded) {
                    return;
                }
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                loaded = true;
            }

            function start(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                attach();
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
                if (shell) {
                    shell.classList.add("is-playing");
                }
            }

            if (button) {
                button.addEventListener("click", start);
            }
            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("play", function () {
                if (shell) {
                    shell.classList.add("is-playing");
                }
            });
            video.addEventListener("pause", function () {
                if (shell) {
                    shell.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }
})();
