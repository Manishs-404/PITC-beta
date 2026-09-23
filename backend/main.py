from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import SUPPORTED_LANGUAGES
from app.models import LanguageInfo
from app.routers import analyse, reply, coach

app = FastAPI(
    title="PITC Backend Engine",
    description="Proactive Intelligent Translation Coach - Cross-Cultural Pragmatics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyse.router)
app.include_router(reply.router)
app.include_router(coach.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "PITC Backend Engine"}

@app.get("/languages", response_model=List[LanguageInfo])
async def get_supported_languages():
    return [
        LanguageInfo(code=code, **meta)
        for code, meta in SUPPORTED_LANGUAGES.items()
    ]