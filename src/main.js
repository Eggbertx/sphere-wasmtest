import { Thread } from 'sphere-runtime';

let importObject = {
	imports: {
		go: arg => {
			SSj.log(arg);
		}
	}
}


export default
class WebAssemblyTest extends Thread {
	constructor() {
		super();
		let wasmFile = new FileStream("@/go-wasm/go-wasm.wasm", FileOp.Read);
		let fileArr = wasmFile.read(wasmFile.fileSize);

		WebAssembly.instantiate(fileArr, importObject).then(results => {
			Sphere.abort(results.instance);
		});

	}

	on_update() {
		if(Keyboard.Default.isPressed(Key.Escape))
			Sphere.shutDown();
	}

	on_render() {

	}
}
