// large chunks of this are based on wasm_exec.js from the Go source code
// adapted to be compatible with miniSphere

import { DataWriter } from "./wasm-util";

const encoder = new TextEncoder("utf-8");
const decoder = new TextDecoder("utf-8");
const writer = new DataWriter();

global.thing = "thing";

function randomArrayValues(arr) {
	for(const i in arr) {
		arr[i] = Math.floor(Math.random() * 256);
	}
}

global.fs = {
	constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1 }, // unused
	writeSync: (fd, buf) => {
		writer.writeBytes(buf);
	},
	write: (fd, buf) => {
		writer.writeBytes(buf);
	}
};

global.process = {

}


export class GoWasm {
	constructor() {
		this.argv = ["js"];
		this.env = {};
		this.instance = null;
		const timeOrigin = Date.now();
		this.mem = new DataView(new ArrayBuffer(0));
		this.exited = false;
		this.values = [];
		this.goRefCounts = []; // number of references that Go has to a JS value, indexed by reference id
		this.ids = new Map();  // mapping from JS values to reference ids
		this.idPool = [];      // unused ids that have been garbage collected
		this.exited = false;    // whether the Go program has exited

		this._exitPromise = new Promise((resolve) => {
			this._resolveExitPromise = resolve;
		});

		this.importObject = {
			go: {
				"debug": value => {
					SSj.log(`debug value: ${value}`);
				},
				"runtime.clearTimeoutEvent": sp => {
					SSj.log(`runtime.clearTimeoutEvent sp: ${sp}`);
				},
				"runtime.getRandomData": sp => {
					let slice = this.loadSlice(sp + 8);
					randomArrayValues(slice);
				},
				"runtime.nanotime1": sp => {
					this.setInt64(sp + 8, (timeOrigin + Date.now()) * 1000000);
				},
				"runtime.resetMemoryDataView": sp => {
					this.mem = new DataView(this.instance.exports.mem.buffer);
				},
				"runtime.scheduleTimeoutEvent": sp => {
					SSj.log(`scheduleTimeoutEvent sp: ${sp}`);
				},
				"runtime.walltime1": sp => {
					const msec = (new Date).getTime();
				},
				"runtime.wasmExit": sp => {
					this.exit();
				},
				"runtime.wasmWrite": sp => {
					// const fd = this.getInt64(sp + 8);
					const p = this.getInt64(sp + 16);
					const n = this.mem.getInt32(sp + 24, true);
					writer.writeBytes(new Uint8Array(this.instance.exports.mem.buffer, p, n));
					// SSj.log(`fd: ${fd}, p: ${p}, n: ${n}, buffer: ${bufferLoc}`)
				},
				"syscall/js.finalizeRef": sp => {
					SSj.log(`syscall/js.finalizeRef sp: ${sp}`);
				},
				"syscall/js.stringVal": sp => {
					this.storeValue(sp + 24, this.loadString(sp + 8));
					// SSj.log(`js.stringVal sp: ${sp}`);
				},
				"syscall/js.valueGet": sp => {
					const val = this.loadValue(sp + 8);
					const str = this.loadString(sp + 16);
					const result = Reflect.get(val, str);
					// let resultVal = result();

					sp = this.instance.exports.getsp();
					this.storeValue(sp + 32, result);
					// SSj.log(`syscall/js.valueGet sp: ${sp}`);
				},
				"syscall/js.valueSet": sp => {
					Reflect.set(
						this.loadValue(sp + 8),
						this.loadString(sp + 16),
						this.loadValue(sp + 32));
					// SSj.log(`syscall/js.valueSet sp: ${sp}`);
				},
				"syscall/js.valueDelete": sp => {
					SSj.log(`syscall/js.valueDelete sp: ${sp}`);
				},
				"syscall/js.valueIndex": sp => {
					SSj.log(`syscall/js.valueIndex sp: ${sp}`);
				},
				"syscall/js.valueSetIndex": sp => {
					SSj.log(`syscall/js.valueSetIndex sp: ${sp}`);
				},
				"syscall/js.valueCall": sp => {
					try {
						const v = this.loadValue(sp + 8);
						const m = Reflect.get(v, loadString(sp + 16));
						const args = this.loadSliceOfValues(sp + 32);
						const result = Reflect.apply(m, v, args);
						sp = this.instance.exports.getsp();
						storeValue(sp + 56, result);
						this.mem.setUint8(sp + 64, 1);
					} catch (err) {
						this.storeValue(sp + 56, err);
						this.mem.setUint8(sp + 64, 0);
					}
					// SSj.log(`syscall/js.valueCall sp: $${sp}`);
				},
				"syscall/js.valueInvoke": sp => {
					SSj.log(`syscall/js.valueInvoke sp: ${sp}`);
				},
				"syscall/js.valueNew": sp => {
					try {
						const v = this.loadValue(sp + 8);
						const args = this.loadSliceOfValues(sp + 16);
						const result = Reflect.construct(v, args);
						sp = this.instance.exports.getsp();
						this.storeValue(sp + 40, result);
						this.mem.setUint8(sp + 48, 1);
					} catch (err) {
						this.storeValue(sp + 40, err);
						this.mem.setUint8(sp + 48, 0);
					}
					// SSj.log(`syscall/js.valueNew sp: ${sp}`);
				},
				"syscall/js.valueLength": sp => {
					SSj.log(`syscall/js.valueLength sp: ${sp}`);
				},
				"syscall/js.valuePrepareString": sp => {
					SSj.log(`syscall/js.valuePrepareString sp: ${sp}`);
				},
				"syscall/js.valueLoadString": sp => {
					const str = this.loadValue(sp + 8);
					this.loadSlice(sp + 16).set(str);
				},
				"syscall/js.valueInstanceOf": sp => {
					SSj.log(`syscall/js.valueInstanceOf sp: ${sp}`);
				},
				"syscall/js.copyBytesToGo": sp => {
					SSj.log(`syscall/js.copyBytesToGo sp: ${sp}`);
				},
				"syscall/js.copyBytesToJS": sp => {
					const dst = this.loadValue(sp + 8);
					const src = this.loadSlice(sp + 16);
					if (!(dst instanceof Uint8Array)) {
						this.mem.setUint8(sp + 48, 0);
						return;
					}
					const toCopy = src.subarray(0, dst.length);
					dst.set(toCopy);
					this.setInt64(sp + 40, toCopy.length);
					this.mem.setUint8(sp + 48, 1);
					// SSj.log(`syscall/js.copyBytesToJS sp: ${sp}`);
				},
			}
		}
	}
	async run(instance, ...args) {
		this.instance = instance;
		this.values = [
			// JS values that Go currently has references to, indexed by reference id
			NaN,
			0,
			null,
			true,
			false,
			global,
			this,
		];
		this.mem = new DataView(this.instance.exports.mem.buffer);
		this.storeValue(0, global.constants);
		this.storeValue(0, global.fs);
		this.storeValue(0, global.process);
		this.instance.exports.run(0,[]);
	}
	_makeFuncWrapper(id) {
		const go = this;
		return function() {
			const event = { id: id, this: this, args: arguments };
			go._pendingEvent = event;
			go._resume();
			return event.result;
		};
	}
	_resume() {
		if(this.exited) {
			throw new Error("Go program has already exited");
		}
		this.instance.exports.resume();
		if (this.exited) {
			this._resolveExitPromise();
		}
	}

	// functions for getting/storing values in wasm memory
	getInt64(addr) {
		const low = this.mem.getUint32(addr + 0, true);
		const high = this.mem.getInt32(addr + 4, true);
		return low + high * 2e32;
	}
	setInt64(addr, val) {
		this.mem.setUint32(addr + 0, val, true);
		this.mem.setUint32(addr + 4, Math.floor(val / 2e32), true);
	}
	loadValue(addr) {
		const f = this.mem.getFloat64(addr, true);
		if (f === 0) {
			return undefined;
		}
		if (!isNaN(f)) {
			return f;
		}

		const id = this.mem.getUint32(addr, true);
		return this.values[id];
	}
	storeValue(addr, val) {
		const nanHead = 0x7FF80000;

		if (typeof val === "number") {
			if (isNaN(val)) {
				this.mem.setUint32(addr + 4, nanHead, true);
				this.mem.setUint32(addr, 0, true);
				return;
			}
			if (val === 0) {
				this.mem.setUint32(addr + 4, nanHead, true);
				this.mem.setUint32(addr, 1, true);
				return;
			}
			this.mem.setFloat64(addr, val, true);
			return;
		}

		switch (val) {
			case undefined:
				this.mem.setFloat64(addr, 0, true);
				return;
			case null:
				this.mem.setUint32(addr + 4, nanHead, true);
				this.mem.setUint32(addr, 2, true);
				return;
			case true:
				this.mem.setUint32(addr + 4, nanHead, true);
				this.mem.setUint32(addr, 3, true);
				return;
			case false:
				this.mem.setUint32(addr + 4, nanHead, true);
				this.mem.setUint32(addr, 4, true);
				return;
		}

		let id = this.ids.get(val);
		if (id === undefined) {
			id = this.idPool.pop();
			if (id === undefined) {
				id = this.values.length;
			}
			this.values[id] = val;
			this.goRefCounts[id] = 0;
			this.ids.set(val, id);
		}
		this.goRefCounts[id]++;
		let typeFlag = 1;
		switch (typeof val) {
			case "string":
				typeFlag = 2;
				break;
			case "symbol":
				typeFlag = 3;
				break;
			case "function":
				typeFlag = 4;
				break;
		}
		this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
		this.mem.setUint32(addr, id, true);
	}
	loadSlice(addr) {
		const array = this.getInt64(addr + 0);
		const len = this.getInt64(addr + 8);
		return new Uint8Array(this.instance.exports.mem.buffer, array, len);
	}

	loadSliceOfValues(addr) {
		const array = this.getInt64(addr + 0);
		const len = this.getInt64(addr + 8);
		const a = new Array(len);
		for(let i = 0; i < len; i++) {
			a[i] = this.loadValue(array + i * 8);
		}
		return a;
	}
	loadString(addr) {
		const saddr = this.getInt64(addr + 0);
		const len = this.getInt64(addr + 8);
		return decoder.decode(new DataView(this.instance.exports.mem.buffer, saddr, len));
	}

	exit() {
		// Sphere.shutDown();
	}
}
