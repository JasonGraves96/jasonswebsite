let player;
let apiReady = false;
let staticShown = false;
let slowMode = false;
let reverseMode = false;
let fastMode = false;
let reverseInterval = null;

// Called by YouTube API to signal readiness
function onYouTubeIframeAPIReady() {
  apiReady = true;
}

// Initialize YouTube player instance
function initPlayer(id) {
  player = new YT.Player('ytplayer', {
    videoId: id,
    events: { onReady: () => {} }
  });
}

// Load or switch to a new video
function loadVideo(id) {
  if (!apiReady) return;
  hideStatic();
  clearReverse();
  const frame = document.getElementById('ytplayer');
  if (!player) {
    frame.src = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
    initPlayer(id);
  } else {
    player.loadVideoById(id);
  }
  // Hide eject menu after selecting
  document.getElementById('ejectMenu').style.display = 'none';
}

// Show/hide static overlay
function showStatic() {
  document.getElementById('staticOverlay').style.display = 'block';
}
function hideStatic() {
  document.getElementById('staticOverlay').style.display = 'none';
}

// Stop reverse mode if active
function clearReverse() {
  if (reverseInterval) {
    clearInterval(reverseInterval);
    reverseInterval = null;
  }
  reverseMode = false;
}

// Power button: stop playback and toggle static
document.querySelector('.power-btn').onclick = () => {
  if (player) player.stopVideo();
  clearReverse();
  staticShown ? hideStatic() : showStatic();
  staticShown = !staticShown;
};

// Toggle eject menu visibility on both buttons
['ejectBtn', 'ejectBtn2'].forEach(id => {
  document.getElementById(id).onclick = () => {
    const menu = document.getElementById('ejectMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  };
});

// Handle tape selection clicks
document.querySelectorAll('#ejectMenu img').forEach(img => {
  img.onclick = () => loadVideo(img.dataset.video);
});

// Playback control buttons
document.querySelector('.play-btn').onclick = () => {
  clearReverse();
  player && player.playVideo();
};
document.querySelector('.stop-btn').onclick = () => {
  clearReverse();
  player && player.stopVideo();
};
// Pause via still button
document.querySelector('.still-btn').onclick = () => {
  clearReverse();
  player && player.pauseVideo();
};
// Slow mode toggle via slow button
document.querySelector('.slow-btn').onclick = () => {
  if (!player) return;
  clearReverse();
  slowMode = !slowMode;
  if (slowMode) {
    fastMode = false;
    player.setPlaybackRate(0.5);
  } else {
    player.setPlaybackRate(1);
  }
};
// Reverse mode toggle via rewind button
document.querySelector('.rewind-btn').onclick = () => {
  if (!player) return;
  // exit other modes
  slowMode = false;
  fastMode = false;
  player.setPlaybackRate(1);
  if (!reverseMode) {
    reverseMode = true;
    reverseInterval = setInterval(() => {
      const current = player.getCurrentTime();
      player.seekTo(Math.max(0, current - 0.2), true);
    }, 200);
  } else {
    clearReverse();
  }
};
// Fast mode toggle via fast-forward button
document.querySelector('.ff-btn').onclick = () => {
  if (!player) return;
  // exit other modes
  clearReverse();
  slowMode = false;
  if (!fastMode) {
    fastMode = true;
    player.setPlaybackRate(2);
  } else {
    fastMode = false;
    player.setPlaybackRate(1);
  }
};
// Mute toggle via volume button
document.querySelector('.volume-btn').onclick = () => {
  clearReverse();
  if (player) player.isMuted() ? player.unMute() : player.mute();
};

// Filter toggle buttons
const iframeEl = document.querySelector('.content-frame');
document.querySelector('.colour-btn').onclick   = () => iframeEl.classList.toggle('grayscale');
document.querySelector('.tint-btn').onclick     = () => iframeEl.classList.toggle('tint');
document.querySelector('.bright-btn').onclick   = () => iframeEl.classList.toggle('bright');
document.querySelector('.contrast-btn').onclick = () => iframeEl.classList.toggle('contrast');
document.querySelector('.sharp-btn').onclick    = () => iframeEl.classList.toggle('sharp');
document.querySelector('.vhold-btn').onclick    = () => iframeEl.classList.toggle('vhold');

// Dynamic background gradient on mouse move
document.onmousemove = e => {
  document.body.style.background = `linear-gradient(${(e.clientX/window.innerWidth)*360}deg, #008080, #FF00FF)`;
};