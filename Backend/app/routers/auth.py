"""
Authentication & User Profile Router
Provides demo trader authentication, JWT bearer token emulation, and user profile metadata.
"""

from fastapi import APIRouter, Header
from ..core.config import settings
from ..models.schemas import LoginRequest, LoginResponse, UserProfile

router = APIRouter(prefix=settings.API_PREFIX, tags=["Authentication & Access"])


@router.post("/auth/login", response_model=LoginResponse, summary="Trader / Analyst Sign In")
async def login(credentials: LoginRequest):
    """Authenticates utility desk trader or risk analyst and returns session token."""
    email = credentials.email.lower()

    if "trader" in email:
        name = "Alex Morgan"
        role = credentials.role or "Day-Ahead Energy Trader"
    elif "analyst" in email or "risk" in email:
        name = "Elena Rostova"
        role = credentials.role or "Portfolio Risk Analyst"
    else:
        name = "Arvin Patel"
        role = credentials.role or "Senior Renewable Energy Trader"

    user = UserProfile(
        name=name,
        role=role,
        email=credentials.email,
        organization="UK National Electricity Utility",
    )

    token = f"demo_jwt_token_{email.replace('@', '_').replace('.', '_')}_2026"

    return LoginResponse(
        token=token,
        user=user,
    )


@router.get("/auth/me", response_model=UserProfile, summary="Current User Profile")
async def get_current_user(authorization: str = Header(None)):
    """Returns authenticated trader credentials for session verification."""
    return UserProfile(
        name="Arvin Patel",
        role="Senior Renewable Energy Trader",
        email="trader@uk-utility.co.uk",
        organization="UK National Electricity Utility",
    )
