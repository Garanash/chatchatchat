from fastapi import FastAPI, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import uvicorn
import json
import subprocess
import sys
import os
from datetime import datetime
import requests
import logging
import uuid

# Конфиг
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./testchat.db")

VSEGPT_API_URL = "https://api.vsegpt.ru/v1/chat/completions"
VSEGPT_API_KEY = os.getenv("VSEGPT_API_KEY", "sk-...your-key-here...")

# БД
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    api_keys = Column(String, default="")  # Сохраняем как строку (JSON или CSV)

class Dialog(Base):
    __tablename__ = "dialogs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model = Column(String, index=True)  # Новое поле для идентификатора модели
    title = Column(String, default="Новый диалог")
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    dialog_id = Column(String, ForeignKey("dialogs.id"))  # Исправлено: теперь String
    role = Column(String)  # "user" или "assistant"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

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

# Добавим список vision/генеративных моделей (id из modelsList.js)
VISION_MODELS = {
    'openai/dall-e-3',
    'img-stable/stable-diffusion-xl-1024',
    'vis-anthropic/claude-3-haiku',
    # Можно добавить другие vision/генераторы по мере необходимости
}

# --- Типы моделей и endpoint ---
MODEL_ENDPOINTS = {
    'vision': {
        'ids': {
            'openai/dall-e-3',
            'img-stable/stable-diffusion-xl-1024',
            'vis-anthropic/claude-3-haiku',
        },
        'endpoint': 'https://api.vsegpt.ru/v1/images/generations',
    },
    'file': {
        'ids': set(),  # Добавьте id file-моделей, если появятся
        'endpoint': 'https://api.vsegpt.ru/v1/files/ocr',
    },
    'audio': {
        'ids': set(),  # Добавьте id audio-моделей, если появятся
        'endpoint': 'https://api.vsegpt.ru/v1/audio/transcriptions',
    },
    'llm': {
        'ids': set(),  # Все остальные
        'endpoint': 'https://api.vsegpt.ru/v1/chat/completions',
    },
}

def get_model_type(model_id):
    for t, v in MODEL_ENDPOINTS.items():
        if model_id in v['ids']:
            return t
    return 'llm'

def call_vsegpt(model, messages, settings, attached_file=None):
    model_type = get_model_type(model)
    headers = {
        "Authorization": f"Bearer {VSEGPT_API_KEY}",
    }
    logging.info(f"[call_vsegpt] model: {model}, model_type: {model_type}")
    if model_type == 'vision':
        api_url = MODEL_ENDPOINTS['vision']['endpoint']
        prompt = messages[-1]["content"] if messages else ""
        payload = {
            "model": model,
            "prompt": prompt,
            "n": 1,
            "size": settings.get("size", "1024x1024"),
            "response_format": "url",  # Явно указываем формат ответа
        }
        logging.info(f"[call_vsegpt] POST {api_url} payload={payload}")
        files = None
        if attached_file:
            files = {"file": attached_file}
        try:
            if files:
                response = requests.post(api_url, headers=headers, data=payload, files=files, timeout=60)
            else:
                headers["Content-Type"] = "application/json"
                response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            logging.info(f"[call_vsegpt] response.status={response.status_code} response.text={response.text[:500]}")
            response.raise_for_status()
            return response.json(), None
        except requests.HTTPError as e:
            try:
                err_json = response.json()
                if 'error' in err_json and 'message' in err_json['error']:
                    return None, err_json['error']['message']
            except Exception:
                pass
            return None, str(e)
        except Exception as e:
            return None, str(e)
    elif model_type == 'file':
        api_url = MODEL_ENDPOINTS['file']['endpoint']
        # Для file-моделей нужен файл и, возможно, prompt
        prompt = messages[-1]["content"] if messages else ""
        payload = {
            "model": model,
            "prompt": prompt,
        }
        files = None
        if attached_file:
            files = {"file": attached_file}
        else:
            return None, "Для данной модели требуется файл."
        try:
            response = requests.post(api_url, headers=headers, data=payload, files=files, timeout=60)
            response.raise_for_status()
            return response.json(), None
        except requests.HTTPError as e:
            try:
                err_json = response.json()
                if 'error' in err_json and 'message' in err_json['error']:
                    return None, err_json['error']['message']
            except Exception:
                pass
            return None, str(e)
        except Exception as e:
            return None, str(e)
    elif model_type == 'audio':
        api_url = MODEL_ENDPOINTS['audio']['endpoint']
        files = None
        if attached_file:
            files = {"file": attached_file}
        else:
            return None, "Для данной модели требуется аудиофайл."
        try:
            response = requests.post(api_url, headers=headers, files=files, timeout=60)
            response.raise_for_status()
            return response.json(), None
        except requests.HTTPError as e:
            try:
                err_json = response.json()
                if 'error' in err_json and 'message' in err_json['error']:
                    return None, err_json['error']['message']
            except Exception:
                pass
            return None, str(e)
        except Exception as e:
            return None, str(e)
    else:  # llm
        api_url = MODEL_ENDPOINTS['llm']['endpoint']
        payload = {
            "model": model,
            "messages": messages,
            "temperature": settings.get("temperature", 0.7),
            "top_p": settings.get("topP", 0.9),
            "max_tokens": settings.get("maxTokens", 1000),
            "frequency_penalty": settings.get("frequencyPenalty", 0.0),
            "presence_penalty": settings.get("presencePenalty", 0.0)
        }
        files = None
        if attached_file:
            files = {"file": attached_file}
        try:
            if files:
                response = requests.post(api_url, headers=headers, data=payload, files=files, timeout=60)
            else:
                headers["Content-Type"] = "application/json"
                response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            return response.json(), None
        except requests.HTTPError as e:
            try:
                err_json = response.json()
                if 'error' in err_json and 'message' in err_json['error']:
                    return None, err_json['error']['message']
            except Exception:
                pass
            return None, str(e)
        except Exception as e:
            return None, str(e)

# --- summary для диалога ---
def get_dialog_summary(messages, max_len=500):
    # Простое summary: первые 2 сообщения пользователя и ассистента, либо первые max_len символов
    summary = []
    for m in messages:
        summary.append(f"{m.role}: {m.content}")
        if len(' '.join(summary)) > max_len:
            break
    return '\n'.join(summary)[:max_len]

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

@app.post("/chat/{model_name:path}")
def chat_with_model(model_name: str, chat_data: ChatMessage = Body(...), current_user: User = Depends(get_current_user)):
    logging.info(f"[chat_with_model] model_name: {model_name}")
    db = SessionLocal()
    # 1. Найти или создать диалог для пользователя (по id или создаём новый)
    dialog = db.query(Dialog).filter_by(user_id=current_user.id).order_by(Dialog.created_at.desc()).first()
    if not dialog:
        dialog = Dialog(user_id=current_user.id)
        db.add(dialog)
        db.commit()
        db.refresh(dialog)
    # 2. Сохранить сообщение пользователя
    user_msg = Message(dialog_id=dialog.id, role="user", content=chat_data.message)
    db.add(user_msg)
    db.commit()
    # 3. Собрать историю сообщений для передачи в VseGPT
    messages = db.query(Message).filter_by(dialog_id=dialog.id).order_by(Message.timestamp).all()
    # --- summary для нового диалога ---
    summary = get_dialog_summary(messages)
    # 4. Вызвать VseGPT API
    assistant_content = ""
    error_msg = None
    try:
        # Для LLM подставляем summary в начало истории
        model_type = get_model_type(model_name)
        messages_payload = [{"role": "system", "content": summary}] if model_type == 'llm' and summary else []
        messages_payload += [{"role": m.role, "content": m.content} for m in messages]
        vsegpt_response, error_msg = call_vsegpt(model_name, messages_payload, chat_data.settings)
        if vsegpt_response:
            if model_type == 'vision':
                # Для vision моделей возвращаем ссылку на изображение
                assistant_content = vsegpt_response.get("data", [{}])[0].get("url", "[Нет изображения]")
            elif model_type == 'file':
                assistant_content = vsegpt_response.get("text", "[Нет текста]")
            elif model_type == 'audio':
                assistant_content = vsegpt_response.get("text", "[Нет текста]")
            else:
                assistant_content = vsegpt_response["choices"][0]["message"]["content"]
        else:
            if error_msg and ("image" in error_msg or "file" in error_msg):
                assistant_content = "Данная модель не поддерживает работу с изображениями или файлами. Пожалуйста, выберите другую модель или отправьте текстовое сообщение."
            else:
                assistant_content = f"Ошибка обращения к VseGPT: {error_msg}"
    except Exception as e:
        assistant_content = f"Ошибка обращения к VseGPT: {e}"
    # 5. Сохранить ответ ассистента
    assistant_msg = Message(dialog_id=dialog.id, role="assistant", content=assistant_content)
    db.add(assistant_msg)
    db.commit()
    return {
        "model": model_name,
        "response": assistant_content,
        "settings_used": chat_data.settings,
        "dialog_id": dialog.id
    }

@app.get("/dialogs")
def get_dialogs(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    dialogs = db.query(Dialog).filter_by(user_id=current_user.id).all()
    return [{"id": d.id, "title": d.title, "model": d.model, "created_at": d.created_at} for d in dialogs]

@app.get("/dialogs/{dialog_id}/messages")
def get_dialog_messages(dialog_id: str, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    dialog = db.query(Dialog).filter_by(id=dialog_id, user_id=current_user.id).first()
    if not dialog:
        raise HTTPException(404, "Диалог не найден")
    messages = db.query(Message).filter_by(dialog_id=dialog.id).order_by(Message.timestamp).all()
    return [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in messages]

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

# --- API для сохранения диалога и сообщений ---
@app.post("/api/save-dialog")
def save_dialog(data: dict = Body(...), current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    dialog_id = data.get("dialogId")
    model = data.get("model")
    title = data.get("title")
    messages = data.get("messages", [])
    # Найти или создать диалог
    dialog = db.query(Dialog).filter_by(id=dialog_id, user_id=current_user.id).first()
    if not dialog:
        dialog = Dialog(id=dialog_id, user_id=current_user.id, model=model, title=title or "Диалог", )
        db.add(dialog)
        db.commit()
        db.refresh(dialog)
    else:
        if title:
            dialog.title = title
        if model:
            dialog.model = model
        db.commit()
    # Сохраняем сообщения (удаляем старые, если есть)
    db.query(Message).filter_by(dialog_id=dialog.id).delete()
    for m in messages:
        db.add(Message(dialog_id=dialog.id, role=m.get("role"), content=m.get("content"), timestamp=m.get("timestamp")))
    db.commit()
    return {"success": True, "dialog_id": dialog.id}

@app.get("/api/users")
def get_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(lambda: SessionLocal())):
    # Только для администратора (username == 'admin')
    if current_user.username != 'admin':
        raise HTTPException(status_code=403, detail="Только для администратора")
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username} for u in users]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 