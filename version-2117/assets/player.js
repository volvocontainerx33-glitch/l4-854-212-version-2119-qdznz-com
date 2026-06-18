(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }

    var video = box.querySelector(".video-player");
    var button = box.querySelector(".play-overlay");
    var configNode = document.getElementById("player-config");
    var streamUrl = "";
    var hlsInstance = null;
    var prepared = false;

    try {
      streamUrl = JSON.parse(configNode.textContent || "{}").stream || "";
    } catch (error) {
      streamUrl = "";
    }

    function prepareVideo() {
      if (prepared || !video || !streamUrl) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }

    function beginPlayback() {
      prepareVideo();
      if (button) {
        button.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", beginPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlayback();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
