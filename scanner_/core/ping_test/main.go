package pingtest

import (
	"net"
	"runtime"
	"slices"

	"github.com/ghostwyre/core/ping_test/internals"
)

func CheckHostOsType() HostResponse {
	osType := runtime.GOOS
	supportedOS := []string{"linux", "darwin"}
	if slices.Contains(supportedOS, osType) {
		return HostResponse{
			Ostype: osType,
			Status: true,
		}
	}
	return HostResponse{
		Ostype: osType,
		Status: false,
	}

}

func IsTargetActive(targetIP net.IP) internals.ICMP {

	// if targetIP == nil {
	// 	fmt.Println("Target is not a valid one....")
	// 	return
	// }

	input := internals.UserInputs{
		TargetIP: targetIP,
		Message:  "TERMTRIX",
	}

	packet := internals.BuildPacket(input)
	buff := internals.SockConn(targetIP, packet)
	VERSION, IHL, TOTAL_BYTES := internals.Find_version_ihl(buff)

	icmp := internals.ICMP{
		Version:       VERSION,
		Ihl:           IHL,
		TotalBytes:    TOTAL_BYTES,
		SourceIP:      net.IP(buff[12:16]),
		DestinationIP: net.IP(buff[16:20]),
	}

	icmp_echo_reply_packets := buff[icmp.TotalBytes:]

	internals.ParseEchoReply(icmp_echo_reply_packets, &icmp)

	if icmp.ReplyType == 0 && icmp.ReplyCode == 0 {
		icmp.TargetStatus = "Active"
	} else {
		icmp.TargetStatus = "InActive"
	}

	return icmp

}
