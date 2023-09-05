const video = document.getElementById('boomerangVideo');

video.addEventListener('ended', function() {
    video.playbackRate = -1;

    video.play();

    video.addEventListener('playing', function() {
        video.playbackRate = 1;
    }, { once: true });
});