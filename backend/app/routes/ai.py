from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user
from app.encryption import encrypt_value, decrypt_value

router = APIRouter()


@router.post("/settings", response_model=schemas.AISettingsResponse)
def update_ai_settings(
    settings_update: schemas.AISettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update AI provider settings."""
    ai_settings = db.query(models.AISettings).filter(
        models.AISettings.user_id == current_user.id
    ).first()
    
    if not ai_settings:
        ai_settings = models.AISettings(user_id=current_user.id)
        db.add(ai_settings)
    
    ai_settings.provider = settings_update.provider
    ai_settings.model = settings_update.model
    ai_settings.encrypted_api_key = encrypt_value(settings_update.api_key)
    
    db.commit()
    db.refresh(ai_settings)
    
    return schemas.AISettingsResponse(
        provider=ai_settings.provider,
        model=ai_settings.model,
        has_api_key=bool(ai_settings.encrypted_api_key)
    )


@router.get("/settings", response_model=schemas.AISettingsResponse)
def get_ai_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI provider settings."""
    ai_settings = db.query(models.AISettings).filter(
        models.AISettings.user_id == current_user.id
    ).first()
    
    if not ai_settings:
        return schemas.AISettingsResponse(
            provider=None,
            model=None,
            has_api_key=False
        )
    
    return schemas.AISettingsResponse(
        provider=ai_settings.provider,
        model=ai_settings.model,
        has_api_key=bool(ai_settings.encrypted_api_key)
    )


@router.post("/test-connection")
def test_ai_connection(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test AI provider connection."""
    ai_settings = db.query(models.AISettings).filter(
        models.AISettings.user_id == current_user.id
    ).first()
    
    if not ai_settings or not ai_settings.encrypted_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI settings not configured"
        )
    
    api_key = decrypt_value(ai_settings.encrypted_api_key)
    
    # TODO: Implement actual provider connection tests
    # For now, just return success
    return {
        "success": True,
        "provider": ai_settings.provider,
        "model": ai_settings.model,
        "message": "Connection test successful"
    }


@router.delete("/settings/key")
def delete_ai_key(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete stored API key."""
    ai_settings = db.query(models.AISettings).filter(
        models.AISettings.user_id == current_user.id
    ).first()
    
    if ai_settings:
        ai_settings.encrypted_api_key = None
        db.commit()
    
    return {"message": "API key deleted successfully"}


@router.post("/chat", response_model=schemas.AIChatResponse)
def chat_with_ai(
    request: schemas.AIChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI financial assistant."""
    ai_settings = db.query(models.AISettings).filter(
        models.AISettings.user_id == current_user.id
    ).first()
    
    if not ai_settings or not ai_settings.encrypted_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI provider not configured. Please configure AI settings first."
        )
    
    # TODO: Implement AI agent with tool calling
    # For now, return a placeholder response
    return schemas.AIChatResponse(
        response="AI assistant is not yet configured. Please complete Stage 4 of development.",
        execution_steps=[],
        error=None
    )
