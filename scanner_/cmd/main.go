package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	pingtest "github.com/ghostwyre/core/ping_test"
	"github.com/go-chi/chi/v5"
	"golang.org/x/sys/unix"
)

type Response struct {
	Message string `json:"message"`
}

func main() {
	fmt.Println("HELLLO")

	// IntializeSocket()

	// IP := []byte{192, 168, 29, 62}

	// pingtest.IsTargetActive(IP)

	r := chi.NewRouter()

	res := Response{
		Message: "TERMTRIX",
	}
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "json")
		json.NewEncoder(w).Encode(res)
	})

	r.Get("/is-target-active", func(w http.ResponseWriter, r *http.Request) {
		hostRes := pingtest.CheckHostOsType()
		if !hostRes.Status {
			json.NewEncoder(w).Encode(hostRes)
			return
		}

		IP := []byte{192, 168, 29, 186}
		res := pingtest.IsTargetActive(IP)

		fmt.Println(hostRes, "HOST OS TYPE")
		json.NewEncoder(w).Encode(res)
	})

	fmt.Println("GHOST STARTED AT 8002")
	http.ListenAndServe(":8002", r)
}

func IntializeSocket() {
	fd, err := unix.Socket(
		unix.AF_INET,
		unix.SOCK_STREAM,
		0,
	)

	if err != nil {
		fmt.Println("failed to connect")
		return
	}

	fmt.Println(fd, "<-FD")

}
