// Simplest Implementation of Node Event Module

export default class Event {
	contructor(){
		this.e = {}
	}
	on(name, cb) {
		if(typeof cb !== "function") return new Error("Given listener is not a function ");
		if(!this.e[name]) this.e[name] = []
		this.e[name].push(cb)
	}
	emit (name) {
		if(!this.e[name]) return
		for(let cb of this.e[name]) cb();
	}
}