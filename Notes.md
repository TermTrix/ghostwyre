
## 1-> Project setup

go mod init github.com/yourname/project
go mod tidy        # clean up dependencies
go get package     # add a dependency


python3 -m grpc_tools.protoc \
  -I=proto \
  --python_out=agent/app/generated \
  --grpc_python_out=agent/app/generated \
  proto/scan.proto


# Go

protoc \
  --go_out=scanner \
  --go-grpc_out=scanner \
  proto/scan.proto



  START
  ↓
[parse_intent]      ← classify: scan / analyze / report / explain
  ↓
[plan_steps]        ← LLM breaks query into tool calls + steps
  ↓                   publishes: "Planning: I'll run nmap then analyze..."
[execute_tools]     ← runs actual tools (nmap, whois, etc.)
  ↓                   publishes each tool result as it completes
[synthesize]        ← LLM combines tool outputs into findings
  ↓                   publishes: "Here's what I found..."
[stream_response]   ← final formatted response to client
  ↓
END
