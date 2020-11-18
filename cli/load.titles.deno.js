import pharma from '../lib/pharma.js';
import CACHE from '../lib/cache.js';
let t0 = new Date().getTime();
const DATA_DIR = '../data/';

// load unique & non-null query-list
var list = [];
if (Deno.args.length) list = [...Deno.args];
else[...new Set(Deno.readTextFileSync(DATA_DIR + '/list.de.txt').split('\n').filter(x => x))];
// console.log(queryList)

var cache = [];
try { cache = JSON.parse(Deno.readTextFileSync('../data/output.json')) } catch (e) { console.log('no existing cache') }
CACHE.init(cache);

console.log(CACHE.size, 'pharmacons already in cache')

async function loadBatch(size = 10) {
	console.log(list.length, 'left');
	// let batch = []
	// if (queryList.length < size) size = queryList.length;
	// for (let i = 0; i < size; i++) {
	// 	// console.log('size',i,size,queryList)
	// 	batch.push(queryList.shift());
	// }
	let batch = list.slice(0, size).map(x => list.shift())
	// .map(x => x.replace(/[^a-z]/gi, ' ').split('  ')[0])
	// .map(x => x.trim())
	// .filter(x => x)

	// console.log('batch', batch)
	let results = await Promise.all(batch.map(title => pharma.multiLanguageTitle(title)));
	console.log(JSON.stringify(results, 0, 4))
	// for (let result of results) {
	// 	console.log('loop', results)
	// 	// result[i]?.names?.push(batch[i])
	// }
	console.log('save batch')
	// Deno.writeTextFileSync('data/output.meta.json', JSON.stringify(lib.QUERIES, null, '\t'));
	// Deno.writeTextFileSync('data/output.queries.json', Object.entries(lib.QUERIES).filter(x => x[1].trim()).map(x => x[0]).join('\n'));
	Deno.writeTextFileSync('../data/output.json', JSON.stringify(CACHE.data, null, '\t'));

	if (list.length) loadBatch();
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
