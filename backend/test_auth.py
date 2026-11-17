from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from app.config import get_settings

app = FastAPI()
security = HTTPBearer()
settings = get_settings()

@app.get("/test/auth")
async def test_auth(credentials: HTTPBearer = Depends(HTTPBearer())):
    token = credentials.credentials
    print(f"Token received: {token[:20]}...")
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        print(f"Payload: {payload}")
        return {"message": "Token is valid", "user_id": payload.get("sub")}
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")
    except Exception as e:
        print(f"Other error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
