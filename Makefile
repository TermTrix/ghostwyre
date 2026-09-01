go:
	@echo "GhostWyre starting"
	cd api && go run main.go

termtrix_:
	@echo "Termtrix starting"
	cd termtrix && npm run dev

agent_:
	@echo "Ghost Agent"
	cd agent && uvicorn app.server:socket_app --port 8000 --reload


ghost:
	@echo "Ghost Agent"
	cd agent && uvicorn mcp_server.server:app --host 127.0.0.1 --port 8001 --reload