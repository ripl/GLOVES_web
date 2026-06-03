const videos = Array.from(document.querySelectorAll("video"));
const actionButtons = document.querySelectorAll("[data-video-action]");

function alignVideoStarts() {
  videos.forEach((video) => {
    video.muted = true;

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; play() will still start from the beginning.
    }
  });
}

async function playAllVideos() {
  alignVideoStarts();
  await Promise.allSettled(videos.map((video) => video.play()));
}

function pauseAllVideos() {
  videos.forEach((video) => video.pause());
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.videoAction;

    if (action === "play") {
      playAllVideos();
      return;
    }

    if (action === "pause") {
      pauseAllVideos();
    }
  });
});

requestAnimationFrame(() => {
  playAllVideos();
});
