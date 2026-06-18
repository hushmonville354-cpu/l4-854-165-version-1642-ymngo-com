(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        const toggle = qs('.mobile-toggle');
        const nav = qs('.main-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        const slides = qsa('.hero-slide');
        const dots = qsa('.hero-dot');
        if (!slides.length) {
            return;
        }
        let index = 0;
        function show(next) {
            slides[index].classList.remove('is-active');
            if (dots[index]) {
                dots[index].classList.remove('is-active');
            }
            index = next;
            slides[index].classList.add('is-active');
            if (dots[index]) {
                dots[index].classList.add('is-active');
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
    }

    function initGlobalSearch() {
        const input = qs('#globalSearch');
        const results = qs('#globalSearchResults');
        const index = window.movieSearchIndex || [];
        if (!input || !results || !index.length) {
            return;
        }
        function render(items) {
            if (!items.length) {
                results.innerHTML = '';
                results.classList.remove('is-open');
                return;
            }
            results.innerHTML = items.slice(0, 12).map(function (item) {
                return [
                    '<a class="search-result-item" href="./' + item.url + '">',
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
                    '<span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>',
                    '<strong>' + item.title + '</strong>',
                    '</a>'
                ].join('');
            }).join('');
            results.classList.add('is-open');
        }
        input.addEventListener('input', function () {
            const query = input.value.trim().toLowerCase();
            if (!query) {
                render([]);
                return;
            }
            render(index.filter(function (item) {
                const target = [item.title, item.year, item.region, item.genre, item.type].join(' ').toLowerCase();
                return target.indexOf(query) !== -1;
            }));
        });
        document.addEventListener('click', function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove('is-open');
            }
        });
    }

    function initLocalFilter() {
        const input = qs('.local-filter');
        const yearSelect = qs('.year-filter');
        const cards = qsa('.filter-list .movie-card');
        if (!cards.length || (!input && !yearSelect)) {
            return;
        }
        function apply() {
            const query = input ? input.value.trim().toLowerCase() : '';
            const year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                const text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
                const matchedQuery = !query || text.indexOf(query) !== -1;
                const matchedYear = !year || card.dataset.year === year;
                card.classList.toggle('is-hidden-card', !(matchedQuery && matchedYear));
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
    }

    window.initMoviePlayer = function (source) {
        const video = qs('.movie-video');
        const overlay = qs('.player-overlay');
        if (!video || !source) {
            return;
        }
        let ready = false;
        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initLocalFilter();
    });
}());
