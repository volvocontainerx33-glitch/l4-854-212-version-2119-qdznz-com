import { H as Hls } from "./video-player.js";

function initializePlayer(video) {
  const source = video.dataset.src || video.currentSrc || video.getAttribute("src");
  const shell = video.closest(".player-shell");
  const overlay = shell ? shell.querySelector("[data-play-overlay]") : null;

  if (!source) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function onHlsError(event, data) {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = source;
        }
      }
    });
  } else {
    video.src = source;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function handleOverlayClick() {
      hideOverlay();
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function restoreOverlay() {
          overlay.classList.remove("is-hidden");
        });
      }
    });
  }

  video.addEventListener("play", hideOverlay);
}

document.querySelectorAll("video.movie-video").forEach(initializePlayer);
