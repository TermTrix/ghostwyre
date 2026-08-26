from xmlrpc import client
from fastapi import FastAPI,status,HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.socker_service import sio
from socketio import ASGIApp
from app.services.pub_sub_mgr import GhostAgentWorker

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
from uuid import uuid4

@app.get('/connect')
async def connect():
    try:
        client_id = str(uuid4())
        if not client_id:
            raise HTTPException(status_code=status.HTTP_204_NO_CONTENT,detail="Failed to connect.. :(")
        return JSONResponse(content={"client_id":client_id},status_code=status.HTTP_201_CREATED)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Failed to connect.. :(")



from app.graph.agent import ghoseAgent

@app.post("/scan-target")
async def scan_target(req: Scan):
    try:
        target = req.target
        
        print(target,"[TARGET]")
        graph = await ghoseAgent()
        
        thread_id = str(uuid4())

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



