export default new class {
	data = [];

	init(data) {
		if (typeof data == 'string') {
			try { this.data = JSON.parse(Deno.readTextFileSync(data)) } catch (e) { console.log('cache doesnt exist yet') }
			console.log('cache size', this.data.length)
		}
		if (Array.isArray(data))
			this.data = data
	}
	get size() {
		return this.data.length;
	}

	add(o) {
		if (!o.CAS) return;
		let P = this.find({ CAS: Object.keys(o.CAS) })
		let index = this.data.indexOf(P);
		// console.log('index', index, o)
		let output = merge(P || {}, o);
		if (index > -1) this.data[index] = output;
		else this.data.push(output);

		return output
	}
	findName(q) {
		return this.find({ title: [q], query: [q], INN: [q], tradeNames:[q] })
	}
	find(o) {
		// console.log('find', o, 'in cache')
		for (let P of this.data)
			for (let key in o)
				for (let search of o[key] || []) {
					let values = P[key] ?? [];
					if(!Array.isArray(values)) values = Object.keys(values);
					// let values = Array.isArray(P[key]) ? P[key] : Object.keys(P[key]);
					// console.log(values, search)
					// for (let value of values)
					if (values?.includes(search))
						return P
				}
	}
	// find(o) {
	// 	for (let P of this.data)
	// 		for (let key in o)
	// 			for (let val of o[key] || [])
	// 				if (Object.values(P[key])?.includes(val))
	// 					return P
	// }
}




export function merge(...data) {
	let output = {};
	for (let result of data) {
		// console.log('multi result', query, result);
		for (let key in result) {
			// console.log('     ', key, result[key]);
			try {
				output[key] = [... new Set([...output[key] ?? [], ...result[key] ?? []])].map(x => x?.trim()).filter(x => x)
			} catch (e) {
				// console.log('merge error', e, output[key]);
				output[key] = result[key];
			}
		}
	}
	return output;
}