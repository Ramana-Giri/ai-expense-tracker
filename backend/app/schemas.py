from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum


class TransactionTypeEnum(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class GoalStatusEnum(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    transaction_type: TransactionTypeEnum


class CategoryUpdate(BaseModel):
    name: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    transaction_type: TransactionTypeEnum
    is_default: bool
    
    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionCreate(BaseModel):
    amount_paise: int
    transaction_type: TransactionTypeEnum
    category_id: int
    description: str
    merchant: Optional[str] = None
    transaction_date: datetime
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    amount_paise: Optional[int] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    transaction_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    amount_paise: int
    transaction_type: TransactionTypeEnum
    category_id: int
    description: str
    merchant: Optional[str]
    transaction_date: datetime
    payment_method: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Budget Schemas
class BudgetCreate(BaseModel):
    amount_paise: int
    category_id: Optional[int] = None  # NULL for overall budget
    month: str  # YYYY-MM


class BudgetUpdate(BaseModel):
    amount_paise: Optional[int] = None


class BudgetResponse(BaseModel):
    id: int
    amount_paise: int
    category_id: Optional[int]
    month: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BudgetStatusResponse(BaseModel):
    budget_amount_paise: int
    actual_spending_paise: int
    remaining_paise: int
    percentage_used: float
    is_overspent: bool


# Financial Goal Schemas
class FinancialGoalCreate(BaseModel):
    name: str
    target_amount_paise: int
    current_savings_paise: int = 0
    target_date: Optional[datetime] = None
    monthly_contribution_paise: Optional[int] = None
    description: Optional[str] = None


class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount_paise: Optional[int] = None
    current_savings_paise: Optional[int] = None
    target_date: Optional[datetime] = None
    monthly_contribution_paise: Optional[int] = None
    description: Optional[str] = None
    status: Optional[GoalStatusEnum] = None


class FinancialGoalResponse(BaseModel):
    id: int
    name: str
    target_amount_paise: int
    current_savings_paise: int
    target_date: Optional[datetime]
    monthly_contribution_paise: Optional[int]
    description: Optional[str]
    status: GoalStatusEnum
    created_at: datetime
    
    class Config:
        from_attributes = True


# AI Settings Schemas
class AISettingsUpdate(BaseModel):
    provider: str  # google_gemini, openai, anthropic
    model: str
    api_key: str


class AISettingsResponse(BaseModel):
    provider: Optional[str]
    model: Optional[str]
    has_api_key: bool  # Never expose actual key


# Dashboard Analytics
class DashboardSummary(BaseModel):
    total_income_paise: int
    total_expenses_paise: int
    net_balance_paise: int
    estimated_savings_paise: int
    savings_rate: float


class CategoryBreakdown(BaseModel):
    category: str
    amount_paise: int
    percentage: float


class SpendingTrend(BaseModel):
    date: str
    income_paise: int
    expense_paise: int


# AI Chat
class AIMessage(BaseModel):
    role: str  # user or assistant
    content: str


class AIToolCall(BaseModel):
    tool_name: str
    parameters: dict


class AIToolResult(BaseModel):
    tool_name: str
    result: dict
    success: bool


class AIExecutionStep(BaseModel):
    step: str
    status: str  # pending, executing, completed, failed
    details: Optional[str] = None
    tool_call: Optional[AIToolCall] = None
    tool_result: Optional[AIToolResult] = None


class AIChatRequest(BaseModel):
    message: str
    conversation_history: List[AIMessage] = []


class AIChatResponse(BaseModel):
    response: str
    execution_steps: List[AIExecutionStep]
    error: Optional[str] = None
