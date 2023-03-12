import Archiver from "./archive-stream.js";
const log = console.log;
const $ = q => document.querySelector(q);
const stdout = str => {
	let el = $("#stdout")
el.innerHTML += str.toString()
el.scrollTop = el.scrollHeight;
}
const td = new TextDecoder();
const te = new TextEncoder();

(async function (){
	
	//pump(zip.stream());
})();

$('input[name="input_file"]').addEventListener("change", e => {
	let zip = new Archiver();
	for(let file of e.target.files)
		zip.entry(file.stream(), {name: file.name}, ()=>log("I am Done"))
	zip.finish()
	//.dl()
	pump(zip.stream())
})

function pump(rs) {
	let r = rs instanceof ReadableStream ? rs.getReader() : rs;
	return _pump(r);
	function _pump(rdr){
		rdr.read()
		.then(({done, value}) => {
			if(done) return;
			stdout(td.decode(value))
			//log(typeof value,value)
			_pump(rdr);
		})
	}
}
