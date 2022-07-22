// A basic HTTP server for testing WebAssembly in a browser
package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strings"
	"syscall"
)

func checkErr(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

func main() {
	wd, err := os.Getwd()
	checkErr(err)
	wd = path.Base(strings.ReplaceAll(wd, "\\", "/")) // replace \\ with / for Windows

	log.Println("Working directory is", wd)
	if wd != "server" {
		checkErr(os.Chdir("./server"))
	}
	log.Println("listening at http://127.0.0.1:8080")
	defer checkErr(err)
	go checkErr(http.ListenAndServe(":8080", http.FileServer(http.Dir("./"))))

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc
}
