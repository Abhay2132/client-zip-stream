import CS from "./crc32-stream.js";

const log = console.log
const $ = q => document.querySelector(q);
const wait = n => new Promise(a => setTimeout(a, n || 0));

fetch("./tmp/file.tmp")
.then(res => res.body)
.then( async s => {
	let cs = new CS();
		//let s = file.stream()
	let stream = s.pipeThrough(cs.stream())
	let reader = stream.getReader()
		
	while(1){
		let {done, value} = await reader.read();
		if(done) break
			//log(value)
	}
	log({crc : cs.getCrc(true) })
		
})


