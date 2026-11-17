from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter()


@router.get("", response_model=list[schemas.CategoryResponse])
def get_categories(
    transaction_type: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Category).filter(
        models.Category.user_id == current_user.id
    )
    
    if transaction_type:
        query = query.filter(
            models.Category.transaction_type == models.TransactionType(transaction_type)
        )
    
    return query.all()


@router.post("", response_model=schemas.CategoryResponse)
def create_category(
    category: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if category already exists for this user
    existing = db.query(models.Category).filter(
        models.Category.user_id == current_user.id,
        models.Category.name == category.name,
        models.Category.transaction_type == category.transaction_type
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    
    db_category = models.Category(
        user_id=current_user.id,
        name=category.name,
        transaction_type=category.transaction_type
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category.name:
        db_category.name = category.name
    
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if db_category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default categories"
        )
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}
