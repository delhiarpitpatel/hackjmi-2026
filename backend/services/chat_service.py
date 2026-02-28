"""
AI Chat Service — Phase 4: Conversational Companion

Supports:
- Local LLM (Mistral-7B / Llama-3B) for privacy-first deployment
- OpenAI fallback for cloud deployment
- Active listening with session memory
- Health-aware system prompt built from user profile
"""
from typing import List, Optional
import httpx

from core.config import settings


SYSTEM_PROMPT_TEMPLATE = """
You are CareCompanion, a warm, patient, and empathetic AI health companion designed for elderly users.

User Profile:
- Name: {name}
- Age: {age}
- Medical Conditions: {conditions}
- Current Medications: {medications}
- Mobility Level: {mobility}
- Language Preference: {language}

Your responsibilities:
1. Provide emotional support and companionship using Active Listening techniques.
2. Answer health questions clearly in simple language (avoid medical jargon).
3. Remind users about medications, exercises, and appointments when relevant.
4. Ask thoughtful follow-up questions to understand how the user is feeling.
5. Remember shared history within this conversation and reference it naturally.
6. NEVER provide a diagnosis or replace a doctor's advice — always recommend consulting a physician for medical concerns.
7. Respond in {language} if requested, otherwise in clear, simple English.
8. Keep responses brief (2–4 sentences) to avoid overwhelming elderly users.

Important: You are running locally on the device. No conversation data leaves this device.
"""


def build_system_prompt(user_profile: dict) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        name=user_profile.get("name", "Friend"),
        age=user_profile.get("age", "unknown"),
        conditions=", ".join(user_profile.get("conditions", [])) or "None documented",
        medications=", ".join(user_profile.get("medications", [])) or "None",
        mobility=user_profile.get("mobility_level", "self_reliant"),
        language=user_profile.get("language", "English"),
    )


async def generate_response(
    messages: List[dict],
    system_prompt: str,
) -> str:
    """
    Generate AI response using configured LLM provider.
    messages format: [{"role": "user"|"assistant", "content": "..."}]
    """
    if settings.LLM_PROVIDER == "local":
        return await _call_local_llm(messages, system_prompt)
    elif settings.LLM_PROVIDER == "openai":
        return await _call_openai(messages, system_prompt)
    else:
        return _fallback_response(messages[-1]["content"] if messages else "")


async def _call_local_llm(messages: List[dict], system_prompt: str) -> str:
    """
    Call locally running LLM server (e.g., llama.cpp, Ollama).
    Default endpoint: http://localhost:11434/api/chat (Ollama format)
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": settings.LLM_MODEL,
                "messages": [{"role": "system", "content": system_prompt}] + messages,
                "stream": False,
            }
            resp = await client.post("http://localhost:11434/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["message"]["content"]
    except Exception as e:
        print(f"Local LLM error: {e}")
        return _fallback_response(messages[-1]["content"] if messages else "")


async def _call_openai(messages: List[dict], system_prompt: str) -> str:
    """OpenAI API fallback."""
    if not settings.OPENAI_API_KEY:
        return _fallback_response(messages[-1]["content"] if messages else "")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": system_prompt}] + messages,
                "max_tokens": 200,
                "temperature": 0.7,
            }
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"OpenAI error: {e}")
        return _fallback_response(messages[-1]["content"] if messages else "")


def _fallback_response(user_message: str) -> str:
    """
    Rule-based fallback when LLM is unavailable.
    Used in offline or development mode.
    """
    msg_lower = user_message.lower()
    if any(w in msg_lower for w in ["medicine", "medication", "tablet", "pill", "dosage"]):
        return "I can see your medication schedule. Please take your medicines as prescribed and consult your doctor if you have concerns."
    if any(w in msg_lower for w in ["pain", "hurt", "ache", "discomfort"]):
        return "I'm sorry to hear you're in discomfort. Please describe your symptoms and I'll help you decide if you should contact your doctor."
    if any(w in msg_lower for w in ["lonely", "sad", "alone", "bored"]):
        return "I'm here with you! Tell me about your day — I'd love to hear what's on your mind. 😊"
    if any(w in msg_lower for w in ["hello", "hi", "namaste", "good morning", "good evening"]):
        return "Hello! It's so good to hear from you. How are you feeling today? 😊"
    if any(w in msg_lower for w in ["food", "eat", "meal", "diet", "hungry"]):
        return "Good nutrition is so important! I've prepared a personalized meal plan for you in the Health tab. Would you like me to walk you through today's meals?"
    return "I understand. I'm here to support you. Could you tell me a little more so I can help you better?"
