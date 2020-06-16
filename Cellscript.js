Object.assign(Sphere.Game, {
	version: 2,
	apiLevel: 2,

	name: "WebAssembly Test",
	author: "Eggbertx",
	summary: "Testing the WebAssembly API with miniSphere",
	resolution: '640x480',

	main: '@/scripts/main.js',
});


install('@/scripts',	files('src/*.js'));
install('@/go-wasm',	files('go-wasm/*.wasm'));
install('@/go-wasm',	files('go-wasm/*.js'));
install('@/',			files('icon.png'));
