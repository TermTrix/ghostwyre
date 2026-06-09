go:
	@echo "GhostWyre starting"
	cd scanner/cmd && go run main.go

termtrix:
	@echo "Termtrix starting"
	cd termtrix && npm run dev

agent_:
	@echo "Ghost Agent"
	cd agent && uvicorn app.server:app --reload