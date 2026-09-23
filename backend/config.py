import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

CLOUD_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
CLOUD_API_KEY: str = os.getenv("GEMINI_API_KEY", "USE_API_KEY")  # Or paste your AIzaSy... key directly
CLOUD_MODEL_NAME: str = os.getenv("CLOUD_MODEL_NAME", "gemini-3.5-flash-lite")
CLOUD_TIMEOUT_SECONDS: float = 8.0

OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
LOCAL_MODEL_NAME: str = os.getenv("LOCAL_MODEL_NAME", "aya-expanse:8b")

SUPPORTED_LANGUAGES: Dict[str, Dict[str, Any]] = {
    "hi": {
        "name": "Hindi",
        "native": "हिन्दी",
        "script": "Devanagari",
        "direction": "ltr",
        "font_class": "font-devanagari",
        "t_v_system": "Aap (formal) / Tum (semi-formal) / Tu (informal/intimate)"
    },
    "ta": {
        "name": "Tamil",
        "native": "தமிழ்",
        "script": "Tamil",
        "direction": "ltr",
        "font_class": "font-tamil",
        "t_v_system": "Neenga (formal/respectful) / Nee (informal/casual)"
    },
    "kn": {
        "name": "Kannada",
        "native": "ಕನ್ನಡ",
        "script": "Kannada",
        "direction": "ltr",
        "font_class": "font-kannada",
        "t_v_system": "Neevu (formal/respectful) / Neenu (informal/casual)"
    },
    "ar": {
        "name": "Arabic",
        "native": "العربية",
        "script": "Arabic",
        "direction": "rtl",
        "font_class": "font-arabic",
        "t_v_system": "Antum/Hadratak (formal) / Anta/Anti (standard) / Inta (colloquial)"
    }
}

CRT_TAXONOMY: Dict[str, str] = {
    "C1": "Register Mismatch - Inappropriate honorific or pronoun level (e.g., tu vs aap, nee vs neenga)",
    "C2": "Idiomatic Opacity - Culturally bounded metaphors or idioms that do not translate literally",
    "C3": "Gendered Language - Inappropriate or mismatched grammatical gender markings or agreements",
    "C4": "Hierarchy Violation - Inadequate deference to seniority, status, or organizational roles",
    "C5": "Cultural/Religious Sensitivity - Insensitive phrasing touching faith, sacred tenets, or cultural taboos"
}
