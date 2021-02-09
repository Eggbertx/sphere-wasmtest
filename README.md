# miniSphere-wasmtest

I'm using this to test/experiment with WebAssembly support in miniSphere. It's currently very unstable and only works with WebAssembly files compiled in Go. Eventually I want to make it more flexible and compatible with any miniSphere compatible WebAssembly file. I'll also probably/eventually/maybe add Rust files to test that too.

Note that this requires [Emscripten](https://github.com/emscripten-core/emsdk), [Go](https://golang.org), and [Sphere](https://github.com/fatcerberus/sphere)

## Building
Run `./build.sh help` in a Unix-like environment to see usage info.
Batch file comming soon (maybe).

## Screenshot
Here is a screenshot of it running a simple hello world program that gets some info from the Sphere API and shows it in the Console object.

![Screenshot](screenshot.png)
