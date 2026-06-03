const videos = Array.from(document.querySelectorAll("video"));
const actionButtons = document.querySelectorAll("[data-video-action]");

function videosForTarget(target) {
  if (!target) {
    return videos;
  }

  const scope = document.querySelector(`[data-video-scope="${target}"]`);
  return scope ? Array.from(scope.querySelectorAll("video")) : [];
}

function alignVideoStarts(targetVideos = videos) {
  targetVideos.forEach((video) => {
    video.muted = true;

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; play() will still start from the beginning.
    }
  });
}

async function playAllVideos(targetVideos = videos) {
  alignVideoStarts(targetVideos);
  await Promise.allSettled(targetVideos.map((video) => video.play()));
}

function pauseAllVideos(targetVideos = videos) {
  targetVideos.forEach((video) => video.pause());
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.videoAction;
    const targetVideos = videosForTarget(button.dataset.videoTarget);

    if (action === "play") {
      playAllVideos(targetVideos);
      return;
    }

    if (action === "pause") {
      pauseAllVideos(targetVideos);
    }
  });
});

requestAnimationFrame(() => {
  playAllVideos();
});
