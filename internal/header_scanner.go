package internal

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptrace"
)

type SiteInfo struct {
	Status           int    `json:"status"`
	Content_Type     string `json:"content_type"`
	Origin           string `json:"origin"`
	Date_of_Scanning string `json:"date_of_scanning"`
	Server           string `json:"server"`
	ConnectionStatus string `json:"connection_status"`
	CSP              string `json:"csp"`
}

func ScanTarget(url string) SiteInfo {

	fmt.Println("TARGET", url)
	trace := &httptrace.ClientTrace{
		DNSDone: func(info httptrace.DNSDoneInfo) {
			fmt.Println("DNS lookup done:", info.Addrs)
		},
		ConnectDone: func(network, addr string, err error) {
			fmt.Println("Connected to:", addr)
		},
		GotConn: func(info httptrace.GotConnInfo) {
			fmt.Println("Connection reused:", info.Reused)
		},
	}

	req, _ := http.NewRequest("GET", url, nil)
	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("error:", err)
		return SiteInfo{}
	}
	defer resp.Body.Close()

	// fmt.Println("Status:", resp.StatusCode)
	// fmt.Println("Content-Type:", resp.Header.Get("Content-Type"))
	// fmt.Println("CSP:", resp.Header.Get("Content-Security-Policy"))
	// fmt.Println("Server:", resp.Header.Get("Server"))

	fmt.Println("-----------------------------------------")
	fmt.Println("Results are stored in result.json :)")

	var ConnectStatus = resp.Header.Get("Connection")

	if resp.Header.Get("Connection") == "" {
		if resp.StatusCode == 200 {
			ConnectStatus = "Keep-Alive"
		}
	}

	data := SiteInfo{
		Status:           resp.StatusCode,
		Content_Type:     resp.Header.Get("Content-Type"),
		Origin:           resp.Header.Get("Cross-Origin-Opener-Policy"),
		Date_of_Scanning: resp.Header.Get("Date"),
		Server:           resp.Header.Get("Server"),
		ConnectionStatus: ConnectStatus,
		CSP:              resp.Header.Get("Content-Security-Policy"),
	}

	jsonData, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println(string(jsonData))

	return data
}
