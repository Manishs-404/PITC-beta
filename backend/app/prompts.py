from config import CRT_TAXONOMY

def get_analyse_prompt(language_name: str, t_v_info: str, thread_text: str) -> str:
    crt_desc = "\n".join([f"- {k}: {v}" for k, v in CRT_TAXONOMY.items()])
    return f"""You are the Pragmatic Intelligent Translation Coach (PITC) analyzer.
Evaluate the following conversation thread in {language_name}.
T-V Pronoun Rules for this language: {t_v_info}

Cultural Risk Taxonomy (CRT):
{crt_desc}

Conversation Thread:
{thread_text}

Analyze the dialogue for relational friction, improper social distance, or CRT violations.
Return ONLY valid JSON with this exact schema:
{{
  "health_score": "Low" | "Medium" | "High",
  "health_explanation": "Concise diagnostic of the relational status",
  "riskiest_message_index": 0,
  "crt_category": "C1: Register Mismatch" | "C2: Idiomatic Opacity" | "C3: Gendered Language" | "C4: Hierarchy Violation" | "C5: Cultural/Religious Sensitivity" | "None",
  "crt_explanation": "Specific reason why this message breached pragmatic norms",
  "recommendation": "Concrete de-escalation action or advice"
}}"""


def get_reply_prompt(language_name: str, thread_text: str, goal: str) -> str:
    return f"""You are PITC, a pragmatic ghostwriter crafting the next conversational turn in {language_name}.

Context Thread:
{thread_text}

User's Communicative Goal:
"{goal}"

Generate a diplomatically calibrated, polite, and culturally appropriate response.
Return ONLY valid JSON with this exact schema:
{{
  "english_reply": "Natural English version of the response",
  "translated_reply": "Native script translation in {language_name} using optimal honorifics",
  "register_explanation": "Why this specific pronoun and honorific level was chosen"
}}"""


def get_coach_prompt(
    source_text: str, 
    language_name: str, 
    intent: dict, 
    answers: dict = None
) -> str:
    answers_str = f"User Clarification Answers: {answers}" if answers else "No clarifications provided yet."

    return f"""You are PITC Single Message Coach for {language_name}.
Source text to coach: "{source_text}"
Communicative Context:
- Recipient: {intent.get('recipient')}
- Purpose: {intent.get('purpose')}
{answers_str}

If the recipient relationship or seniority is completely ambiguous AND crucial to choose between formal/informal pronouns, set "needs_clarification": true and provide 1-2 questions.
Otherwise, set "needs_clarification": false, translate the message with 3 formality variants, and simulate 2 'What-If' reactions.

Return ONLY valid JSON with this exact schema:
{{
  "needs_clarification": false,
  "clarification_questions": [],
  "clarification_reason": "",
  "primary_translation": "Best recommended translation in native script",
  "variants": [
    {{"register": "Formal", "text": "...", "nuance": "For seniors/bosses"}},
    {{"register": "Semi-formal", "text": "...", "nuance": "For peers/colleagues"}},
    {{"register": "Casual", "text": "...", "nuance": "For close friends/juniors"}}
  ],
  "branches": [
    {{
      "anticipated_reply": "How recipient might react if tone is wrong",
      "risk_level": "High" | "Medium" | "Low",
      "risk_reason": "Why this reaction occurs",
      "safer_alternative": "What to say instead"
    }}
  ],
  "cultural_notes": "Important sociolinguistic guidance"
}}"""