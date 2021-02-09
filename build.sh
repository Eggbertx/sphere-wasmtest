#!/usr/bin/env bash
set -e

CMD="all"
EMS_DIR="server/emscripten-wasm"
EMS_PREFIX="emscripten-wasm"
GWASM_DIR="server/go-wasm"
GWASM_PREFIX="go-wasm"

function usage {
	echo "usage: $0 [cmd]
valid cmd values:
	all
		builds the Go stuff, the Emscripten stuff, and runs the cell command
	emscripten
		builds the WebAssembly stuff in ./server/emscripten-wasm with Emscripten
	go
		builds the WebAssembly stuff in ./server/go-wasm with Go
	cell
		builds the Sphere project for testing WebAssembly processing with Sphere
	clean
		cleans the files compiled by Go and Emscripten, and the Sphere project files in ./dist
	server
		Runs a server for testing the WebAssembly stuff in a browser
	help
		prints this message"
}

function build-go {
	echo "building go stuff"
	GOOS=js GOARCH=wasm go build -o ${GWASM_DIR}/${GWASM_PREFIX}.wasm ./$GWASM_DIR
}

function build-ems {
	echo "building emscripten stuff"
	emcc -o ${EMS_DIR}/${EMS_PREFIX}.js ${EMS_DIR}/main.c -O2
}

if [[ -n "$1" ]]; then
	CMD=$1
fi

case "$CMD" in
"all")
	build-ems
	build-go
	cell
	;;
"emscripten")
	echo "building emscripten stuff"
	;;
"go")
	build-go
	;;
"cell")
	cell
	;;
"clean")
	echo "cleaning stuff"
	rm -rf dist
	rm -f $EMS_DIR/$EMS_PREFIX*
	rm -f $GWASM_DIR/$GWASM_PREFIX*
	;;
"server")
	go run ./server/goserver.go
*)
	usage
	;;
esac