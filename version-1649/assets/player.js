
import { H as Hls } from './hls-dru42stk.js';

export function initPlayer(source) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var hls = null;
    var attached = false;

    function attach() {
        if (attached) {
            return Promise.resolve();
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1600);
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    function play() {
        if (cover) {
            cover.classList.add('is-hidden');
        }
        attach().then(function () {
            return video.play();
        }).catch(function () {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        });
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
