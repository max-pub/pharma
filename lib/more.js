const companies = ['hexal', 'ratiopharm']

export function cleanSearchString(s) {
	return s.replace(/\(.*?\)/g, '')
		.replace(/\[.*?\]/g, '')
		.replace(/[^a-zäöüß]/gmi, " ")
		.trim()
		.toLowerCase()
		.split(' ')
		.filter(y => y.length > 3)
		.filter(x => !companies.includes(x))
	// for (let co in companies)
	// 	s = s.remove(co)
	// return s;
}

export function cartesian(...a) {
	a = a.filter(x => x.length)
	// console.log(a)
	if (a.length <= 1) return (a[0] ?? []).map(x => [x])
	return a.filter(x => x.length).reduce((acc, val) => acc.flatMap(d => val.map(e => [d, e].flat())));
}




// function overlap(...pages) {
// 	let output = {};
// 	for (let key of ['CAS', 'ATC', 'formula', 'PubChem', 'UNII', 'KEGG']) {
// 		let list = intersection(...pages.map(x => x[key] ?? []));
// 		// output[key] = pages.filter(x=>x[key].includes).length;
// 		if (list.length) {
// 			output[key] = {};
// 			for (let val of list)
// 				output[key][val] = pages.filter(x => x[key].includes(val)).map(x => Object.keys(x.title)[0])
// 		}
// 		// if (list.length) output.push(key)
// 		// score += list.length ? 1 : 0;
// 		// console.log('pharma', key, 'intersection', list)
// 	}
// 	return output;
// }