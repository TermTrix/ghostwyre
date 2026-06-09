package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/termtrix/ghostwyre/internal"
)

func main() {

	r := gin.Default()

	r.GET("/scan", scanHandler)
	fmt.Println("Server running on :8001")

	r.Run(":8001")
}

func scanHandler(c *gin.Context) {
	// fmt.Print("helllo")
	target := c.Query("target")

	dns := "https://" + target
	fmt.Println(dns)
	res := internal.ScanTarget(dns)

	c.JSON(
		http.StatusOK, gin.H{
			"status": true,
			"target": res,
		},
	)

}
