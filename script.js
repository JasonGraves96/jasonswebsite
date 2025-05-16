let player;
let apiReady = false;
let staticShown = false;
let slowMode = false;
let reverseMode = false;
let fastMode = false;
let reverseInterval = null;
const defaultVideoId = 'jBklcmh2JfM';

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

// Check if eject menu is open
function isMenuOpen() {
  return document.getElementById('ejectMenu').style.display === 'block';
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
  const menu = document.getElementById('ejectMenu');
  menu.style.display = 'none';
  document.querySelector('.tv-container').classList.remove('menu-open');
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
  if (isMenuOpen()) return;
  if (player) player.stopVideo();
  clearReverse();
  staticShown ? hideStatic() : showStatic();
  staticShown = !staticShown;
};

// Toggle eject menu visibility on both buttons
['ejectBtn','ejectBtn2'].forEach(id => {
  document.getElementById(id).onclick = () => {
    const menu = document.getElementById('ejectMenu');
    const container = document.querySelector('.tv-container');
    const open = menu.style.display === 'block';
    menu.style.display = open ? 'none' : 'block';
    container.classList.toggle('menu-open', !open);
  };
});

// Handle tape selection clicks
document.querySelectorAll('#ejectMenu img').forEach(img => {
  img.onclick = () => loadVideo(img.dataset.video);
});

// Playback control buttons
document.querySelector('.play-btn').onclick = () => {
  if (isMenuOpen()) return;
  clearReverse();
  if (!player) {
    loadVideo(defaultVideoId);
  } else {
    player.playVideo();
  }
};
document.querySelector('.stop-btn').onclick = () => {
  if (isMenuOpen()) return;
  clearReverse();
  player && player.stopVideo();
};
// Pause via still button
document.querySelector('.still-btn').onclick = () => {
  if (isMenuOpen()) return;
  clearReverse();
  player && player.pauseVideo();
};
// Slow mode toggle via slow button
document.querySelector('.slow-btn').onclick = () => {
  if (isMenuOpen() || !player) return;
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
  if (isMenuOpen() || !player) return;
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
  if (isMenuOpen() || !player) return;
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
  if (isMenuOpen()) return;
  clearReverse();
  if (player) player.isMuted() ? player.unMute() : player.mute();
};

// Reset button: reload entire page
document.querySelector('.reset-btn').onclick = () => {
  if (isMenuOpen()) return;
  location.reload();
};

// Filter toggle buttons
const iframeEl = document.querySelector('.content-frame');
['colour','tint','bright','contrast','sharp','vhold'].forEach(cls => {
  document.querySelector(`.${cls}-btn`).onclick = () => {
    if (isMenuOpen()) return;
    iframeEl.classList.toggle(cls === 'colour' ? 'grayscale' : cls);
  };
});

// Dynamic background gradient on mouse move
document.onmousemove = e => {
  if (isMenuOpen()) return;
  document.body.style.background = `linear-gradient(${(e.clientX/window.innerWidth)*360}deg, #008080, #FF00FF)`;
};