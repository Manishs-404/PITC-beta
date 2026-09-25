# 🌐 PITC: Proactive Intelligent Translation Coach

> **Real-Time Cross-Cultural Pragmatic Coaching & Pre-Send Risk Interception for Chat Interfaces**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini API](https://img.shields.io/badge/Cloud_LLM-Gemini_3.5_Flash-4285F4.svg?style=flat&logo=google&logoColor=white)](https://aistudio.google.com)
[![Ollama](https://img.shields.io/badge/Local_LLM-Aya_Expanse_8B-black.svg?style=flat&logo=ollama&logoColor=white)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Table of Contents

- [Executive Summary](#-executive-summary)
- [The Problem: Pragmatic Failure in NMT](#-the-problem-pragmatic-failure-in-nmt)
- [Key Features](#-key-features)
- [Cultural Risk Taxonomy (CRT)](#-cultural-risk-taxonomy-crt)
- [Supported Languages & T-V Honorific Systems](#-supported-languages--t-v-honorific-systems)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites & Requirements](#-prerequisites--requirements)
- [Installation & Setup](#-installation--setup)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Local Model Setup (Ollama)](#3-local-model-setup-ollama)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Resilient Multi-Engine Fallback Pipeline](#-resilient-multi-engine-fallback-pipeline)
- [Interactive Testing (Swagger UI)](#-interactive-testing-swagger-ui)
- [Capstone Evaluation Roadmap](#-capstone-evaluation-roadmap)

---

## 📖 Executive Summary

Conventional Neural Machine Translation (NMT) platforms (such as Google Translate or DeepL) excel at literal lexical substitution and syntax preservation. However, in high-context sociolinguistic environments, **how** something is articulated (social distance, deference, honorifics, hierarchy) is often more critical than **what** is said.

**PITC (Proactive Intelligent Translation Coach)** is a real-time, context-aware translation coach embedded directly into messaging workflows. Rather than providing post-hoc apologies or basic sentiment scores after a message has been delivered, PITC intercepts drafts **prior to transmission**, diagnosing pragmatic hazards and offering culturally calibrated formality variants with one-click adoption.
## ⚠️ The Problem: Pragmatic Failure in NMT

A translation can be grammatically flawless and semantically precise while remaining **sociopragmatically offensive**. 

* **The T-V Distinction Trap:** Languages like Hindi, Tamil, Kannada, and Arabic enforce strict grammatical divisions based on relative age, corporate hierarchy, and intimacy. Standard translators frequently default to informal second-person pronouns (e.g., Hindi *Tu* instead of *Aap*), leading to accidental insubordination or social embarrassment.
* **Western Bias in Off-the-Shelf LLMs:** Standard conversational models favor direct, low-context Western communicative conventions, mischaracterizing necessary hierarchical deference in Asian and Middle Eastern cultures as wordiness.
* **Latency vs. Data Sovereignty Dilemma:** Cloud-only models introduce latency spikes and risk leaking enterprise conversations; edge-only models can cause typing lag on consumer hardware.

---

## 🚀 Key Features

1. **Pre-Send Interception (Debounced Keystroke Hook):**
   * Listens to the composer with a 500–650ms debounce window.
   * Proactively flags relational risks before the "Send" action is executed.
2. **Thread Health Auditor (`POST /analyse`):**
   * Scans prior dialogue turns to detect accumulated interpersonal friction.
   * Identifies the exact `riskiest_message_index` and assigns a health status with clear actionable explanations.
3. **Interactive Formality Variants & "What-If" Simulation (`POST /coach`):**
   * Supplies 3 calibrated variations: **Formal**, **Semi-formal**, and **Casual**.
   * Simulates prospective recipient reactions (e.g., *"How your manager will likely perceive this draft"*).
4. **Smart Reply Ghostwriting (`POST /reply`):**
   * Drafts diplomatic, culturally aligned responses conditioned on user-specified communicative objectives.
5. **Bidirectional Multi-Script UI:**
   * Full LTR and RTL rendering support (Devanagari, Tamil, Kannada, and Arabic) inside a responsive WhatsApp-style layout.
6. **Dual-Provider Architecture (Cloud + Edge):**
   * Primary high-speed cloud inference via Google Gemini 3.5.
   * Automatic, zero-downtime failover to local **Aya Expanse 8B** via Ollama on network drops, 503 capacity spikes, or 429 rate limits.

---

## 🏛 Cultural Risk Taxonomy (CRT)

PITC classifies sociolinguistic risks into five standardized categories:

| Category | Designation | Definition | Example Hazard |
| :--- | :--- | :--- | :--- |
| **C1** | **Register Mismatch** | Inappropriate second-person pronoun or honorific level. | Using *Tu* instead of *Aap* with a senior manager. |
| **C2** | **Idiomatic Opacity** | Non-literal idioms or culture-bound metaphors translated verbatim. | Translating *"break a leg"* literally into Hindi or Arabic. |
| **C3** | **Gendered Language** | Erroneous grammatical gender markings, verb inflections, or agreements. | Misgendering the speaker or listener in Arabic verbal conjugations. |
| **C4** | **Hierarchy Violation** | Insufficient linguistic deference to institutional seniority or elders. | Using colloquial imperatives (*"Do this now"*) in formal workplace requests. |
| **C5** | **Cultural/Religious Sensitivity** | Inadvertently insensitive phrasing touching faith, rituals, or social taboos. | Inappropriate invocation of sacred idioms or colloquial blasphemies. |

---

## 🗣 Supported Languages & T-V Honorific Systems

| Code | Language | Script | Direction | T-V Register System |
| :---: | :--- | :--- | :---: | :--- |
| `hi` | **Hindi** | Devanagari | LTR | **Aap** (Formal) / **Tum** (Semi-Formal) / **Tu** (Informal/Intimate) |
| `ta` | **Tamil** | Tamil | LTR | **Neenga** (Formal/Respectful) / **Nee** (Informal/Casual) |
| `kn` | **Kannada** | Kannada | LTR | **Neevu** (Formal/Respectful) / **Neenu** (Informal/Casual) |
| `ar` | **Arabic** | Arabic | RTL | **Antum / Hadratak** (Formal) / **Anta / Anti** (Standard) / **Inta** (Colloquial) |

---

## 🏗 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER (React + Tailwind CSS)            │
│  WhatsApp-style Chat UI  │  Debounced Pre-Send Hook  │  Coaching Drawer│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST (JSON Payload)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (FastAPI Backend)                   │
│   ┌────────────────────┬───────────────────────┬───────────────────┐   │
│   │  /analyse Router   │     /reply Router     │   /coach Router   │   │
│   │  (Thread Auditor)  │  (Smart Ghostwriter)  │  (SIC & Variants) │   │
│   └─────────┬──────────┴───────────┬───────────┴─────────┬─────────┘   │
│             │                      │                     │             │
│             ▼                      ▼                     ▼             │
│       ┌─────────────────────────────────────────────────────────┐      │
│       │   Pragmatic Engine & Cultural Risk Taxonomy (C1 - C5)   │      │
│       └────────────────────────────┬────────────────────────────┘      │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
                      Circuit Breaker Fallback Logic
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼ (Primary Cloud Path)                                ▼ (Local Fallback)
┌──────────────────────────────┐                      ┌──────────────────────────────┐
│       CLOUD LLM TIER         │   503 Spike / Drop   │       LOCAL EDGE TIER        │
│    Google Gemini 3.5 Flash   │ ───────────────────► │      Ollama Runtime          │
│   (Direct HTTPX + REST)      │                      │     (aya-expanse:8b)         │
│  Sub-second live analysis    │                      │  100% Offline & Air-Gapped   │
└──────────────────────────────┘                      └──────────────────────────────┘
```

---

## 📂 Project Directory Structure

```text
pitc/
├── pitc-backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── chains.py             # Dual-engine orchestrator & regex JSON cleaner
│   │   ├── models.py             # Pydantic schemas for requests and responses
│   │   ├── prompts.py            # Calibrated CRT linguistic system prompts
│   │   └── routers/
│   │       ├── analyse.py        # Thread health inspection route
│   │       ├── coach.py          # Single-message draft & variant coach
│   │       └── reply.py          # Intent-conditioned response generator
│   ├── config.py                 # Multi-language registry & model constants
│   ├── main.py                   # FastAPI server entrypoint & CORS middleware
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # API keys & model endpoints (git-ignored)
│
├── pitc-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Chat bubbles, Alert banners, Drawer components
│   │   ├── App.jsx               # Main interactive WhatsApp-style UI
│   │   ├── main.jsx              # Vite entrypoint
│   │   └── index.css             # Tailwind imports & script font configurations
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Prerequisites & Requirements

- **Python:** `3.10+`
- **Node.js:** `v18+` (npm or pnpm)
- **Ollama (Optional, for offline fallback):** [Download Ollama](https://ollama.com/)
- **Google AI Studio Key (For cloud mode):** Free API key from [aistudio.google.com](https://aistudio.google.com/)

---

## 🛠 Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd pitc-backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env   # Or create .env manually (see configuration below)

# Launch the FastAPI server
uvicorn main:app --reload --port 8000
```
Backend will be live at: **`http://localhost:8000`**  
Interactive Swagger docs: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd pitc-frontend

# Install node modules
npm install

# Start the Vite development server
npm run dev
```
Frontend will be live at: **`http://localhost:5173`**

---

### 3. Local Model Setup (Ollama)

For offline execution and automatic zero-downtime failover:

```bash
# Pull the multilingual Aya Expanse 8B model (Cohere For AI)
ollama pull aya-expanse:8b

# Ensure Ollama daemon is running
ollama serve
```

---

## 🔐 Environment Configuration

Create a file named `.env` in the `pitc-backend/` root directory:

```env
# Cloud Model Configuration (Google Gemini)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
CLOUD_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
CLOUD_MODEL_NAME=gemini-3.5-flash-lite
CLOUD_TIMEOUT_SECONDS=6.0

# Local Provider Configuration (Ollama)
OLLAMA_BASE_URL=http://localhost:11434/v1
LOCAL_MODEL_NAME=aya-expanse:8b
```

---

## 📡 API Reference

### 1. Thread Analysis (`POST /analyse`)
Audits conversational history to diagnose friction and register drift.

**Request Payload:**
```json
{
  "session_id": "session-101",
  "language_code": "hi",
  "provider": "auto",
  "thread": [
    { "speaker": "Manager", "message": "Kal subah presentation ready chahiye." },
    { "speaker": "You", "message": "Haan tu tension mat le, ho jayega." }
  ]
}
```

**Response Payload (HTTP 200):**
```json
{
  "session_id": "session-101",
  "health_score": "High Risk",
  "health_explanation": "Inappropriate use of intimate pronoun 'tu' in a superior-subordinate context.",
  "riskiest_message_index": 1,
  "crt_category": "C1: Register Mismatch",
  "crt_explanation": "'Tu' is an informal/intimate address. Professional decorum requires 'Aap'.",
  "recommendation": "Switch pronoun and verb agreements to honorific formal register.",
  "model_used": "Cloud (gemini-3.5-flash-lite)"
}
```

---

### 2. Message Coach & Formality Variants (`POST /coach`)
Evaluates a single draft in real time, querying ambiguous relationships and generating 3 register alternatives.

**Request Payload:**
```json
{
  "session_id": "session-102",
  "source_text": "Nee innaiku project mudikanum",
  "language_code": "ta",
  "provider": "auto",
  "intent": {
    "purpose": "Task reminder",
    "recipient": "Colleague",
    "tone": "Respectful"
  }
}
```

**Response Payload (HTTP 200):**
```json
{
  "session_id": "session-102",
  "formal_variant": "Neenga innaiku project-ai mudikka vendum.",
  "semi_formal_variant": "Innaiku project mudikka mudiyuma?",
  "casual_variant": "Nee innaiku project mudikanum.",
  "what_if_analysis": "Using 'Nee' with senior members may be perceived as condescending.",
  "model_used": "Cloud (gemini-3.5-flash-lite)"
}
```

---

### 3. Smart Ghostwriter (`POST /reply`)
Synthesizes diplomatically aligned answers matching user communicative goals.

**Request Payload:**
```json
{
  "session_id": "session-103",
  "language_code": "ar",
  "provider": "auto",
  "goal": "Politely decline meeting due to conflicting deadline",
  "thread": [
    { "speaker": "Client", "message": "هل يمكنك حضور الاجتماع اليوم؟" }
  ]
}
```

---

## 🛡 Resilient Multi-Engine Fallback Pipeline

In `pitc-backend/app/chains.py`, PITC implements a dual-mode cascading architecture:

1. **Direct REST Call (`httpx`):** Directly hits Google's `generateContent` API using the `x-goog-api-key` header. This avoids the `Authorization: Bearer` conflict common in OpenAI-compatible SDKs when communicating with Google AI Studio.
2. **Multi-Model Cloud Rotation:** Attempts `gemini-3.5-flash-lite` first; if high demand occurs, it automatically attempts `gemini-3.5-flash`.
3. **Local Edge Fallback:** If cloud limits are exceeded or the system is disconnected from the internet, requests silently fail over to **Ollama (`aya-expanse:8b`)**, ensuring **zero HTTP 500 crashes** on the frontend interface.

---

## 🧪 Interactive Testing (Swagger UI)

To test individual endpoints without firing up the frontend:

1. Start the backend: `uvicorn main:app --reload --port 8000`
2. Open your browser to **[http://localhost:8000/docs](http://localhost:8000/docs)**.
3. Click on any route (`POST /analyse`, `POST /coach`, `POST /reply`).
4. Select **"Try it out"**, paste your JSON payload, and click **"Execute"**.

---

## 📊 Capstone Evaluation Roadmap

| Phase | Milestone | Key Deliverable |
| :--- | :--- | :--- |
| **Phase 1: Hardening** | Timeouts, resilient JSON sanitization, error shielding | Zero-crash demo & verified offline Ollama mode |
| **Phase 2: Benchmarking** | 40-case test dataset (Hindi, Tamil, Kannada, Arabic) | Latency graphs (Cloud vs. Local) and CRT accuracy metrics |
| **Phase 3: Human Evaluation** | 1–5 Likert scale study with native speakers | Validation scores for formality tiers and What-If branches |
| **Phase 4: Documentation** | Final capstone report & architecture documentation | Complete project thesis and Viva slides |
| **Phase 5: Defense Prep** | Rehearsed 3-scenario demo & backup video recording | Polished viva presentation |

---

## 👥 Contributors & Academic Context

* **Project:** PITC (Proactive Intelligent Translation Coach)
* **Domain:** Natural Language Processing, Cross-Cultural Pragmatics, Human-AI Interaction (HCI)
* **Core Models:** Google Gemini 3.5 Flash-Lite & Cohere For AI Aya Expanse 8B

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.