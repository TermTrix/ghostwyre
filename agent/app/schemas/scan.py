from typing import Optional, List, Any, Dict
from pydantic import BaseModel

class Scan(BaseModel):
    target: str
    session : str

