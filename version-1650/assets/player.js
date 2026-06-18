import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  const shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  const video = shell.querySelector("video[data-stream]");
  const button = shell.querySelector("#playButton");
  const status = shell.querySelector(".player-status");
  const source = video ? video.getAttribute("data-stream") : "";
  let hls = null;
  let attached = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text || "";
    }
  }

  function attachSource() {
    if (!video || !source || attached) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("");
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("播放加载异常，正在重试");
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("播放恢复中");
          hls.recoverMediaError();
          return;
        }

        setStatus("播放暂不可用，请稍后重试");
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      setStatus("播放暂不可用，请稍后重试");
    }

    attached = true;
  }

  async function play() {
    if (!video) {
      return;
    }

    setStatus("正在加载...");
    attachSource();

    try {
      await video.play();
      if (button) {
        button.classList.add("is-hidden");
      }
      setStatus("");
    } catch (error) {
      setStatus("点击播放器继续播放");
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("playing", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
      setStatus("");
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
