package internals

import (
	"fmt"
	"net"

	"golang.org/x/sys/unix"
)

func SockConn(target net.IP, packet []byte) []byte {

	fd, err := unix.Socket(
		unix.AF_INET,
		unix.SOCK_RAW,
		unix.IPPROTO_ICMP,
	)

	if err != nil {
		fmt.Println("Failed to connect socket conn", err)
		return nil
	}

	addr := unix.SockaddrInet4{
		Port: 0,
	}

	fmt.Println(fd, "FDDDDD")
	copy(addr.Addr[:], target)

	unix.Sendto(fd, packet, 0, &addr)

	buff := make([]byte, 2048)

	n, _, _ := unix.Recvfrom(fd, buff, 0)

	return buff[:n]
}
