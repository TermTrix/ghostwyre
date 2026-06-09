package internal

import (
	"context"
	"log"
	"time"

	"github.com/Ullaakut/nmap/v2"
)

func nmapScanner(target string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	scanner, err := nmap.NewScanner(
		nmap.WithContext(ctx),
		nmap.WithTargets("localhost", "192.168.1.1"),
		nmap.WithPorts("80", "443", "8080"),
		nmap.WithSYNScan(), // Requires root/administrator privileges
	)
	if err != nil {
		log.Fatalf("Failed to create scanner: %v", err)
	}
	result, warnings, err := scanner.Run()

	if err != nil {
		log.Fatalf("Scan failed: %v", err)
	}

	if len(warnings) > 0 {
		log.Printf("Scan warnings: %v", warnings)
	}

	_ = result
}
