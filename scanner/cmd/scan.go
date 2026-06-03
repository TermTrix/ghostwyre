package main

import (
	"github.com/spf13/cobra"
	"github.com/termtrix/ghostwyre/scanner/internal"
)

var scanCmd = &cobra.Command{
	Use:   "scan [url]",
	Short: "Scan a target URL for security headers",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		url := args[0]
		internal.ScanTarget(url)
	},
}

func init() {
	rootCmd.AddCommand(scanCmd)
}
