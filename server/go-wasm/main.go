package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	sphereNS := js.Global().Get("Sphere")
	version := sphereNS.Get("Engine").String()
	fmt.Println("Hello from Go/WebAssembly!")
	fmt.Printf("According to WebAssembly, it looks like you're using %s\n", version)
}
