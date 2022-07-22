package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	fmt.Println("Hello from Go/WebAssembly!")

	sphereNS := js.Global().Get("Sphere")
	if sphereNS.IsUndefined() {
		// not running in Sphere
		return
	}
	version := sphereNS.Get("Engine").String()
	fmt.Printf("According to WebAssembly, it looks like you're using neoSphere version %s\n", version)
}
