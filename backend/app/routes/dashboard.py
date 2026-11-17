from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user

router = APIRouter()


def get_month_date_range(year: int, month: int):
    """Get start and end date for a given month."""
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
    else:
        end = datetime(year, month + 1, 1) - timedelta(seconds=1)
    return start, end


def parse_period(period: str = "this_month"):
    """Parse period string and return start and end dates."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if period == "this_month":
        start = today.replace(day=1)
        if today.month == 12:
            end = datetime(today.year + 1, 1, 1) - timedelta(seconds=1)
        else:
            end = datetime(today.year, today.month + 1, 1) - timedelta(seconds=1)
    elif period == "last_month":
        if today.month == 1:
            start = datetime(today.year - 1, 12, 1)
            end = datetime(today.year, 1, 1) - timedelta(seconds=1)
        else:
            start = datetime(today.year, today.month - 1, 1)
            end = today.replace(day=1) - timedelta(seconds=1)
    elif period == "last_3_months":
        start = today.replace(day=1) - timedelta(days=60)
        end = datetime.now()
    elif period == "last_6_months":
        start = today - timedelta(days=180)
        end = datetime.now()
    elif period == "this_year":
        start = datetime(today.year, 1, 1)
        end = datetime.now()
    else:
        # Default to this month
        start = today.replace(day=1)
        if today.month == 12:
            end = datetime(today.year + 1, 1, 1) - timedelta(seconds=1)
        else:
            end = datetime(today.year, today.month + 1, 1) - timedelta(seconds=1)
    
    return start, end


@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    period: str = Query("this_month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date, end_date = parse_period(period)
    
    # Get total income
    income_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.INCOME,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    total_income_paise = income_result or 0
    
    # Get total expenses
    expense_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.EXPENSE,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    total_expenses_paise = expense_result or 0
    
    # Calculate metrics
    net_balance = total_income_paise - total_expenses_paise
    savings_rate = (net_balance / total_income_paise * 100) if total_income_paise > 0 else 0
    
    return schemas.DashboardSummary(
        total_income_paise=total_income_paise,
        total_expenses_paise=total_expenses_paise,
        net_balance_paise=net_balance,
        estimated_savings_paise=net_balance,
        savings_rate=round(savings_rate, 2)
    )


@router.get("/spending-trend", response_model=list[schemas.SpendingTrend])
def get_spending_trend(
    period: str = Query("this_month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date, end_date = parse_period(period)
    
    # Get daily aggregates
    transactions = db.query(
        func.date(models.Transaction.transaction_date).label("date"),
        models.Transaction.transaction_type,
        func.sum(models.Transaction.amount_paise).label("total")
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).group_by(
        func.date(models.Transaction.transaction_date),
        models.Transaction.transaction_type
    ).order_by(
        func.date(models.Transaction.transaction_date)
    ).all()
    
    # Aggregate by date
    daily_data = {}
    for date, txn_type, total in transactions:
        date_str = str(date)
        if date_str not in daily_data:
            daily_data[date_str] = {
                "income_paise": 0,
                "expense_paise": 0
            }
        
        if txn_type == models.TransactionType.INCOME:
            daily_data[date_str]["income_paise"] = total or 0
        else:
            daily_data[date_str]["expense_paise"] = total or 0
    
    result = [
        schemas.SpendingTrend(
            date=date,
            income_paise=data["income_paise"],
            expense_paise=data["expense_paise"]
        )
        for date, data in sorted(daily_data.items())
    ]
    
    return result


@router.get("/category-breakdown", response_model=list[schemas.CategoryBreakdown])
def get_category_breakdown(
    period: str = Query("this_month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_date, end_date = parse_period(period)
    
    # Get total for percentage calculation
    total_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.EXPENSE,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    total_expenses = total_result or 1  # Avoid division by zero
    
    # Get category breakdown
    categories = db.query(
        models.Category.name,
        func.sum(models.Transaction.amount_paise).label("total")
    ).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.EXPENSE,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).group_by(
        models.Category.name
    ).order_by(
        func.sum(models.Transaction.amount_paise).desc()
    ).all()
    
    result = [
        schemas.CategoryBreakdown(
            category=cat_name,
            amount_paise=total or 0,
            percentage=round((total or 0) / total_expenses * 100, 2)
        )
        for cat_name, total in categories
    ]
    
    return result


@router.get("/income-vs-expense", response_model=list[schemas.SpendingTrend])
def get_income_vs_expense(
    period: str = Query("this_month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly income vs expense comparison."""
    today = datetime.now()
    
    # Determine how many months to fetch based on period
    if period == "this_month":
        months = 1
    elif period == "last_month":
        months = 2
    elif period == "last_3_months":
        months = 3
    elif period == "last_6_months":
        months = 6
    else:
        months = 12
    
    result = []
    for i in range(months):
        current_month = today.month - i
        current_year = today.year
        
        if current_month <= 0:
            current_month += 12
            current_year -= 1
        
        start, end = get_month_date_range(current_year, current_month)
        
        income_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.transaction_type == models.TransactionType.INCOME,
            models.Transaction.transaction_date >= start,
            models.Transaction.transaction_date <= end
        ).scalar()
        
        expense_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.transaction_type == models.TransactionType.EXPENSE,
            models.Transaction.transaction_date >= start,
            models.Transaction.transaction_date <= end
        ).scalar()
        
        month_str = f"{current_year}-{current_month:02d}"
        result.append(schemas.SpendingTrend(
            date=month_str,
            income_paise=income_result or 0,
            expense_paise=expense_result or 0
        ))
    
    return list(reversed(result))


@router.get("/top-categories", response_model=list[schemas.CategoryBreakdown])
def get_top_categories(
    limit: int = Query(5),
    period: str = Query("this_month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top spending categories."""
    start_date, end_date = parse_period(period)
    
    categories = db.query(
        models.Category.name,
        func.sum(models.Transaction.amount_paise).label("total")
    ).join(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.EXPENSE,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).group_by(
        models.Category.name
    ).order_by(
        func.sum(models.Transaction.amount_paise).desc()
    ).limit(limit).all()
    
    # Calculate total for percentages
    total_result = db.query(func.sum(models.Transaction.amount_paise)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.transaction_type == models.TransactionType.EXPENSE,
        models.Transaction.transaction_date >= start_date,
        models.Transaction.transaction_date <= end_date
    ).scalar()
    total = total_result or 1
    
    result = [
        schemas.CategoryBreakdown(
            category=cat_name,
            amount_paise=total_amount or 0,
            percentage=round((total_amount or 0) / total * 100, 2)
        )
        for cat_name, total_amount in categories
    ]
    
    return result


@router.get("/recent-transactions", response_model=list[schemas.TransactionResponse])
def get_recent_transactions(
    limit: int = Query(5),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent transactions across all time."""
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(
        models.Transaction.transaction_date.desc()
    ).limit(limit).all()
    
    return transactions
