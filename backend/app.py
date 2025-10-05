from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
import httpx
import asyncio
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SigmaCode AI SaaS Backend",
    description="Security-First AI Platform Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
DIFY_API_URL = os.getenv("DIFY_API_URL", "http://localhost:5001")
FIREWALL_ENABLED = os.getenv("FIREWALL_ENABLED", "false").lower() == "true"
FIREWALL_MODE = os.getenv("FIREWALL_MODE", "off")

class AgentInvokeRequest(BaseModel):
    agent_id: str = Field(..., description="Agent ID from Dify")
    inputs: Dict[str, Any] = Field(default_factory=dict)
    query: str = Field(..., description="User query")
    response_mode: str = Field(default="streaming")
    user: str = Field(default="default-user")

class AgentInvokeResponse(BaseModel):
    request_id: str
    status: str
    firewall_status: Optional[str] = None
    firewall_mode: Optional[str] = None
    response: Any
    latency_ms: int
    backend: str = "dify"

class HealthCheck(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, str]

async def verify_auth(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization format")
    return authorization.replace("Bearer ", "")

@app.get("/", response_model=Dict[str, str])
async def root():
    return {
        "status": "online",
        "service": "SigmaCode AI SaaS Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthCheck)
async def health_check():
    services = {
        "api": "healthy",
        "supabase": "configured" if SUPABASE_URL else "not_configured",
        "database": "configured" if DATABASE_URL else "not_configured",
        "dify": "configured" if DIFY_API_URL else "not_configured",
        "firewall": FIREWALL_MODE if FIREWALL_ENABLED else "disabled"
    }
    
    return HealthCheck(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        services=services
    )

@app.get("/status", response_model=Dict[str, Any])
async def status():
    return {
        "api_status": "running",
        "supabase_url": SUPABASE_URL[:30] + "..." if SUPABASE_URL else None,
        "database_configured": bool(DATABASE_URL),
        "dify_url": DIFY_API_URL,
        "firewall": {
            "enabled": FIREWALL_ENABLED,
            "mode": FIREWALL_MODE
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/agents/invoke", response_model=AgentInvokeResponse)
async def invoke_agent(
    request: AgentInvokeRequest,
    token: str = Depends(verify_auth)
):
    start_time = datetime.utcnow()
    request_id = f"req_{int(start_time.timestamp() * 1000)}"
    
    logger.info(f"[{request_id}] Agent invoke started: {request.agent_id}")
    
    firewall_status = None
    firewall_result = None
    
    # Firewall Pre-Check (Shadow/Enforce Mode)
    if FIREWALL_ENABLED and FIREWALL_MODE in ["shadow", "enforce"]:
        logger.info(f"[{request_id}] Firewall check ({FIREWALL_MODE} mode)")
        
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                fw_response = await client.post(
                    f"{os.getenv('SUPERAGENT_URL', 'http://localhost:8000')}/api/firewall/check",
                    json={
                        "content": request.query,
                        "context": request.inputs
                    },
                    headers={"Authorization": f"Bearer {os.getenv('SUPERAGENT_API_KEY', '')}"}
                )
                firewall_result = fw_response.json()
                firewall_status = firewall_result.get("status", "unknown")
                
                if FIREWALL_MODE == "enforce" and firewall_status == "blocked":
                    raise HTTPException(
                        status_code=403,
                        detail={
                            "error": "Request blocked by firewall",
                            "reason": firewall_result.get("reason"),
                            "request_id": request_id
                        }
                    )
        except httpx.TimeoutException:
            logger.warning(f"[{request_id}] Firewall timeout")
            if FIREWALL_MODE == "enforce":
                raise HTTPException(status_code=503, detail="Firewall service unavailable")
        except Exception as e:
            logger.error(f"[{request_id}] Firewall error: {str(e)}")
            if FIREWALL_MODE == "enforce":
                raise HTTPException(status_code=500, detail="Firewall error")
    
    # Invoke Dify Agent
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            dify_response = await client.post(
                f"{DIFY_API_URL}/v1/chat-messages",
                json={
                    "inputs": request.inputs,
                    "query": request.query,
                    "response_mode": request.response_mode,
                    "user": request.user
                },
                headers={
                    "Authorization": f"Bearer {os.getenv('DIFY_API_KEY', '')}",
                    "Content-Type": "application/json"
                }
            )
            dify_response.raise_for_status()
            response_data = dify_response.json()
    except httpx.HTTPError as e:
        logger.error(f"[{request_id}] Dify error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Dify agent error: {str(e)}")
    
    end_time = datetime.utcnow()
    latency_ms = int((end_time - start_time).total_seconds() * 1000)
    
    logger.info(f"[{request_id}] Completed in {latency_ms}ms")
    
    return AgentInvokeResponse(
        request_id=request_id,
        status="success",
        firewall_status=firewall_status,
        firewall_mode=FIREWALL_MODE if FIREWALL_ENABLED else None,
        response=response_data,
        latency_ms=latency_ms,
        backend="dify"
    )

@app.post("/api/firewall/analyze")
async def analyze_with_firewall(
    request: Dict[str, Any],
    token: str = Depends(verify_auth)
):
    if not FIREWALL_ENABLED:
        raise HTTPException(status_code=503, detail="Firewall not enabled")
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            fw_response = await client.post(
                f"{os.getenv('SUPERAGENT_URL')}/api/firewall/analyze",
                json=request,
                headers={"Authorization": f"Bearer {os.getenv('SUPERAGENT_API_KEY')}"}
            )
            fw_response.raise_for_status()
            return fw_response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Firewall error: {str(e)}")

@app.get("/api/metrics")
async def get_metrics(token: str = Depends(verify_auth)):
    return {
        "uptime_seconds": 0,
        "requests_total": 0,
        "firewall_blocks": 0,
        "avg_latency_ms": 0
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "path": str(request.url)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
