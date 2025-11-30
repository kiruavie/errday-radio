# 🎵 Errday Radio

Une extension Chrome permettant d'écouter des radios en ligne et des podcasts gratuitement.

## 📋 Fonctionnalités

- 📻 **Écoute de radios en streaming** : Accédez à vos radios préférées
- 🎙️ **Podcasts** : Parcourez et écoutez des épisodes de podcasts
- 🎨 **Interface moderne** : Design élégant avec système d'onglets
- 🔄 **Flux RSS** : Récupération automatique des épisodes via RSS
- 🎵 **Lecteur intégré** : Contrôles audio directement dans l'extension

## 🚀 Installation

### Backend (API FastAPI)

1. **Créer un environnement virtuel**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Sur Windows: .venv\Scripts\activate
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Lancer le serveur**
```bash
uvicorn main:app --reload --port 8000
```

L'API sera accessible sur `http://localhost:8000`
Documentation interactive : `http://localhost:8000/docs`

### Extension Chrome

1. **Ouvrir Chrome** et aller dans `chrome://extensions/`
2. **Activer le mode développeur** (en haut à droite)
3. **Cliquer sur "Charger l'extension non empaquetée"**
4. **Sélectionner le dossier** `extension/`
5. L'extension apparaîtra dans votre barre d'outils Chrome 🎉

## 📁 Structure du projet

```
errday-radio/
├── backend/
│   ├── main.py              # Point d'entrée de l'API
│   ├── models.py            # Modèles Pydantic
│   ├── radios.json          # Données des radios
│   ├── podcasts.json        # Données des podcasts
│   ├── requirements.txt     # Dépendances Python
│   └── utils/
│       ├── data_loader.py   # Chargement des fichiers JSON
│       └── rss_parser.py    # Parsing des flux RSS
├── extension/
│   ├── manifest.json        # Configuration de l'extension
│   ├── popup.html           # Interface utilisateur
│   ├── popup.js             # Logique JavaScript
│   └── style.css            # Styles CSS
└── README.md
```

## 🔧 API Endpoints

- `GET /` - Page d'accueil de l'API
- `GET /radios` - Liste toutes les radios
- `GET /radios/{radio_id}` - Détails d'une radio
- `GET /podcasts` - Liste tous les podcasts
- `GET /podcasts/{podcast_id}/episodes` - Épisodes d'un podcast

## 📝 Ajouter du contenu

### Ajouter une radio

Éditer `backend/radios.json` :
```json
{
  "id": "unique-id",
  "name": "Nom de la radio",
  "streamUrl": "https://url-du-stream.com",
  "category": "lofi"
}
```

### Ajouter un podcast

Éditer `backend/podcasts.json` :
```json
{
  "id": "unique-id",
  "name": "Nom du podcast",
  "rss": "https://url-du-flux-rss.com"
}
```

## 🛠️ Technologies utilisées

### Backend
- **FastAPI** - Framework web moderne et rapide
- **Uvicorn** - Serveur ASGI
- **Feedparser** - Parsing de flux RSS
- **Pydantic** - Validation des données

### Frontend
- **HTML5 / CSS3** - Interface utilisateur
- **JavaScript (Vanilla)** - Logique métier
- **Chrome Extension API** - Intégration navigateur

## 🎨 Améliorations apportées

✅ Correction des bugs critiques (routes, logique d'erreurs)  
✅ Ajout de CORS pour l'extension Chrome  
✅ Architecture modulaire avec séparation des responsabilités  
✅ Modèles Pydantic pour la validation  
✅ Interface moderne avec onglets  
✅ Support complet des podcasts  
✅ Gestion d'erreurs robuste  
✅ Documentation API interactive (Swagger)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Support

Si vous rencontrez un problème :
1. Vérifiez que le serveur backend est démarré
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les logs du serveur FastAPI

---

Fait avec ❤️ pour les amateurs de radio et de podcasts
