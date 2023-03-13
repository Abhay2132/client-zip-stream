import zipUtil from "./zipUtliz.js";
import constants from "./constants.js";
import Crc32Stream from "./crc32-stream.js";

export default class c {
	constructor(source, name, cb){/* o -> {source, name, cb}  */
		this.entry = {source,name};
		this.cb = cb;
		this.data = {
			stage : "initial",
			offsets : {
				file: 0,
				data: 0,
				contents: 0
			},
			time : zipUtil.dateToDos(new Date()),
			crcStream : false,
			reader : false,
			crc : 0,
			size : 0,
			csize : 0,
			platform : constants.PLATFORM_FAT,
			method: constants.METHOD_STORED,
			extra : constants.EMPTY,
			comment : "",
		}
	}
	
	async read(offset){ // @return (Object) { done : <Boolean> , value : <Uint8Array> }
		let d = this.data
		let value = null;
		switch(d.stage) {
			case "initial" :
				value = this.getLocalHeaders(offset)
				break;
			case "readSource":
				value = await this.readSource(offset);
				break;
			case "final" :
				value = this.getDataDescriptor(offset);
				break;
		}
		return { done : this.data.done, value }
	}
	
	getLocalHeaders(offset) {
		let d = this.data;
		let v = new Uint8Array();
		d.offsets.file = offset;
		// signature
		v = a(v, zipUtil.getLongBytes(constants.SIG_LFH))
		//version to extract 
		v = a(v, zipUtil.getShortBytes(constants.MIN_VERSION_DATA_DESCRIPTOR))
		//general bit flag
		v = a(v, zipUtil.getShortBytes(1<<3))
		// method
		v = a(v, zipUtil.getShortBytes(0));
		// datetime
		v = a(v, zipUtil.getLongBytes(d.time))
		
		d.offsets.data = offset + v.length
		// crc
		v = a(v, new Uint8Array(12))// [constants.LONG_ZERO,constants.LONG_ZERO,constants.LONG_ZERO])
		// lengths and name
		v = a(v, zipUtil.getShortBytes(this.entry.name.length))
		v = a(v, zipUtil.getShortBytes(0)) // comment length
		v = a(v, te.encode(this.entry.name));
		v = a(v, te.encode("")); // comment 
		
		d.offsets.contents = offset + v.length;
		d.stage = "readSource";
		return v;
	}
	
	async readSource(offset){
		let d = this.data;
		if(!d.crcStream) d.crcStream = new Crc32Stream()
		if(!d.reader) d.reader = this.entry.source.pipeThrough(d.crcStream.stream()).getReader()
		let { done, value } = await d.reader.read();
		//console.log({done, value})
		if(!done) return value;
		d.stage = "final";
		d.crc = d.crcStream.getCrc();
		d.size = d.crcStream.length
		d.csize = d.size;
		let {value:v2} = await this.read(offset);
		//console.log({v2})
		return v2;
	}
	
	getDataDescriptor () {
		let v = new Uint8Array();
		// signature
		v = a(v, zipUtil.getLongBytes(constants.SIG_DD));
		// crc32 checksum
		v = a(v, zipUtil.getLongBytes(this.data.crc));
		// sizes 
		v = a(v, zipUtil.getLongBytes(this.data.csize))
		v = a(v, zipUtil.getLongBytes(this.data.size))
		
		this.data.done = true;
		return v;
	}
}

function a (a1,a2) {
	let b = new Uint8Array(a1.length + a2.length);
	b.set(a1)
	b.set(a2, a1.length)
	return b;
	//return Uint8Array.from([...a1, ...a2])
}

const te = new TextEncoder();