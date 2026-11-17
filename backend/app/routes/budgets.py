from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter()


@router.get("", response_model=list[schemas.BudgetResponse])
def get_budgets(
    month: Optional[str] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id
    )
    
    if month:
        query = query.filter(models.Budget.month == month)
    else:
        # Default to current month
        today = datetime.now()
        current_month = f"{today.year}-{today.month:02d}"
        query = query.filter(models.Budget.month == current_month)
    
    return query.all()


@router.post("", response_model=schemas.BudgetResponse)
def create_budget(
    budget: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If category_id is provided, verify it belongs to user
    if budget.category_id:
        category = db.query(models.Category).filter(
            models.Category.id == budget.category_id,
            models.Category.user_id == current_user.id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Check if budget already exists for this month/category
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == budget.month,
        models.Budget.category_id == budget.category_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Budget already exists for this month and category"
        )
    
    db_budget = models.Budget(
        user_id=current_user.id,
        amount_paise=budget.amount_paise,
        category_id=budget.category_id,
        month=budget.month
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


@router.get("/{budget_id}/status", response_model=schemas.BudgetStatusResponse)
def get_budget_status(
    budget_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    # Parse month to get date range
    year, month = map(int, budget.month.split("-"))
    if month == 12:
        next_month = 1
        next_year = year + 1
    else:
        next_month = month + 1
        next_year = year
    
    from datetime import datetime as dt
    start_date = dt(year, month, 1)
    end_date = dt(next_year, next_month, 1) if next_month != 1 else dt(year + 1, 1, 1)
    
    # Calculate actual spending
    if budget.category_id:
        # Category-specific budget
        spending_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.category_id == budget.category_id,
            models.Transaction.transaction_type == models.TransactionType.EXPENSE,
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date < end_date
        ).scalar()
    else:
        # Overall budget
        spending_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.transaction_type == models.TransactionType.EXPENSE,
            models.Transaction.transaction_date >= start_date,
            models.Transaction.transaction_date < end_date
        ).scalar()
    
    actual_spending = spending_result or 0
    remaining = budget.amount_paise - actual_spending
    percentage_used = (actual_spending / budget.amount_paise * 100) if budget.amount_paise > 0 else 0
    
    return schemas.BudgetStatusResponse(
        budget_amount_paise=budget.amount_paise,
        actual_spending_paise=actual_spending,
        remaining_paise=remaining,
        percentage_used=round(percentage_used, 2),
        is_overspent=actual_spending > budget.amount_paise
    )


@router.put("/{budget_id}", response_model=schemas.BudgetResponse)
def update_budget(
    budget_id: int,
    budget_update: schemas.BudgetUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    if budget_update.amount_paise is not None:
        budget.amount_paise = budget_update.amount_paise
    
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully"}
