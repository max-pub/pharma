import * as lib from './lib.js';
let t0 = new Date().getTime();

// load unique & non-null query-list
let queryList = [...new Set(Deno.readTextFileSync('./list.txt').split('\n').filter(x => x))];

let data = {}, found = 0, total = 0;
for (let query of queryList) {
	let duration = Math.round((new Date().getTime() - t0) / 1000) + 's';
	console.log('load', ++total, duration, query);
	let result = await lib.loadPharmacon('de', query);
	if (!result?.ATC?.length) continue;
	found++;
	if (!data[result.INN])
		data[result.INN] = result;
	data[result.INN].names.push(query);
}
console.log('found', found, 'of', total, ' queries with', Object.keys(data).length, 'different ingredients');
// use output
let json = JSON.stringify(data, null, '\t')
// console.log(json)
Deno.writeTextFileSync('./output.json', json);
