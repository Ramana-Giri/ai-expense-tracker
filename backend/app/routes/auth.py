from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app import models
from app import schemas
from app.database import get_db
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default categories for the user
    default_expense_categories = [
        "Food", "Groceries", "Travel", "Shopping", "Rent", 
        "Bills", "Entertainment", "Healthcare", "Education", 
        "Investments", "Subscriptions", "Other"
    ]
    default_income_categories = ["Salary", "Freelance", "Business", "Investment Returns", "Gifts", "Other"]
    
    for category_name in default_expense_categories:
        db.add(models.Category(
            user_id=db_user.id,
            name=category_name,
            transaction_type=models.TransactionType.EXPENSE,
            is_default=True
        ))
    
    for category_name in default_income_categories:
        db.add(models.Category(
            user_id=db_user.id,
            name=category_name,
            transaction_type=models.TransactionType.INCOME,
            is_default=True
        ))
    
    # Create AI settings entry
    db.add(models.AISettings(user_id=db_user.id))
    
    db.commit()
    
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": db_user.id},
        expires_delta=timedelta(days=7)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout():
    # Token-based auth doesn't require logout, just frontend should discard the token
    return {"message": "Logged out successfully"}
