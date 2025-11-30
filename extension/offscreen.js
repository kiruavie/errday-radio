// Document offscreen pour la lecture audio en arrière-plan
const player = document.getElementById("offscreen-player");

// Écouter les messages du service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Offscreen received message:", message);

  switch (message.action) {
    case "play":
      player.src = message.url;
      player
        .play()
        .then(() => {
          console.log("Playing:", message.name);
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Play error:", error);
          sendResponse({ success: false, error: error.message });
        });
      break;

    case "pause":
      player.pause();
      sendResponse({ success: true });
      break;

    case "resume":
      player
        .play()
        .then(() => sendResponse({ success: true }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
      break;

    case "stop":
      player.pause();
      player.src = "";
      sendResponse({ success: true });
      break;

    case "setVolume":
      player.volume = message.volume;
      sendResponse({ success: true });
      break;

    case "getState":
      sendResponse({
        paused: player.paused,
        currentTime: player.currentTime,
        duration: player.duration,
        src: player.src,
      });
      break;
  }

  return true; // Pour les réponses asynchrones
});

// Informer le service worker quand la lecture se termine
player.addEventListener("ended", () => {
  chrome.runtime.sendMessage({ action: "audioEnded" });
});

player.addEventListener("error", (e) => {
  console.error("Player error:", e);
  chrome.runtime.sendMessage({
    action: "audioError",
    error: player.error?.message,
  });
});

console.log("Offscreen document ready");
