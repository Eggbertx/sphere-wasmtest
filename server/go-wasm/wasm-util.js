import { Console } from "sphere-runtime";

const console = new Console();

export class DataWriter {
	constructor(writePath) {
		this.encoder = new TextEncoder("utf-8");
		this.decoder = new TextDecoder("utf-8");
		this.buffer = "";
		this._fs = null;
		if(writePath)
			this._fs = new FileStream(writePath, FileOp.Write);
	}
	writeString(str) {
		this.buffer += str;
		const nl = this.buffer.lastIndexOf("\n");
		if(nl > -1) {
			let writeSubstr = this.buffer.substr(0, nl);
			if(this._fs)
				this._fs.write(writeSubstr);
			else
				console.log(writeSubstr);
			this.buffer = this.buffer.substr(nl + 1);
		}
		return str.length;
	}

	writeBytes(ba) {
		let str = this.decoder.decode(ba);
		return this.writeString(str);
	}
}
