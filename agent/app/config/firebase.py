import firebase_admin
from firebase_admin import auth, credentials,firestore
from fastapi import Request

from app.config.credentials import settings


def _get_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    private_key = settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n")

    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.FIREBASE_PROJECT_ID,
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "private_key": private_key,
        "token_uri": "https://oauth2.googleapis.com/token",
    })

    app = firebase_admin.initialize_app(cred)

    print("FIREBASE INITIALIZED")

    return app



from pydantic import BaseModel

class TokeResponse(BaseModel):
    user_id:str
    
    
def verify_socket_token(environ:dict) -> dict:
    cookie = environ.get("HTTP_COOKIE", "")  
    token = cookie.split("=")
    print(f"Token from cookie: {token}")
    if len(token)!=2 :
        return None
    try:
        app = _get_app()

        decoded_token = auth.verify_id_token(
            token[1],
            app=app,
        )

        return decoded_token

    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


def verify_user_token(request: Request):

    token = request.cookies.get("gw_id_token")
    
    if not token:
        return None

    try:
        app = _get_app()

        decoded_token = auth.verify_id_token(
            token,
            app=app,
        )

        return decoded_token

    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
    
    

