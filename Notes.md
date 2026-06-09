
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