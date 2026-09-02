package internals

import (
	"encoding/binary"
	"net"
)

type UserInputs struct {
	TargetIP net.IP
	Message  string
}

type ICMP struct {
	Version       int
	Ihl           int
	TotalBytes    int
	SourceIP      net.IP
	DestinationIP net.IP

	ReplyType  int
	ReplyCode  int
	Identifier int
	Sequence   int
	Message    string

	TargetStatus string
}

func BuildPacket(i UserInputs) []byte {
	packet := make([]byte, 8+len(i.Message))

	packet[0] = uint8(8) // Echo Request
	packet[1] = uint8(0)

	binary.BigEndian.PutUint16(packet[4:6], 51) // Indentifier
	binary.BigEndian.PutUint16(packet[6:8], 61) // Sequence
	copy(packet[8:], []byte(i.Message))

	binary.BigEndian.PutUint16(packet[2:4], checksum(packet))

	return packet

}

func checksum(data []byte) uint16 {
	var sum uint32

	// Process 16-bit words
	for i := 0; i+1 < len(data); i += 2 {
		word := uint16(data[i])<<8 | uint16(data[i+1])

		// fmt.Printf("word: 0x%04X\n", word)

		sum += uint32(word)
	}

	// Handle odd byte
	if len(data)%2 != 0 {
		sum += uint32(data[len(data)-1]) << 8
	}

	// End-around carry
	for (sum >> 16) != 0 {
		sum = (sum & 0xFFFF) + (sum >> 16)
	}

	// fmt.Printf("%x\n", sum)
	return ^uint16(sum)
}
