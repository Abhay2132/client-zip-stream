import Entry from "./archive-entry.js"
import constants from "./constants.js";
import zipUtil from "./zipUtliz.js";
const wait = n =>  new Promise(a => setTimeout(a,n||0))

export default class C {
	#c;
	#rs;
	constructor(name){
		let me = this;
		this.#rs = new ReadableStream({start(c){ me.#c = c }, pull : this.pull.bind(this)})
		this.size = 0;
		this.entries = [];
		this.offset =0;
		this.name = name || Math.random().toString(36).slice(2)+".zip" 
		this._archive = {
			active : false,
			finish : false,
			finished : false,
			index : 0,
			centralLength:0,
			centralOffset:0
		}
	}
	
	stream(){
		return this.#rs
	}
	
	async pull(c){
		let {active, index, finish} = this._archive
		if(!active) return finish && this._finish();
		await wait(0);
		let ae = this.entries[index];
		let {done, value} = await ae.read(this.offset)
		if(done) return this.nextEntry(ae.cb(null, this))
		
		this.write(value);
	}
	
	entry(source, name, cb){
		if(this._archive.finish) return cb(new Error("Cannot add 'Entry' after calling 'finish()' method !"))
		let entry = new Entry(source, name, cb);
		this.entries.push(entry);
		
		if(!this._archive.active) {
			this._archive.active = true;
			this._archive.index = this.entries.length - 1;
			this.pull(this.#c);
		}
		
		return this;
	}
	
	async _finish(){
		this._archive.centralOffset = this.offset;
		this.entries.forEach((entry) => this._writeCentralFileHeader(entry))
		this._archive.centralLength = this.offset - this._archive.centralOffset;
		
		this._writeCentralDirectoryEnd();
		this.#c.close();
		this._archive.finished = true;
	}
	
	finish(cb){
		this._archive.finish = true;
		if(!this._archive.active) this._finish();
		return this;
	}
	
	nextEntry(){
		let a = this._archive;
		a.index += 1;
		if(a.index === this.entries.length) {
			a.active = false;
			//if(a.finish) return this._finish();
		}
		this.pull(this.#c);
	}
	
	_writeCentralFileHeader(ae) {
		//signature;
		this.write(zipUtil.getLongBytes(constants.SIG_CFH));
		// version made by
		this.write(zipUtil.getShortBytes((ae.data.platform << 8) | constants.VERSION_MADEBY))
		// version to extract 
		this.write(zipUtil.getShortBytes(constants.MIN_VERSION_DATA_DESCRIPTOR))
		//general bit flag
		this.write(zipUtil.getShortBytes(1<<3))
		// method
		this.write(zipUtil.getShortBytes(ae.data.method))
		// datetims
		this.write(zipUtil.getLongBytes(ae.data.time));
		//crc checksum
		this.write(zipUtil.getLongBytes(ae.data.crc))
		// sizes 
		this.write(zipUtil.getLongBytes(ae.data.csize));
		this.write(zipUtil.getLongBytes(ae.data.size))
		// name length
		this.write(zipUtil.getShortBytes(ae.entry.name.length));
		// extra length
		this.write(zipUtil.getShortBytes(ae.data.extra.length));
		// comments length
		this.write(zipUtil.getShortBytes(ae.data.comment.length));
		// disk number start
		this.write(constants.SHORT_ZERO);
		// internal attributes
		this.write(zipUtil.getShortBytes(0));
		// external attributes
		this.write(zipUtil.getLongBytes(0));
		// relative offset of LFH
		if (ae.data.offsets.file > constants.ZIP64_MAGIC) {
			this.write(zipUtil.getLongBytes(constants.ZIP64_MAGIC));
		} else {
			this.write(zipUtil.getLongBytes(ae.data.offsets.file));
		}
		// name
		this.write(te.encode(ae.entry.name));
		// extra
		this.write(te.encode(ae.data.extra));
		// comment
		this.write(te.encode(ae.data.comment));
	}
	
	_writeCentralDirectoryEnd() {
		//signature 
		this.write(zipUtil.getLongBytes(constants.SIG_EOCD))
		// disk numbers
		this.write(constants.SHORT_ZERO);
		this.write(constants.SHORT_ZERO);
		// number of entries
		this.write(zipUtil.getShortBytes(this.entries.length));
		this.write(zipUtil.getShortBytes(this.entries.length));
		// length and location of CD
		this.write(zipUtil.getLongBytes( this._archive.centralLength));
		this.write(zipUtil.getLongBytes(this._archive.centralOffset));
		// archive comment
		this.write(zipUtil.getShortBytes(0));
		this.write(te.encode(""));
	}
	
	write(d){
		this.offset += d.length;
		this.#c.enqueue(d);
	}
	
	response (){
		return new Response(this.stream(), {
			status: 200,
			"headers" : {
				"Content-Type" : "application/zip",
				"Content-Disposition" : "attachment ; filename="+this.name
			}
		})
	}
	
	dl (name=this.name) {
		this.response()
		.blob()
		.then( blob => {
			let a = document.createElement("a");
			a.style.display = "none";
			a.download = name;
			let href = URL.createObjectURL(blob)
			a.href = href
			document.body.appendChild(a)
			a.click()
			setTimeout(() => URL.revokeObjectURL(href),1000);
		})
	}
	
	static textStream (str) {
		return new ReadableStream({
			start(c){ c.enqueue(te.encode(str)); c.close(); }
		});
	}
}

const te = new TextEncoder();