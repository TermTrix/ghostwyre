package internals

import (
	"encoding/binary"
	"fmt"
)

func Find_version_ihl(b []byte) (int, int, int) {
	version := b[0] >> 4
	ihl := b[0] & uint8(0x0F)
	total_bytes := version * ihl
	return int(version), int(ihl), int(total_bytes)
}

func ParseEchoReply(b []byte, icmp *ICMP) {
	echo_type := b[0]
	echo_code := b[1]

	// reply_checksum := binary.BigEndian.Uint16(b[2:4])
	reply_identifier := binary.BigEndian.Uint16(b[4:6])
	reply_sequence := binary.BigEndian.Uint16(b[6:8])

	message := string(b[8:])

	icmp.ReplyCode = int(echo_code)
	icmp.ReplyType = int(echo_type)
	icmp.Identifier = int(reply_identifier)
	icmp.Sequence = int(reply_sequence)
	icmp.Message = string(message)

}

func PrintICMP(packet ICMP) {
	fmt.Println("TERMTRIX PING", packet.SourceIP)
	fmt.Println("---------------------------------------------")

	fmt.Println("\033[36mIPv4\033[0m")

	fmt.Printf("  %-16s : %d\n", "Version", packet.Version)
	fmt.Printf("  %-16s : %d (%d bytes)\n", "IHL", packet.Ihl, packet.Ihl*4)
	fmt.Printf("  %-16s : %s\n", "Source", packet.SourceIP)
	fmt.Printf("  %-16s : %s\n", "Destination", packet.DestinationIP)
	fmt.Printf("  %-16s : %d bytes\n", "Total Length", packet.TotalBytes)
	fmt.Printf("  %-16s : %d\n", "TTL", 64)

	fmt.Println()

	fmt.Println("\033[36mICMP\033[0m")

	fmt.Printf("  %-16s : %d (Echo Reply)\n", "Type", packet.ReplyType)
	fmt.Printf("  %-16s : %d\n", "Code", packet.ReplyCode)
	fmt.Printf("  %-16s : %d\n", "Identifier", packet.Identifier)
	fmt.Printf("  %-16s : %d\n", "Sequence", packet.Sequence)
	// fmt.Printf("  %-16s : %q\n", "Payload", string(packet.Message))

	fmt.Println("---------------------------------------------")
}
