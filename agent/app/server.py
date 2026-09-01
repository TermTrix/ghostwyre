from xmlrpc import client
from fastapi import FastAPI,status,HTTPException,Request,Depends
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.socker_service import sio
from socketio import ASGIApp
from app.services.pub_sub_mgr import GhostAgentWorker
import httpx
from app.schemas.scan import Scan
from app.gRPC_client.grpc_client import scanner_client
from app.generated import scan_pb2
from uuid import uuid4

from app.config.firebase import verify_user_token
from app.config.db_config import db

agent = GhostAgentWorker(sio=sio)



@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Ghostwyre]")
    await agent._start()
    yield
    print(":(:(")
    await agent._stop()


app = FastAPI(lifespan=lifespan)

socket_app = ASGIApp(sio,other_asgi_app=app)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Auth rides in the Authorization header, not cookies. `allow_origins=["*"]`
    # with credentials enabled is rejected by browsers anyway.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PUBLIC_PATHS = {"/", "/docs", "/redoc", "/openapi.json"}

from typing import Annotated

CurrentUser = Annotated[dict,Depends(verify_user_token)]


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)
 
    token = request.cookies.get("gw_id_token")

    if not token:
        return JSONResponse(
            content={"detail": "Missing token"},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    payload = verify_user_token(request)
    print("payload",payload)
    
    if not payload:
        return JSONResponse(
            content={"detail": "Invalid or expired token"},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Downstream handlers read the caller via `request.state.user`.
    request.state.user = payload
    return await call_next(request)


@app.get("/")
async def index():
    return {"status": "ok"}


@app.get('/connect')
async def connect(user:CurrentUser):
    try:
        session_id = str(uuid4())
        if not session_id:
            raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,detail="Failed to connect.. :(")
        data = {
            "sessionID":session_id,
            "userID":user['uid']
        }
        update_time, doc_ref  = db.collection("session").add(data)
        print(doc_ref.id,"----")
        return JSONResponse(content={"client_id":session_id},status_code=status.HTTP_201_CREATED)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,deta="Failed to connect.. :(")



from app.graph.agent import ghoseAgent

@app.post("/scan-target")
async def scan_target(req: Scan,user:CurrentUser):
    try:
        
        print("USER",user)
        target = req.target
        graph = await ghoseAgent()
        
        thread_id = user['uid']
        
        
        
        config = {"configurable": {"thread_id": thread_id, "session_id": "xyz"}}
        
        await graph.ainvoke(
            {
                "session": "12345",
                "query":target
            },
            config=config,
        )

        
        
        # response = scanner_client.StartScan(
        #     scan_pb2.ScanRequest(
        #         target = target,
        #         scan_type="UNKNOWN"
        #     )
        # )
        
        # async with httpx.AsyncClient() as client:
        #     res = await client.get(
        #         "http://localhost:8001/scan",
        #         params={"target": target, "scan_type": "UNKNOWN"}
        #     )
        #     response = res.json()
        #     return response
        
        # print(response)
    except Exception as error:
        print("[ERROR]", error)


from app.config.modelConfig import model


# async def test():
#     result =await model.OpenAI.ainvoke("hi hello?")
#     print(result)
    
    
import asyncio

# asyncio.run(test())



