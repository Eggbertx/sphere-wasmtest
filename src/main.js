import { Thread } from 'sphere-runtime';
// import { GoWasm } from '@/go-wasm/go-wasm'
import "@/go-wasm/wasm_exec"

export default
class WebAssemblyTest extends Thread {
	constructor() {
		super();
		let wasmFile = new FileStream("@/go-wasm/go-wasm.wasm", FileOp.Read);
		this.fileArr = wasmFile.read(wasmFile.fileSize);
		this.go = new Go();
	}
	async start() {
		return super.start().then(() => {
			WebAssembly.instantiate(this.fileArr, this.go.importObject).then(results => {
				this.go.run(results.instance);
				// this.wasmRunner.run(results.instance);
			});
		});
	}

	on_update() {
		if(Keyboard.Default.isPressed(Key.Escape))
			Sphere.shutDown();
	}

	on_render() {

	}
}
