export default new class {
	data = [];

	init(o) {
		this.data = o;
	}
	get size() {
		return this.data.length;
	}

	add(o) {
		let P = this.find({ CAS: o.CAS })
		let index = this.data.indexOf(P);
		// console.log('index', index)
		let output = merge(P || {}, o);
		if (index > -1) this.data[index] = output;
		else this.data.push(output);

		return output
	}

	find(o) {
		for (let P of this.data)
			for (let key in o)
				for (let val of o[key] || [])
					if (P[key]?.includes(val))
						return P
	}
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