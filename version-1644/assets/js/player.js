(function () {
  window.initMoviePlayer = function (source) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var started = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (started || !video || !source) {
        return;
      }
      started = true;
      shell.classList.add("is-playing");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      }
    }

    if (button) {
      button.addEventListener("click", attachSource);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-trigger-player]")).forEach(function (node) {
      node.addEventListener("click", function () {
        attachSource();
      });
    });
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          attachSource();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
