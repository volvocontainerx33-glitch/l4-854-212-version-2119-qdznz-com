(function () {
    var attachPlayer = function (shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.player-cover');
        var button = shell.querySelector('.player-start');
        var source = video ? video.getAttribute('data-hls') : '';
        var hlsInstance = null;
        var ready = false;

        var prepare = function () {
            if (!video || !source || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }

            video.src = source;
            ready = true;
        };

        var start = function () {
            prepare();
            shell.classList.add('is-playing');
            video.controls = true;

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }

        if (cover) {
            cover.addEventListener('click', function () {
                start();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    };

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
}());
