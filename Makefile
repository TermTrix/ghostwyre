go:
	@echo "GhostWyre starting"
	cd api && go run main.go

termtrix_:
	@echo "Termtrix starting"
	cd termtrix && npm run dev

agent_:
	@echo "Ghost Agent"
	cd agent && uvicorn app.server:app --reload

