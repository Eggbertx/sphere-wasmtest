param (
	[string]$action = "usage"
)


function build-ems {
	echo "building emscripten stuff"
	emcc -o server/emscripten-wasm/emscripten-wasm.js server/emscripten-wasm/main.c -O2
}

function build-go {
	echo "building go stuff"
	cd server/go-wasm/
	$env:GOOS = "js"
	$env:GOARCH = "wasm"
	go build -o go-wasm.wasm
	cd ../../
	Copy-Item (Join-Path (go env GOROOT) "/misc/wasm/wasm_exec.js") server/go-wasm/
	
}

function run-server {
	go run ./server/goserver.go
}

function clean {
	Write-Output "cleaning up"
	Remove-Item dist -Recurse -ErrorAction Ignore
	Remove-Item server/emscripten-wasm/emscripten-wasm* -ErrorAction Ignore
	Remove-Item server/go-wasm/go-wasm.wasm -ErrorAction Ignore
}


$env:GOOS = $null
$env:GOARCH = $null

switch($action) {
	{($_ -eq "emscripten") -or ($_ -eq "c") } {
		build-ems
	}
	"go" {
		build-go
	}
	"server" {
		run-server
	}
	"clean" {
		clean
	}
	default {
		Write-Output "usage: build.ps1 [c|go|server|clean]"
	}
}
