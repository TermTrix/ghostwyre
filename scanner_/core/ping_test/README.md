# Termtrix Ping

A lightweight ICMP ping utility written in Go that sends raw ICMP echo requests and parses detailed IPv4 and ICMP response information.

## Features

- **Raw ICMP Packets**: Constructs and sends raw ICMP echo request packets
- **Detailed Response Parsing**: Extracts and displays IPv4 header and ICMP echo reply information
- **Custom Messages**: Send custom payloads in ICMP packets
- **Low-level Socket Operations**: Uses raw sockets for direct packet control

## Prerequisites

- **Linux** (required - uses `unix.Socket` and raw ICMP sockets)
- Go 1.25.1 or higher
- Root/sudo privileges (required for raw socket operations)

## Installation

```bash
git clone https://github.com/termtrix-ping/termtrix-ping.git
cd termtrix-ping
go build -o termtrix-ping
```

## Usage

```bash
sudo ./termtrix-ping -t <target-ip> [-m "your message"]
```

### Options

- `-t`: Target IPv4 address (required)
- `-m`: Custom message payload (optional, defaults to "TERMTRIX")

### Example

```bash
sudo ./termtrix-ping -t 10.0.0.42 -m "Hello from Termtrix"
```

## Output

The tool displays comprehensive IPv4 and ICMP information:

```
TERMTRIX PING 10.0.0.42

IPv4
  Version       : 4
  IHL           : 5 (20 bytes)
  Source        : 10.0.0.15
  Destination   : 10.0.0.42
  Total Length  : 47 bytes
  TTL           : 64

ICMP
  Type          : 0 (Echo Reply)
  Code          : 0
  Identifier    : 123
  Sequence      : 100
  Payload       : "HELLO FROM TERMTRIX"
```

## Project Structure

```
.
├── main.go              # Entry point and CLI handler
├── internals/
│   ├── packets.go      # ICMP packet construction and checksum calculation
│   ├── connection.go   # Raw socket management
│   └── helpers.go      # Response parsing and display utilities
├── go.mod              # Go module definition
└── README.md           # This file
```

## How It Works

1. **Packet Construction**: Builds ICMP echo request packets with custom payloads
2. **Checksum Calculation**: Computes valid ICMP checksums for packet integrity
3. **Raw Socket**: Sends packets via raw ICMP sockets (requires root)
4. **Response Capture**: Receives and buffers the ICMP echo reply
5. **Parsing**: Extracts IPv4 header and ICMP fields from the response
6. **Display**: Formats and prints the network information

## Requirements

- `golang.org/x/sys/unix` - For raw socket operations

## Limitations

- **Linux only** - Does not support macOS, Windows, or other operating systems
- **Requires root privileges** - Raw socket operations need elevated permissions
- **IPv4 only** - Currently supports only IPv4 addresses

## License

MIT
