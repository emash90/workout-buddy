"""
Chat API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
from ...agent.fitness_coach import FitnessCoachAgent
from ...utils.logger import logger

router = APIRouter()

# Initialize agent (singleton)
agent = FitnessCoachAgent()


class ChatRequest(BaseModel):
    """Chat request model."""
    user_id: Union[int, str]  # Support both int and UUID string
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str
    sources: List[Dict] = []
    tools_used: List[str] = []
    conversation_id: Optional[str] = None


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI fitness coach.

    Args:
        request: Chat request with user_id and message

    Returns:
        AI response with message and sources
    """
    try:
        logger.info(f"Chat request from user {request.user_id}: {request.message[:50]}...")

        # TODO: Load conversation history from database if conversation_id provided
        conversation_history = []

        # Generate response
        response = await agent.chat(
            user_id=request.user_id,
            message=request.message,
            conversation_history=conversation_history
        )

        # TODO: Save conversation to database

        return ChatResponse(
            message=response["message"],
            sources=response.get("sources", []),
            tools_used=response.get("tools_used", []),
            conversation_id=request.conversation_id
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{conversation_id}")
async def get_chat_history(conversation_id: str, user_id: int):
    """
    Get chat history for a conversation.

    Args:
        conversation_id: Conversation ID
        user_id: User ID

    Returns:
        List of messages
    """
    try:
        # TODO: Implement database query for conversation history
        return {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages": []
        }

    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history")
async def clear_chat_history(user_id: int, conversation_id: str):
    """
    Clear chat history for a conversation.

    Args:
        user_id: User ID
        conversation_id: Conversation ID

    Returns:
        Success message
    """
    try:
        # TODO: Implement database deletion
        return {
            "success": True,
            "message": "Chat history cleared"
        }

    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
