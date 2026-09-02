# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

GhostWyre is a security scanner with a hybrid architecture: a **Go scanning engine**, a **Python AI orchestration layer** (LangGraph), and a **Next.js web UI** (`termtrix`). The AI never scans directly — it parses intent, plans tool calls, and interprets structured scanner output.

Note: `README.md` is an aspirational architecture *plan*; the directory layout it shows (`api/`, `output/`, `configs/`, `pkg/`, etc.) does **not** match the actual tree. Trust the code, not the README, for structure. The `agent/README.md` is empty.

## Three components

| Component | Path | Language | Role |
|-----------|------|----------|------|
| Agent | `agent/` | Python 3.11+ (uv) | FastAPI + Socket.IO API and the LangGraph agent |
| MCP server | `agent/mcp_server/` | Python (FastMCP) | Exposes scan tools to the agent over HTTP/MCP |
| Scanner | `scanner/` | Go 1.25 (cobra) | CLI + gRPC scanning engine (nmap, HTTP header checks) |
| Frontend | `termtrix/` | Next.js 15 / React 19 | Chat UI, Firebase auth, Socket.IO client |

## Running (Makefile at repo root)

```bash
make agent_      # FastAPI + Socket.IO API  → uvicorn app.server:socket_app --port 8000 --reload  (run from agent/)
make ghost       # FastMCP tools server     → uvicorn mcp_server.server:app --port 8001 --reload   (run from agent/)
make termtrix_   # Next.js dev server        → npm run dev                                          (run from termtrix/)
```

The `make go` target (`cd api && go run main.go`) is **broken** — there is no `api/` directory. Build/run the Go scanner directly from `scanner/`:

```bash
cd scanner && go run ./cmd scan https://example.com   # header scan via cobra CLI
go build -o ghostwyre ./cmd                            # single module rooted at repo (go.mod: github.com/termtrix/ghostwyre)
```

Frontend: `cd termtrix && npm run dev | npm run build | npm run start | npm run lint` (lint is bare `eslint`).

Python deps are managed with **uv** (`agent/pyproject.toml`, `uv.lock`) — use `uv sync` / `uv run`, not pip.

## Ports & wiring (all localhost)

- `8000` — agent FastAPI + Socket.IO (`socket_app`)
- `8001` — MCP tools server; the agent connects here (`app/graph/mcp_client.py` → `http://localhost:8001/api/mcp/`). Note `mcp_server/server.py` has a stale `ROOT_URL = 8002` constant that is unused.
- `50051` — gRPC scanner stub (`app/gRPC_client/grpc_client.py`); currently **not called** (the gRPC/HTTP scanner invocation in `server.py` is commented out).
- Redis — pub/sub backplane; host/port from settings. Socket.IO also has an (unused) `AsyncRedisManager`.

## Request flow

1. Frontend authenticates with Firebase, stores the ID token in the `gw_id_token` cookie, calls `GET /connect` to get a `sessionID`, then opens a Socket.IO connection (`termtrix/src/hooks/useSocket.ts`).
2. First chat message is sent over Socket.IO event `client` with `{first_msg, message, client_id}` → handled in `agent/app/services/socker_service.py` (note the misspelled filename) → `ghoseAgent()` (misspelled) graph is invoked.
3. The LangGraph agent runs; each node **publishes progress to Redis** on channel `ghostWyre:{sid}`.
4. `GhostAgentWorker` (`app/services/pub_sub_mgr.py`), started in the FastAPI lifespan, `psubscribe`s to `ghostWyre:*` and re-emits each message to the browser over the Socket.IO `agent` event.

So: **all streaming output goes Redis pub/sub → GhostAgentWorker → Socket.IO**, never returned directly from the HTTP handler.

## LangGraph agent (`agent/app/graph/`)

Graph assembled in `graph/agent.py`:

```
START → initial_node (=parse_node) → route_based_on_intent
          ├─ "chat"  → chat_node → END
          └─ else    → planning_node → tool_node → final_node → END
```

- **parse_node** (`nodes/ghost_nodes.py`) — Azure OpenAI structured output → `ParsedIntent` (`intent`, `target`, `scan_type`, `summary`). `intent` drives routing.
- **chat_node** — Azure OpenAI structured `ChatResponse`; publishes greeting to Redis.
- **planning_node** — **Groq** (`qwen/qwen3-32b`) structured `StucturePlaning` → list of `PlanStep{tool, reason}`; publishes each step's reason with a 2s delay to simulate streaming.
- **tool_node** — `ToolNode` built from MCP tools fetched via `mcp_client.client.get_tools()`.
- **final_node** — in `nodes/initial_node.py` (yes, `final_node` lives in `initial_node.py`); currently just logs.

State shape is `GhostState` in `graph/state.py`. Schemas (`ParsedIntent`, `PlanStep`, `StucturePlaning`, `ChatResponse`) are in `app/schemas/agent_schemas.py`. The `tool` and `scan_type` literals there define the supported tool vocabulary (`nmap_scan`, `whois_lookup`, `dns_enum`, `cve_lookup`, `vul_scan`).

Models are centralized in `app/config/modelConfig.py` as `model.OpenAI` (Azure) and `model.Groq`. `GROQ_API_KEY` is prompted interactively at import if unset.

## MCP tools (`agent/mcp_server/`)

`create_ghost_mcp_tools()` builds a `FastMCP("GhostWyre")` app, mounted at `/api/mcp` in a Starlette app with a Redis-backed `EventStore`. Tools are registered in `mcp_server/tools/web_header_scan.py` (e.g. `web_header_scanner`), which delegate to `mcp_server/ghots.py`. `mcp_server` has its **own** settings/config (`mcp_server/config/credentilas.py`) separate from `app/config`.

## Go scanner (`scanner/`)

- `cmd/root.go` / `cmd/scan.go` — cobra CLI (`ghostwyre scan <url>`); `scan.go` calls `internal.ScanTarget`.
- `header_scanner.go` — `package internal`, `ScanTarget(url)` inspects HTTP headers (Server, CSP, CORS, etc.) → `SiteInfo` JSON.
- `cmd/main.go` — separate `nmapScanner` experiment (calls `Ullaakut/nmap/v4`), not wired into the cobra tree.
- `ghostwyre/scanner/pb/scan_grpc.pb.go` — generated gRPC stubs. The whole repo is **one Go module** (`go.mod` at root, module `github.com/termtrix/ghostwyre`).

## Protobuf regeneration (from `Notes.md`)

The `.proto` source is not checked in at the referenced `proto/` path, but generated code exists (`agent/app/generated/scan_pb2*.py`, Go `pb/`). To regenerate:

```bash
# Python → agent/app/generated
python3 -m grpc_tools.protoc -I=proto --python_out=agent/app/generated --grpc_python_out=agent/app/generated proto/scan.proto
# Go → scanner
protoc --go_out=scanner --go-grpc_out=scanner proto/scan.proto
```

## Auth

Firebase ID tokens. Agent verifies via `firebase-admin` in `app/config/firebase.py`:
- HTTP: `verify_user_token` reads the `gw_id_token` cookie; enforced by the `auth_middleware` in `server.py` (except `PUBLIC_PATHS`: `/`, `/docs`, `/redoc`, `/openapi.json`).
- Socket.IO: `verify_socket_token` parses the cookie from `environ["HTTP_COOKIE"]`; rejects the handshake on failure.

Firebase credentials come from env (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` with `\n`-escaped key), loaded via pydantic `Settings` in `app/config/credentials.py` from `agent/.env`. There is also a `serviceAccountKey.json` in `agent/`.

## Frontend (`termtrix/`)

Next.js app router (`src/app/`), Redux Toolkit (`src/store/`, session state in `reducers/sessionSlice.ts`), shadcn/radix UI (`src/components/ui/`), chat UI in `src/components/ghost/`. API base is `NEXT_PUBLIC_SERVER_URL`; Socket.IO URL is hardcoded to `http://localhost:8000` in `useSocket.ts`. `axios` client uses `withCredentials: true` so the auth cookie rides along.

**`termtrix/AGENTS.md` warns**: this Next.js version has breaking changes vs. training data — read `node_modules/next/dist/docs/` before writing Next.js code and heed deprecation notices. (`termtrix/CLAUDE.md` just re-imports `AGENTS.md`.)

## Conventions worth knowing

- Several identifiers are intentionally-kept misspellings referenced across files — match them exactly: `ghoseAgent`, `socker_service.py`, `StucturePlaning`, `credentilas.py`, `ghots.py`.
- Progress/streaming is **always** via Redis pub/sub on `ghostWyre:{sid}`, not HTTP responses.
- Many code paths (direct gRPC scan call, `AsyncRedisManager`, several nodes) are commented out or stubbed — the agent pipeline (parse → plan → MCP tools) is the live path.
