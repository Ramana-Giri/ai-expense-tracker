from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter()


@router.get("", response_model=list[schemas.FinancialGoalResponse])
def get_goals(
    status_filter: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.FinancialGoal).filter(
        models.FinancialGoal.user_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(models.FinancialGoal.status == models.GoalStatus(status_filter))
    
    return query.order_by(models.FinancialGoal.created_at.desc()).all()


@router.post("", response_model=schemas.FinancialGoalResponse)
def create_goal(
    goal: schemas.FinancialGoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_goal = models.FinancialGoal(
        user_id=current_user.id,
        name=goal.name,
        target_amount_paise=goal.target_amount_paise,
        current_savings_paise=goal.current_savings_paise,
        target_date=goal.target_date,
        monthly_contribution_paise=goal.monthly_contribution_paise,
        description=goal.description
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.get("/{goal_id}", response_model=schemas.FinancialGoalResponse)
def get_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.FinancialGoal).filter(
        models.FinancialGoal.id == goal_id,
        models.FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal


@router.put("/{goal_id}", response_model=schemas.FinancialGoalResponse)
def update_goal(
    goal_id: int,
    goal_update: schemas.FinancialGoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.FinancialGoal).filter(
        models.FinancialGoal.id == goal_id,
        models.FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if goal_update.name is not None:
        goal.name = goal_update.name
    
    if goal_update.target_amount_paise is not None:
        goal.target_amount_paise = goal_update.target_amount_paise
    
    if goal_update.current_savings_paise is not None:
        goal.current_savings_paise = goal_update.current_savings_paise
    
    if goal_update.target_date is not None:
        goal.target_date = goal_update.target_date
    
    if goal_update.monthly_contribution_paise is not None:
        goal.monthly_contribution_paise = goal_update.monthly_contribution_paise
    
    if goal_update.description is not None:
        goal.description = goal_update.description
    
    if goal_update.status is not None:
        goal.status = goal_update.status
    
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.FinancialGoal).filter(
        models.FinancialGoal.id == goal_id,
        models.FinancialGoal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}
