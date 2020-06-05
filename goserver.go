// A basic HTTP server for testing WebAssembly in a browser
package main

import (
	"log"
	"net/http"
)

func main() {
	log.Println("listening at 127.0.0.1:8080")
	err := http.ListenAndServe(":8080", http.FileServer(http.Dir("./go-wasm")))
	log.Fatalln(err)
}
