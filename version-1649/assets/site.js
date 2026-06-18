
(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var navPanel = document.querySelector('.nav-panel');
        if (menuButton && navPanel) {
            menuButton.addEventListener('click', function () {
                var opened = navPanel.classList.toggle('is-open');
                menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
            var grid = panel.parentElement ? panel.parentElement.querySelector('[data-filter-grid]') : null;
            if (!grid) {
                return;
            }
            var keyword = panel.querySelector('[data-filter-keyword]');
            var year = panel.querySelector('[data-filter-year]');
            var category = panel.querySelector('[data-filter-category]');
            var reset = panel.querySelector('[data-filter-reset]');
            var count = panel.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && keyword) {
                keyword.value = query;
            }

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function apply() {
                var q = normalize(keyword ? keyword.value : '');
                var y = normalize(year ? year.value : '');
                var c = normalize(category ? category.value : '');
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;

                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (y && cardYear !== y) {
                        matched = false;
                    }
                    if (c && cardCategory !== c) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden-by-filter', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            [keyword, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (keyword) {
                        keyword.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (category) {
                        category.value = '';
                    }
                    apply();
                });
            }

            apply();
        });
    });
})();
