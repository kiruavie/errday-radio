// Service Worker avec document offscreen pour l'audio en arrière-plan
let currentTrack = null;
let isPlaying = false;
let offscreenDocumentCreated = false;

// Créer le document offscreen pour la lecture audio
async function createOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Lecture de radios et podcasts en arrière-plan",
    });
    offscreenDocumentCreated = true;
    console.log("Offscreen document created");
  } catch (error) {
    console.error("Error creating offscreen document:", error);
  }
}

// Envoyer un message au document offscreen
async function sendToOffscreen(message) {
  if (!offscreenDocumentCreated) {
    await createOffscreenDocument();
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Messages venant du document offscreen
  if (message.action === "audioEnded") {
    currentTrack = null;
    isPlaying = false;
    chrome.storage.local.set({ currentTrack: null, isPlaying: false });
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  if (message.action === "audioError") {
    chrome.action.setBadgeText({ text: "✖" });
    chrome.action.setBadgeBackgroundColor({ color: "#ff6b6b" });
    return;
  }

  // Messages venant du popup
  switch (message.action) {
    case "play":
      createOffscreenDocument().then(() => {
        currentTrack = {
          url: message.url,
          name: message.name,
        };
        isPlaying = true;

        // Envoyer au document offscreen
        sendToOffscreen({
          action: "play",
          url: message.url,
          name: message.name,
        }).then((response) => {
          if (response?.success) {
            chrome.storage.local.set({ currentTrack, isPlaying: true });
            chrome.action.setBadgeText({ text: "▶" });
            chrome.action.setBadgeBackgroundColor({ color: "#667eea" });
          }
          sendResponse(response);
        });
      });
      return true; // Pour réponse asynchrone

    case "pause":
      sendToOffscreen({ action: "pause" }).then((response) => {
        isPlaying = false;
        chrome.storage.local.set({ isPlaying: false });
        chrome.action.setBadgeText({ text: "⏸" });
        sendResponse(response);
      });
      return true;

    case "resume":
      sendToOffscreen({ action: "resume" }).then((response) => {
        isPlaying = true;
        chrome.storage.local.set({ isPlaying: true });
        chrome.action.setBadgeText({ text: "▶" });
        sendResponse(response);
      });
      return true;

    case "stop":
      sendToOffscreen({ action: "stop" }).then((response) => {
        currentTrack = null;
        isPlaying = false;
        chrome.storage.local.set({ currentTrack: null, isPlaying: false });
        chrome.action.setBadgeText({ text: "" });
        sendResponse(response);
      });
      return true;

    case "getState":
      chrome.storage.local.get(["currentTrack", "isPlaying"], (result) => {
        sendResponse({
          currentTrack: result.currentTrack || null,
          isPlaying: result.isPlaying || false,
        });
      });
      return true;
  }

  return true;
});

// Restaurer la lecture au démarrage du service worker
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["currentTrack", "isPlaying"], (result) => {
    if (result.currentTrack && result.isPlaying) {
      createOffscreenDocument().then(() => {
        sendToOffscreen({
          action: "play",
          url: result.currentTrack.url,
          name: result.currentTrack.name,
        });
        currentTrack = result.currentTrack;
        isPlaying = true;
        chrome.action.setBadgeText({ text: "▶" });
        chrome.action.setBadgeBackgroundColor({ color: "#667eea" });
      });
    }
  });
});
