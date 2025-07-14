from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import uvicorn
import json
import subprocess
import sys
import os

# Конфиг
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_URL = "sqlite:///./testchat.db"

# БД
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    api_keys = Column(String, default="")  # Сохраняем как строку (JSON или CSV)

Base.metadata.create_all(bind=engine)

# Модели
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class APIKeys(BaseModel):
    keys: dict

class ChatMessage(BaseModel):
    message: str
    settings: Optional[dict] = {
        "temperature": 0.7,
        "topP": 0.9,
        "maxTokens": 1000,
        "frequencyPenalty": 0.0,
        "presencePenalty": 0.0
    }

class BackendFixes(BaseModel):
    fixes: Dict[str, Any]

# Безопасность
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(lambda: SessionLocal())):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username)
    if user is None:
        raise credentials_exception
    return user

# FastAPI
app = FastAPI()

@app.post("/register", response_model=Token)
def register(user: UserCreate):
    db = SessionLocal()
    if get_user(db, user.username):
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token({"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username}

@app.get("/api-keys", response_model=APIKeys)
def get_api_keys(current_user: User = Depends(get_current_user)):
    import json
    try:
        keys = json.loads(current_user.api_keys) if current_user.api_keys else {}
    except Exception:
        keys = {}
    return {"keys": keys}

@app.post("/api-keys", response_model=APIKeys)
def set_api_keys(keys: APIKeys, current_user: User = Depends(get_current_user)):
    import json
    db = SessionLocal()
    user = get_user(db, current_user.username)
    user.api_keys = json.dumps(keys.keys)
    db.commit()
    return {"keys": keys.keys}

@app.get("/models")
def get_models(current_user: User = Depends(get_current_user)):
    # Здесь можно вернуть список моделей (заглушка)
    return {"models": [f"LLM_{i+1}" for i in range(16)]}

@app.post("/chat/{model_name}")
def chat_with_model(model_name: str, chat_data: ChatMessage, current_user: User = Depends(get_current_user)):
    # Здесь будет логика общения с выбранной LLM (заглушка)
    # В реальном приложении здесь будет интеграция с API моделей
    settings = chat_data.settings or {}
    temperature = settings.get("temperature", 0.7)
    top_p = settings.get("topP", 0.9)
    max_tokens = settings.get("maxTokens", 1000)
    
    # Имитация ответа с учетом настроек
    response_text = f"Ответ от {model_name} на '{chat_data.message}' (temp: {temperature}, top_p: {top_p}, max_tokens: {max_tokens})"
    
    return {"model": model_name, "response": response_text, "settings_used": settings}

@app.post("/api/apply-backend-fixes")
def apply_backend_fixes(fixes_data: BackendFixes, current_user: User = Depends(get_current_user)):
    """Применяет исправления к backend"""
    try:
        print(f"🔧 Применяем исправления к backend: {fixes_data.fixes}")
        
        # Создаем временный файл с исправлениями
        fixes_file = "temp_fixes.json"
        with open(fixes_file, 'w', encoding='utf-8') as f:
            json.dump(fixes_data.fixes, f, ensure_ascii=False, indent=2)
        
        # Запускаем Python скрипт для применения исправлений
        result = subprocess.run([
            sys.executable, "autoFixer.py", 
            "--fixes", fixes_file
        ], capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        # Удаляем временный файл
        if os.path.exists(fixes_file):
            os.remove(fixes_file)
        
        if result.returncode == 0:
            print("✅ Исправления успешно применены к backend")
            return {
                "success": True, 
                "message": "Backend успешно обновлен",
                "output": result.stdout
            }
        else:
            print(f"❌ Ошибка при применении исправлений: {result.stderr}")
            return {
                "success": False, 
                "error": f"Ошибка при применении исправлений: {result.stderr}",
                "output": result.stdout
            }
            
    except Exception as e:
        print(f"❌ Ошибка при применении исправлений: {e}")
        return {
            "success": False, 
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 