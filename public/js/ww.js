(async function (){

console.log("Web Worker Working")
console.time("cached")
const te = new TextEncoder();
let i = 0;
const rs = new ReadableStream({
	start (){},
	pull(c){
		console.log("pull", c.desiredSize)
		return new Promise ( a => 
			setTimeout(() =>{
				if(i++ >= 100) return c.close();
				for(let i=0;i<100;i++)
					c.enqueue(te.encode("Abhay "));
				console.log("enqueue")
				a();
			},0)
		)
	}
})
const nres = new Response(rs, { headers : {
	"Content-Disposition" : "attachment; filename=Abhay.txt"
}});

const cache = await caches.open("test")
await cache.put("/hehe", nres);

postMessage({done : true})
console.timeEnd("cached")
})();