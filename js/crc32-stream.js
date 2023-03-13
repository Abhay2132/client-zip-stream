import EE  from "./EE.js";
import crc32 from "./crc32.js";

function start (){}

export default class c {
	#ts;
	constructor(){
		const me = this;
		this.crc =0
		this.#ts = new TransformStream({start, transform : this.transform.bind(this) });
		this.ee = new EE();
		this.length = 0
	}
	
	transform(d, c){
		this.crc = crc32(d, this.crc);
		c.enqueue(d);
		this.length += d.length;
	}
	
	getCrc (hex) {
		return hex ? this.crc.toString(16) : this.crc;
	}
	
	digest () {
		let crc = new ArrayBuffer(4)
		let v = new DataView();
		v.setUint32(0, this.crc >>> 0);
		return v.getUint32(0)
	}
	
	stream() {
		return this.#ts;
	}
	
	size(c){
		return this.length;
	}
}