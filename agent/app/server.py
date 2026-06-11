from xmlrpc import client
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.services.socker_service import sio
from socketio import ASGIApp
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Ghostwyre]")
    yield
    print(":(:(")


app = FastAPI(lifespan=lifespan)

socket_app = ASGIApp(sio,other_asgi_app=app)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def index():
    return {"status": "ok"}

import httpx
from app.schemas.scan import Scan
from app.gRPC_client.grpc_client import scanner_client
from app.generated import scan_pb2
@app.post("/scan-target")
async def scan_target(req: Scan):
    try:
        print(req)
        
        target = req.target
        
        # response = scanner_client.StartScan(
        #     scan_pb2.ScanRequest(
        #         target = target,
        #         scan_type="UNKNOWN"
        #     )
        # )
        
        async with httpx.AsyncClient() as client:
            res = await client.get(
                "http://localhost:8001/scan",
                params={"target": target, "scan_type": "UNKNOWN"}
            )
            response = res.json()
            return response
        
        # print(response)
    except Exception as error:
        print("[ERROR]", error)
