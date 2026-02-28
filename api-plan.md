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