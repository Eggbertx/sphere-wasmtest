Object.assign(Sphere.Game, {
	version: 2,
	apiLevel: 2,

	name: "Sphere WebAssembly Test",
	author: "Eggbertx",
	summary: "Testing the WebAssembly API with neoSphere",
	resolution: '640x480',

	main: '@/scripts/main.js',
});


install('@/scripts', files('src/*.js'));

// for .wasm files compiled with Go
install('@/go-wasm', files('server/go-wasm/*.wasm'));
install('@/go-wasm', files('server/go-wasm/*.js'));

// for .wasm files compiled with Emscripten
install('@/emscripten-wasm', files('server/emscripten-wasm/*.wasm'));
install('@/emscripten-wasm', files('server/emscripten-wasm/*.js'));

install('@/', files('icon.png'));
