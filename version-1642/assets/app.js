(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll(".site-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var parent = panel.parentElement || document;
      var search = panel.querySelector(".card-search");
      var region = panel.querySelector(".region-filter");
      var year = panel.querySelector(".year-filter");
      var cards = Array.prototype.slice.call(parent.querySelectorAll("[data-card]"));
      var empty = parent.querySelector(".empty-state");

      function getText(card) {
        return (card.getAttribute("data-text") || "").toLowerCase();
      }

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var okKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
          var okRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var ok = okKeyword && okRegion && okYear;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, region, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && search) {
        search.value = q;
      }
      apply();
    });
  }

  function startVideo(video, layer, url) {
    var done = false;

    function playNow() {
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    function begin() {
      if (done) {
        return;
      }
      done = true;
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        playNow();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playNow();
        });
      } else {
        video.src = url;
        playNow();
      }
    }

    if (layer) {
      layer.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!done) {
        begin();
      }
    });
  }

  window.bootPlayer = function (url) {
    ready(function () {
      var video = document.querySelector("[data-movie-video]");
      var layer = document.querySelector("[data-play-layer]");
      if (video && url) {
        startVideo(video, layer, url);
      }
    });
  };

  ready(function () {
    setupNav();
    setupHeaderSearch();
    setupHero();
    setupFilters();
  });
})();
