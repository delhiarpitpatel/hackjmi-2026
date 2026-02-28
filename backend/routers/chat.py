"""
Chat Router — Phase 4: On-Device Conversational AI Companion
Mistral-7B / Llama-3B with Active Listening & session memory
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from typing import List
import uuid, json

from core.database import get_db
from core.security import get_current_active_user
from models.user import ChatSession, ChatMessage, Medication
from schemas.schemas import ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse
from services.chat_service import generate_response, build_system_prompt

router = APIRouter()


def _build_user_context(user, medications) -> dict:
    conditions = []
    if user.medical_history:
        try:
            conditions = json.loads(user.medical_history)
        except Exception:
            conditions = [user.medical_history]

    age = 70
    if user.date_of_birth:
        try:
            from datetime import date
            dob = date.fromisoformat(user.date_of_birth)
            age = (date.today() - dob).days // 365
        except Exception:
            pass

    return {
        "name": user.full_name.split()[0],
        "age": age,
        "conditions": conditions,
        "medications": [f"{m.name} {m.dosage}" for m in medications if m.is_active],
        "mobility_level": user.mobility_level or "self_reliant",
        "language": user.language or "en",
    }


@router.post("/message", response_model=ChatMessageResponse,
             summary="Send a message to the AI companion (Mistral-7B / Llama-3B)")
async def send_message(
    payload: ChatMessageRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sends a message to the on-device LLM companion.
    If session_id is None, starts a new session.
    Full session history is passed with each call for Active Listening context.
    All messages are AES-256 encrypted at rest.
    """
    # Get or create session
    session = None
    if payload.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == payload.session_id,
                ChatSession.user_id == current_user.id,
            )
        )
        session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
        )
        db.add(session)
        await db.flush()

    # Fetch session history (last 20 messages for context window)
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.timestamp)
        .limit(20)
    )
    history = history_result.scalars().all()
    messages_for_llm = [{"role": m.role, "content": m.content} for m in history]
    messages_for_llm.append({"role": "user", "content": payload.message})

    # Build health-aware system prompt
    meds_result = await db.execute(
        select(Medication).where(Medication.user_id == current_user.id, Medication.is_active == True)
    )
    medications = meds_result.scalars().all()
    user_ctx = _build_user_context(current_user, medications)
    system_prompt = build_system_prompt(user_ctx)

    # Generate response
    ai_response = await generate_response(messages_for_llm, system_prompt)

    # Persist user message
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session.id,
        role="user",
        content=payload.message,
    )
    db.add(user_msg)

    # Persist assistant response
    bot_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session.id,
        role="assistant",
        content=ai_response,
    )
    db.add(bot_msg)

    session.message_count = (session.message_count or 0) + 2
    await db.flush()

    return ChatMessageResponse(
        session_id=session.id,
        message_id=bot_msg.id,
        role="assistant",
        content=ai_response,
        timestamp=bot_msg.timestamp or datetime.now(timezone.utc),
    )


@router.get("/sessions/{session_id}/history", response_model=ChatHistoryResponse,
            summary="Retrieve full chat history for a session")
async def get_chat_history(
    session_id: str,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.timestamp)
    )
    messages = msgs_result.scalars().all()

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[
            ChatMessageResponse(
                session_id=session_id,
                message_id=m.id,
                role=m.role,
                content=m.content,
                timestamp=m.timestamp,
            )
            for m in messages
        ],
    )
