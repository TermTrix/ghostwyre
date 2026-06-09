import grpc

from app.generated import scan_pb2
from app.generated import scan_pb2_grpc

channel = grpc.insecure_channel("localhost:50051")

scanner_client = scan_pb2_grpc.ScannerServiceStub(channel)
