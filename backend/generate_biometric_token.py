# generate_biometric_token.py  — run this once locally
from jose import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "CHANGE_ME_IN_PRODUCTION_use_openssl_rand_hex_32"  # match your .env
USER_ID = "c482c1b0-7df5-49d7-8d4e-fada6b87d9a3"

token = jwt.encode(
    {
        "sub": USER_ID,
        "type": "biometric",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    },
    SECRET_KEY,
    algorithm="HS256",
)
print(token)