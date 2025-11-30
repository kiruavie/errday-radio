from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pathlib import Path

from .models import Radio, Podcast, Episode
from .utils.data_loader import load_json_file
from .utils.rss_parser import parse_podcast_feed

app = FastAPI(
    title="Errday Radio API",
    description="API pour écouter des radios et podcasts",
    version="1.0.0"
)

# Configuration CORS pour l'extension Chrome
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines autorisées
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load static files
BASE_DIR = Path(__file__).resolve().parent
radios_data = load_json_file("radios.json")
podcasts_data = load_json_file("podcasts.json")
  
# RADIOS 
@app.get("/radios", response_model=List[Radio])
def get_radios():
  """Récupère la liste de toutes les radios disponibles."""
  return radios_data

@app.get("/radios/{radio_id}", response_model=Radio)
def get_radio(radio_id: str):
  """Récupère les informations d'une radio spécifique."""
  for r in radios_data:
    if r["id"] == radio_id:
      return r
  raise HTTPException(status_code=404, detail="Radio not found")
  
# PODCAST

@app.get("/podcasts", response_model=List[Podcast])
def get_podcasts():
  """Récupère la liste de tous les podcasts disponibles."""
  return podcasts_data

@app.get("/podcasts/{podcast_id}/episodes", response_model=List[Episode])
def get_podcast_episodes(podcast_id: str):
  """Récupère les épisodes d'un podcast spécifique."""
  for p in podcasts_data:
    if p["id"] == podcast_id:
      episodes = parse_podcast_feed(p["rss"])
      return episodes
  raise HTTPException(status_code=404, detail="Podcast not found")

@app.get("/")
def root():
  """Point d'entrée de l'API."""
  return {
    "message": "Bienvenue sur l'API Errday Radio",
    "endpoints": {
      "radios": "/radios",
      "podcasts": "/podcasts",
      "episodes": "/podcasts/{podcast_id}/episodes"
    }
  }
