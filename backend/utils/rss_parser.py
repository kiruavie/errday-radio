import feedparser
from typing import List, Dict, Optional


def parse_podcast_feed(rss_url: str) -> List[Dict[str, Optional[str]]]:
    """
    Parse un flux RSS de podcast et retourne une liste d'épisodes.
    
    Args:
        rss_url: L'URL du flux RSS
        
    Returns:
        Liste de dictionnaires contenant les informations des épisodes
    """
    try:
        feed = feedparser.parse(rss_url)
        episodes = []
        
        for entry in feed.entries:
            episode = {
                "title": entry.get("title", "Sans titre"),
                "audio": entry.enclosures[0].href if entry.get("enclosures") else None,
                "description": entry.get("summary", None),
                "date": entry.get("published", None),
            }
            episodes.append(episode)
            
        return episodes
    except Exception as e:
        print(f"Erreur lors du parsing du flux RSS: {e}")
        return []
