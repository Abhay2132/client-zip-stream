const log = console.log;

self.addEventListener("activate", (e) => {
	e.waitUntil(clients.claim(), skipWaiting());
});

self.addEventListener("fetch", (e) => {
	let {url,method} = e.request;
	if(url.endsWith("ww.js")) return;
	let path = url.slice(self.origin.length);
	if(method.toLowerCase() == "post") return;
	
	e.respondWith(caches.match(url)
	.then(res => {
		if(res) return res;
		console.log({url})
		return fetch(url)
		.then(res => {
			let clone = res.clone()
			return caches.open('runtime')
			.then(cache => cache.put(e.request, clone))
			.then(() => res)
		})
	})

);
});
