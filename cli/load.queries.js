import pharma from '../lib/pharma.js';
import CACHE from '../lib/cache.js';
let t0 = new Date().getTime();

// load unique & non-null query-list
let queryList = [];
if (Deno.args.length) queryList = [...Deno.args];
else queryList = [...new Set(Deno.readTextFileSync('../data/queries.txt').split('\n').filter(x => x))];
// console.log(queryList)

async function loadBatch(size = 1) {
	console.log(queryList.length, 'left');
	// let batch = []
	// if (queryList.length < size) size = queryList.length;
	// for (let i = 0; i < size; i++) {
	// 	// console.log('size',i,size,queryList)
	// 	batch.push(queryList.shift());
	// }
	let batch = queryList.slice(0, size).map(x => queryList.shift())
	// .map(x => x.replace(/[^a-z]/gi, ' ').split('  ')[0])
	// .map(x => x.trim())
	// .filter(x => x)

	console.log('batch', batch)
	let result = await Promise.all(batch.map(x => pharma.query(x)))//.replace(/[^a-z]/gi, ' ')?.trim()?.split(' ')[0])));
	// console.log(result)
	for (let i in batch) {
		// console.log(batch[i], result[i])
		result[i]?.names?.push(batch[i])
	}
	console.log('save batch')
	// Deno.writeTextFileSync('data/output.meta.json', JSON.stringify(lib.QUERIES, null, '\t'));
	Deno.writeTextFileSync('../data/output.queries.json', JSON.stringify(CACHE.data, null, '\t'));
	// Deno.writeTextFileSync('data/output.json', JSON.stringify(Object.values(lib.DATA), null, '\t'));
	if (queryList.length) loadBatch();
}

loadBatch()

// let data = {}, found = 0, total = 0;
// for (let query of queryList) {
// 	let duration = Math.round((new Date().getTime() - t0) / 1000) + 's';
// 	console.log('load', ++total, '/', queryList.length, duration, query);
// 	let result = await lib.loadPharmacon(query);
// 	if (!result?.ATC?.length) continue;
// 	found++;
// 	// if (!data[result.INN])
// 	// 	data[result.INN] = result;
// 	// data[result.INN].names.push(query);

// 	Deno.writeTextFileSync('./output.meta.json', JSON.stringify(lib.QUERIES, null, '\t'));
// 	Deno.writeTextFileSync('./output.json', JSON.stringify(Object.values(lib.DATA), null, '\t'));
// }
// console.log('found', found, 'of', total, ' queries with', Object.keys(data).length, 'different ingredients');
// use output
