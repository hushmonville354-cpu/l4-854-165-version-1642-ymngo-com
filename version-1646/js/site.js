(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-filter]');
    var select = scope.querySelector('[data-region-filter]');
    var list = scope.parentElement.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = select ? select.value.trim() : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var regionText = card.getAttribute('data-region') || '';
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var regionMatch = !region || regionText.indexOf(region) !== -1;
        card.style.display = keywordMatch && regionMatch ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a class="card-cover" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-score">' + escapeHtml(String(movie.score)) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var searchResults = document.getElementById('search-results');
  var searchInput = document.getElementById('search-input');
  var searchTitle = document.getElementById('search-title');

  if (searchResults && window.SITE_MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput) {
      searchInput.value = query;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }

    renderSearch(query);
  }

  function renderSearch(query) {
    var value = String(query || '').trim().toLowerCase();
    var results = window.SITE_MOVIE_INDEX.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return !value || haystack.indexOf(value) !== -1;
    }).slice(0, 80);

    if (searchTitle) {
      searchTitle.textContent = value ? '搜索结果' : '热门推荐';
    }

    if (searchResults) {
      searchResults.innerHTML = results.map(movieCard).join('');
    }
  }

  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.video-start');
    var source = shell.getAttribute('data-stream');
    var ready = false;

    function prepareVideo() {
      if (!video || !source || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var stream = new window.Hls({ enableWorker: true });
        stream.loadSource(source);
        stream.attachMedia(video);
      } else {
        video.src = source;
      }

      ready = true;
    }

    function playVideo() {
      prepareVideo();
      shell.classList.add('is-playing');

      if (video) {
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', prepareVideo);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
})();
