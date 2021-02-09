// A basic HTTP server for testing WebAssembly in a browser
package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	if wd != "server" {
		if err = os.Chdir("./server"); err != nil {
			log.Fatalln("Error changing directory:", err.Error())
		}
	}
	log.Println("listening at http://127.0.0.1:8080")
	defer func() {
		log.Println("Error:", err)
	}()

	go func() {
		err = http.ListenAndServe(":8080", http.FileServer(http.Dir("./")))
	}()
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc

	log.Println("post-ListenAndServe returns error:", err)
	os.Exit(0)
}
