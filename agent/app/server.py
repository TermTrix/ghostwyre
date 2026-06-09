from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Ghostwyre]")
    yield
    print(":(:(")


app = FastAPI(lifespan=lifespan)

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


from app.schemas.scan import Scan
from app.gRPC_client.grpc_client import scanner_client
from app.generated import scan_pb2
@app.post("/scan-target")
async def scan_target(req: Scan):
    try:
        print(req)
        
        target = req.target
        
        response = scanner_client.StartScan(
            scan_pb2.ScanRequest(
                target = target,
                scan_type="UNKNOWN"
            )
        )
        
        print(response)
    except Exception as error:
        print("[ERROR]", error)
