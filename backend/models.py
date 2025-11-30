from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class Radio(BaseModel):
    id: str
    name: str
    streamUrl: str
    category: str


class Podcast(BaseModel):
    id: str
    name: str
    rss: str


class Episode(BaseModel):
    title: str
    audio: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
