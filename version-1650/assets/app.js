document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHero();
  setupFilters();
  setupImages();
});

function setupMenu() {
  const button = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  function show(target) {
    index = (target + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

function setupFilters() {
  const input = document.querySelector("[data-filter-input]");
  const region = document.querySelector("[data-filter-region]");
  const year = document.querySelector("[data-filter-year]");
  const grid = document.querySelector("[data-filter-grid]");
  const empty = document.querySelector("[data-filter-empty]");

  if (!grid || (!input && !region && !year)) {
    return;
  }

  if (input && input.hasAttribute("data-query-sync")) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      input.value = query;
    }
  }

  const cards = Array.from(grid.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function apply() {
    const term = normalize(input ? input.value : "");
    const selectedRegion = normalize(region ? region.value : "");
    const selectedYear = normalize(year ? year.value : "");
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      const matchTerm = !term || text.includes(term);
      const matchRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
      const matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
      const isVisible = matchTerm && matchRegion && matchYear;

      card.style.display = isVisible ? "" : "none";

      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  [input, region, year].forEach(function (control) {
    if (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    }
  });

  apply();
}

function setupImages() {
  document.querySelectorAll("img[data-cover]").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-muted");
    }, { once: true });
  });
}
