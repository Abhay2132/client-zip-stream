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
	//dl(new Blob(Array((10e5)*5)), "file.txt")
})();

$('input[name="input_file"]').addEventListener("change", e => {
	let it = performance.now()
	stdout("<hr>")
	let zip = new Archiver(), i = 1;
	for(let file of e.target.files) 
		zip.entry(file.stream(), file.name, ()=> stdout("Entry"+ i++ +"<br>"))
	zip.finish()
	return zip.dl();
	let data = []
	pump(zip.stream(), (v) => {
		data.push(v)
	}, () =>{
		dl(new Blob(data));
		stdout("done in "+parseInt(performance.now() - it)+" ms"+"<br> size : " + (zip.offset/(1024*1024)).toFixed(2) + " mb<br>" )
	})
})

function pump(rs, ondata, ondone) {
	let r = rs instanceof ReadableStream ? rs.getReader() : rs;
	return _pump(r);
	function _pump(rdr){
		rdr.read()
		.then(({done, value}) => {
			if(done) return ondone && ondone();
			ondata && ondata(value)
			_pump(rdr);
		})
	}
}

function dl (blob, name) {
	let a = $("#dl")
	let href = URL.createObjectURL(blob)
	a.href = href;
	a.download = name || Math.random().toString(36).slice(2)+".zip"
	a.click()
	setTimeout(() => URL.revokeObjectURL(href),1000);
}
