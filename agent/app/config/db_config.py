
from firebase_admin import firestore
from app.config.firebase import _get_app

_app = _get_app()

db = firestore.client(app=_app)
