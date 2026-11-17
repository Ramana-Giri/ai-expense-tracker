from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app import models
from app import schemas
from app.database import get_db
from app.security import get_current_user
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("", response_model=list[schemas.TransactionResponse])
def get_transactions(
    category_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    min_amount: Optional[int] = Query(None),
    max_amount: Optional[int] = Query(None),
    search_query: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )
    
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    
    if transaction_type:
        query = query.filter(
            models.Transaction.transaction_type == models.TransactionType(transaction_type)
        )
    
    if start_date:
        query = query.filter(models.Transaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(models.Transaction.transaction_date <= end_date)
    
    if min_amount is not None:
        query = query.filter(models.Transaction.amount_paise >= min_amount)
    
    if max_amount is not None:
        query = query.filter(models.Transaction.amount_paise <= max_amount)
    
    if search_query:
        query = query.filter(
            (models.Transaction.description.ilike(f"%{search_query}%")) |
            (models.Transaction.merchant.ilike(f"%{search_query}%"))
        )
    
    query = query.order_by(models.Transaction.transaction_date.desc())
    
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify category belongs to user
    category = db.query(models.Category).filter(
        models.Category.id == transaction.category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Verify transaction type matches category type
    if category.transaction_type != transaction.transaction_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction type does not match category type"
        )
    
    db_transaction = models.Transaction(
        user_id=current_user.id,
        category_id=transaction.category_id,
        amount_paise=transaction.amount_paise,
        transaction_type=transaction.transaction_type,
        description=transaction.description,
        merchant=transaction.merchant,
        transaction_date=transaction.transaction_date,
        payment_method=transaction.payment_method,
        notes=transaction.notes
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # If updating category, verify it belongs to user
    if transaction_update.category_id:
        category = db.query(models.Category).filter(
            models.Category.id == transaction_update.category_id,
            models.Category.user_id == current_user.id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        transaction.category_id = transaction_update.category_id
    
    if transaction_update.amount_paise is not None:
        transaction.amount_paise = transaction_update.amount_paise
    
    if transaction_update.description is not None:
        transaction.description = transaction_update.description
    
    if transaction_update.merchant is not None:
        transaction.merchant = transaction_update.merchant
    
    if transaction_update.transaction_date is not None:
        transaction.transaction_date = transaction_update.transaction_date
    
    if transaction_update.payment_method is not None:
        transaction.payment_method = transaction_update.payment_method
    
    if transaction_update.notes is not None:
        transaction.notes = transaction_update.notes
    
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}


@router.get("/export/csv")
def export_transactions_csv(
    category_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )
    
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    
    if transaction_type:
        query = query.filter(
            models.Transaction.transaction_type == models.TransactionType(transaction_type)
        )
    
    if start_date:
        query = query.filter(models.Transaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(models.Transaction.transaction_date <= end_date)
    
    transactions = query.order_by(models.Transaction.transaction_date.desc()).all()
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Description", "Category", "Type", "Amount (₹)", 
        "Merchant", "Payment Method", "Notes"
    ])
    
    for txn in transactions:
        amount_rupees = txn.amount_paise / 100
        writer.writerow([
            txn.transaction_date.strftime("%Y-%m-%d"),
            txn.description,
            txn.category.name,
            txn.transaction_type.value,
            f"₹{amount_rupees:,.2f}",
            txn.merchant or "",
            txn.payment_method or "",
            txn.notes or ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )
