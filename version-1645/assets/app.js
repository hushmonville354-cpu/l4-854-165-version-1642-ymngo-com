(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    all("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        window.location.href = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    if (!slides.length) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      all("[data-filter-input]").forEach(function (input) {
        if (!input.value) {
          input.value = query;
        }
      });
    }

    all("[data-filter-scope]").forEach(function (scope) {
      var grid = scope.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = all("[data-card]", grid);
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var genre = scope.querySelector("[data-filter-genre]");
      var empty = scope.querySelector("[data-empty-note]");

      function text(card) {
        return [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var g = genre ? genre.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var source = text(card);
          var matched = true;
          if (q && source.indexOf(q) === -1) {
            matched = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            matched = false;
          }
          if (r && (card.getAttribute("data-region") || "").indexOf(r) === -1) {
            matched = false;
          }
          if (g && (card.getAttribute("data-genre") || "").indexOf(g) === -1 && (card.getAttribute("data-tags") || "").indexOf(g) === -1) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-stream]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function load() {
      if (ready || !video || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      load();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button && video) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayer();
  });
}());
