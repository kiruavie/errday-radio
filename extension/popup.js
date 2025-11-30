const API_URL = "http://localhost:8000";

let currentPodcast = null;

// Gestion des onglets
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Désactiver tous les onglets
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  // Activer l'onglet sélectionné
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");

  // Cacher le conteneur d'épisodes si on change d'onglet
  if (tabName === "radios") {
    document.getElementById("episodes-container").classList.add("hidden");
  }
}

// Charger les radios
async function loadRadios() {
  try {
    const res = await fetch(`${API_URL}/radios`);
    if (!res.ok) throw new Error("Erreur lors du chargement des radios");

    const radios = await res.json();
    const container = document.getElementById("radio-list");
    container.innerHTML = "";

    radios.forEach((radio) => {
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <div class="item-info">
          <strong class="item-title">${radio.name}</strong>
          <span class="item-category">${radio.category}</span>
        </div>
        <button class="play-btn" data-url="${radio.streamUrl}" data-name="${radio.name}">
          ▶️ Play
        </button>
      `;
      container.appendChild(div);
    });

    // Ajouter les écouteurs d'événements
    container.querySelectorAll(".play-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        playAudio(btn.dataset.url, btn.dataset.name);
      });
    });
  } catch (error) {
    showError(
      "Impossible de charger les radios. Assurez-vous que le serveur est démarré."
    );
    console.error(error);
  }
}

// Charger les podcasts
async function loadPodcasts() {
  try {
    const res = await fetch(`${API_URL}/podcasts`);
    if (!res.ok) throw new Error("Erreur lors du chargement des podcasts");

    const podcasts = await res.json();
    const container = document.getElementById("podcast-list");
    container.innerHTML = "";

    podcasts.forEach((podcast) => {
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <div class="item-info">
          <strong class="item-title">${podcast.name}</strong>
        </div>
        <button class="view-btn" data-id="${podcast.id}" data-name="${podcast.name}">
          👁️ Voir
        </button>
      `;
      container.appendChild(div);
    });

    // Ajouter les écouteurs
    container.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        loadEpisodes(btn.dataset.id, btn.dataset.name);
      });
    });
  } catch (error) {
    showError("Impossible de charger les podcasts.");
    console.error(error);
  }
}

// Charger les épisodes d'un podcast
async function loadEpisodes(podcastId, podcastName) {
  try {
    const res = await fetch(`${API_URL}/podcasts/${podcastId}/episodes`);
    if (!res.ok) throw new Error("Erreur lors du chargement des épisodes");

    const episodes = await res.json();
    const container = document.getElementById("episode-list");
    const titleElem = document.getElementById("podcast-title");

    titleElem.textContent = podcastName;
    container.innerHTML = "";

    // Cacher la liste des podcasts, afficher les épisodes
    document.getElementById("podcast-list").classList.add("hidden");
    document.getElementById("episodes-container").classList.remove("hidden");

    episodes.forEach((episode) => {
      const div = document.createElement("div");
      div.className = "item-card episode-card";
      div.innerHTML = `
        <div class="item-info">
          <strong class="item-title">${episode.title}</strong>
          ${
            episode.date
              ? `<span class="episode-date">${new Date(
                  episode.date
                ).toLocaleDateString("fr-FR")}</span>`
              : ""
          }
          ${
            episode.description
              ? `<p class="episode-desc">${episode.description.substring(
                  0,
                  100
                )}...</p>`
              : ""
          }
        </div>
        ${
          episode.audio
            ? `<button class="play-btn" data-url="${episode.audio}" data-name="${episode.title}">▶️ Play</button>`
            : '<span class="no-audio">Pas d\'audio</span>'
        }
      `;
      container.appendChild(div);
    });

    // Ajouter les écouteurs
    container.querySelectorAll(".play-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        playAudio(btn.dataset.url, btn.dataset.name);
      });
    });
  } catch (error) {
    showError("Impossible de charger les épisodes.");
    console.error(error);
  }
}

// Bouton retour
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("podcast-list").classList.remove("hidden");
  document.getElementById("episodes-container").classList.add("hidden");
});

// Fonction pour lire l'audio via le background (offscreen)
function playAudio(url, name) {
  const nowPlaying = document.getElementById("now-playing");

  // Envoyer au service worker qui gère le document offscreen
  chrome.runtime.sendMessage({ action: "play", url, name }, (response) => {
    if (response && response.success) {
      nowPlaying.textContent = `🎵 ${name}`;
    } else {
      showError("Erreur lors de la lecture");
    }
  });
}

// Afficher un message d'erreur
function showError(message) {
  const errorElem = document.getElementById("error-message");
  errorElem.textContent = message;
  errorElem.classList.remove("hidden");

  setTimeout(() => {
    errorElem.classList.add("hidden");
  }, 5000);
}

// Initialisation
loadRadios();
loadPodcasts();

// Restaurer l'état de lecture au chargement
chrome.storage.local.get(["currentTrack", "isPlaying"], (result) => {
  if (result.currentTrack) {
    const nowPlaying = document.getElementById("now-playing");
    nowPlaying.textContent = `🎵 ${result.currentTrack.name}`;
  }
});

// Ajouter boutons pause/stop dans le lecteur
const localPlayer = document.getElementById("player");
if (localPlayer) {
  // Cacher le lecteur local car on utilise l'offscreen
  localPlayer.style.display = "none";

  // Créer des contrôles personnalisés
  const playerContainer = document.querySelector(".player-container");
  const controls = document.createElement("div");
  controls.className = "player-controls";
  controls.innerHTML = `
    <button id="pause-btn" class="control-btn">⏸️ Pause</button>
    <button id="resume-btn" class="control-btn" style="display:none;">▶️ Reprendre</button>
    <button id="stop-btn" class="control-btn">⏹️ Stop</button>
  `;
  playerContainer.appendChild(controls);

  // Gestion des boutons
  document.getElementById("pause-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "pause" });
    document.getElementById("pause-btn").style.display = "none";
    document.getElementById("resume-btn").style.display = "inline-block";
  });

  document.getElementById("resume-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "resume" });
    document.getElementById("resume-btn").style.display = "none";
    document.getElementById("pause-btn").style.display = "inline-block";
  });

  document.getElementById("stop-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stop" });
    document.getElementById("now-playing").textContent =
      "Aucune lecture en cours";
    document.getElementById("pause-btn").style.display = "inline-block";
    document.getElementById("resume-btn").style.display = "none";
  });
}
