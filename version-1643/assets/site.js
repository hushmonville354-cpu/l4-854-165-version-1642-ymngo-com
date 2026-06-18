(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? "☰" : "×";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearchPage() {
    var input = document.getElementById("site-search-input");
    var year = document.getElementById("year-filter");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-results .movie-card"));
    var empty = document.querySelector(".search-page .empty-state");
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input.value);
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (y && card.dataset.year !== y) {
          matched = false;
        }
        if (r && card.dataset.region !== r) {
          matched = false;
        }
        if (t && card.dataset.type !== t) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, year, region, type].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupCategoryFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".category-filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".category-filter-input");
      var region = panel.querySelector(".category-region-filter");
      var type = panel.querySelector(".category-type-filter");
      var section = panel.closest("section");
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];
      var empty = section ? section.querySelector(".empty-state") : null;
      if (!input || !cards.length) {
        return;
      }

      function apply() {
        var keyword = normalize(input.value);
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(" "));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (r && card.dataset.region !== r) {
            matched = false;
          }
          if (t && card.dataset.type !== t) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, region, type].forEach(function (item) {
        if (item) {
          item.addEventListener("input", apply);
          item.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector(".js-player");
    var cover = document.querySelector(".js-player-cover");
    var button = document.querySelector(".js-play-button");
    var data = document.getElementById("stream-data");
    if (!video || !cover || !data) {
      return;
    }

    var streamUrl = "";
    try {
      streamUrl = JSON.parse(data.textContent).url;
    } catch (error) {
      streamUrl = "";
    }
    if (!streamUrl) {
      return;
    }

    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {});
      }
    }

    function start() {
      cover.classList.add("is-hidden");
      if (!started) {
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          playVideo();
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.attachMedia(video);
          hlsInstance.loadSource(streamUrl);
          playVideo();
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = streamUrl;
          playVideo();
        }
      } else {
        playVideo();
      }
    }

    cover.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupSearchPage();
    setupCategoryFilter();
    setupPlayer();
  });
})();
