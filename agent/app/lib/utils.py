
from google.oauth2 import id_token
from google.auth.transport import requests

from app.config.credentials import settings

def verify_token(token: str):
    """Verify a Google ID token. Checks signature, `aud`, `iss` and `exp`."""
    if not token:
        return None

    try:
        return id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as error:
        print(f"[AUTH] Token verification failed: {error}")
        return None
