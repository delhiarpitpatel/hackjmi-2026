# CareCompanion — FastAPI Backend

Production-grade REST API for the CareCompanion elderly health & safety app.
Built across 6 phases from the research document.

---

## Tech Stack
- **FastAPI** + **Uvicorn** (async WSGI)
- **SQLAlchemy 2.0** async ORM + **SQLite** (swap to PostgreSQL for production)
- **AES-256 encryption** on all health columns (HIPAA/GDPR compliant)
- **JWT** access + refresh tokens, bcrypt password hashing
- **Biometric auth** stub (NPCI on-device SDK)
- **UIDAI FaceRD** Aadhaar facial recognition integration
- **HawkEye** police dispatch API (Hyderabad model)
- **Twilio** SMS for emergency contacts
- **Mistral-7B / Llama-3B** on-device LLM via Ollama

---

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Overview

### Phase 2 · Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Phone + password login |
| POST | `/biometric-login` | Face ID / Fingerprint login (NPCI) |
| POST | `/aadhaar-verify` | Aadhaar FaceRD verification (UIDAI) |
| POST | `/refresh` | Refresh access token |
| POST | `/upi/pay` | Biometric UPI payment (≤ ₹5,000) |

### Phase 1 · Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get profile |
| PATCH | `/me` | Update profile + accessibility prefs |
| DELETE | `/me` | GDPR account deactivation |

### Phase 3 · Vitals (`/api/v1/vitals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Log a vital reading |
| GET | `/` | Vital history |
| GET | `/latest` | Most recent reading |

### Phase 3 · Wearables (`/api/v1/wearables`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/providers` | 500+ supported devices |
| POST | `/connect` | Connect wearable (Thryve/Vitalera/Fitbit...) |
| GET | `/` | List connected devices |
| DELETE | `/{id}` | Disconnect wearable |

### Phase 3 · Diet (`/api/v1/diet`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | AI meal plan (Random Forest + K-Means) |
| GET | `/{date}` | Get meal plan for a date |

### Phase 3 · Workouts (`/api/v1/workouts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | FITT-VP adaptive workout plan |

### Phase 3 · Medications (`/api/v1/medications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add medication |
| GET | `/` | List medications |
| DELETE | `/{id}` | Remove medication |

### Phase 3 · Risk Prediction (`/api/v1/risk`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run ML risk model (fall/cardiac/diabetic) |
| GET | `/history` | Risk score history |

### Phase 4 · Chat (`/api/v1/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Send message to AI companion |
| GET | `/sessions/{id}/history` | Full chat history |

### Phase 4 · Travel (`/api/v1/travel`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/profile` | Create/update travel profile |
| GET | `/matches` | Find compatible travel companions |

### Phase 5 · Emergency (`/api/v1/emergency`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trigger` | 🚨 Activate SOS (button/voice/fall) |
| PATCH | `/{id}` | Update SOS status (resolve/cancel) |
| GET | `/history` | SOS event history |
| POST | `/contacts` | Add emergency contact |
| GET | `/contacts` | List emergency contacts |
| DELETE | `/contacts/{id}` | Remove contact |

---

## Security
- All health data encrypted with **AES-256** at rest
- Passwords hashed with **bcrypt**
- JWTs signed with **HS256** (swap to RS256 in production)
- **HIPAA & GDPR** compliant architecture
- Aadhaar data encrypted before storage

## Production Checklist
- [ ] Replace SQLite with PostgreSQL
- [ ] Set strong `SECRET_KEY` and `ENCRYPTION_KEY` in `.env`
- [ ] Configure real UIDAI / HawkEye / Twilio credentials
- [ ] Load trained XGBoost & StackingEnsemble `.pkl` models
- [ ] Set up Redis for session caching & rate limiting
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Deploy Ollama with `mistral:7b-instruct` model locally
