import json
import re
from typing import Any, Dict, Tuple
from openai import AsyncOpenAI
from config import (
    CLOUD_BASE_URL,
    CLOUD_API_KEY,
    CLOUD_MODEL_NAME,
    OLLAMA_BASE_URL,
    LOCAL_MODEL_NAME,
    CLOUD_TIMEOUT_SECONDS
)

cloud_client = AsyncOpenAI(
    base_url=CLOUD_BASE_URL,
    api_key=CLOUD_API_KEY or "none",
    timeout=CLOUD_TIMEOUT_SECONDS
)

local_client = AsyncOpenAI(
    base_url=OLLAMA_BASE_URL,
    api_key="ollama"
)

def clean_and_parse_json(raw_text: str) -> Dict[str, Any]:
    cleaned = raw_text.strip()
    markdown_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if markdown_match:
        cleaned = markdown_match.group(1).strip()
    else:
        json_match = re.search(r"(\{[\s\S]*\})", cleaned)
        if json_match:
            cleaned = json_match.group(1).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        sanitized = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", cleaned)
        return json.loads(sanitized)

async def _call_model(client: AsyncOpenAI, model: str, prompt: str, temperature: float) -> Dict[str, Any]:
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are a specialized cross-cultural pragmatic linguistic engine. You strictly communicate in valid, parseable JSON."
            },
            {"role": "user", "content": prompt}
        ],
        temperature=temperature,
        response_format={"type": "json_object"}
    )
    raw_content = response.choices[0].message.content or "{}"
    return clean_and_parse_json(raw_content)

async def execute_llm_chain(
    prompt: str, 
    temperature: float = 0.2, 
    provider: str = "auto"
) -> Tuple[Dict[str, Any], str]:
    """
    Routes execution based on provider ('cloud', 'local', or 'auto').
    Returns (result_dict, model_indicator_string).
    """
    mode = (provider or "auto").lower()

    # Explicit Cloud Mode
    if mode == "cloud":
        if not CLOUD_API_KEY:
            raise ValueError("Cloud API Key (GROQ_API_KEY) is not set in backend environment.")
        result = await _call_model(cloud_client, CLOUD_MODEL_NAME, prompt, temperature)
        return result, f"Cloud ({CLOUD_MODEL_NAME})"

    # Explicit Local Mode
    if mode == "local":
        result = await _call_model(local_client, LOCAL_MODEL_NAME, prompt, temperature)
        return result, f"Local ({LOCAL_MODEL_NAME})"

    # Auto Mode: Try Cloud, fallback to Local
    if CLOUD_API_KEY:
        try:
            result = await _call_model(cloud_client, CLOUD_MODEL_NAME, prompt, temperature)
            return result, f"Cloud ({CLOUD_MODEL_NAME})"
        except Exception as cloud_err:
            print(f"[Auto Fallback Warning] Cloud failed: {cloud_err}. Using local Ollama...")

    result = await _call_model(local_client, LOCAL_MODEL_NAME, prompt, temperature)
    return result, f"Local Fallback ({LOCAL_MODEL_NAME})"