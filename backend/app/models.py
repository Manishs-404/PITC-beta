from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Shared & Language ---
class LanguageInfo(BaseModel):
    code: str
    name: str
    native: str
    script: str
    direction: str
    font_class: str
    t_v_system: str

class MessageItem(BaseModel):
    speaker: str
    message: str

# --- Mode 1: Thread Analyser ---
class ThreadAnalyseRequest(BaseModel):
    session_id: str
    language_code: str
    thread: List[MessageItem]
    provider: Optional[str] = Field(default="auto", description="'cloud', 'local', or 'auto'")

class ThreadAnalyseResponse(BaseModel):
    session_id: str
    health_score: str
    health_explanation: str
    riskiest_message_index: int
    crt_category: str
    crt_explanation: str
    recommendation: str
    model_used: Optional[str] = None

# --- Mode 2: Smart Reply ---
class SmartReplyRequest(BaseModel):
    session_id: str
    language_code: str
    thread: List[MessageItem]
    goal: str
    provider: Optional[str] = Field(default="auto", description="'cloud', 'local', or 'auto'")

class SmartReplyResponse(BaseModel):
    session_id: str
    english_reply: str
    translated_reply: str
    register_explanation: str
    model_used: Optional[str] = None

# --- Mode 3: Single Message Coach ---
class CoachIntent(BaseModel):
    purpose: str
    recipient: str
    tone: Optional[str] = "Respectful"

class FormalityVariant(BaseModel):
    register: str
    text: str
    nuance: str

class WhatIfBranch(BaseModel):
    anticipated_reply: str
    risk_level: str
    risk_reason: str
    safer_alternative: str

class CoachRequest(BaseModel):
    session_id: str
    source_text: str
    language_code: str
    intent: CoachIntent
    clarification_answers: Optional[Dict[str, str]] = None
    provider: Optional[str] = Field(default="auto", description="'cloud', 'local', or 'auto'")

class CoachResponse(BaseModel):
    session_id: str
    needs_clarification: bool
    clarification_questions: List[str] = []
    clarification_reason: Optional[str] = None
    primary_translation: Optional[str] = None
    variants: List[FormalityVariant] = []
    branches: List[WhatIfBranch] = []
    cultural_notes: Optional[str] = None
    model_used: Optional[str] = None