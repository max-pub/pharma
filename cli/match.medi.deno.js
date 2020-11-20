import 'https://max.pub/lib/array.js';
import pharma from '../lib/pharma.js';
import {cleanSearchString} from '../lib/more.js';

const cacheFile = '../data/cache.json';
pharma.cache.init(cacheFile)

let stopWords = Deno.readTextFileSync('../data/stop.words.txt').split('\n').map(x => x.trim())

let medis = Deno
	.readTextFileSync('../data/medis.tsv')
	.split('\n')
	.map(x => x
		.trim()
		.split('\t')
		.slice(-1)[0]

	)


console.log(medis)

let i = 0;
let found = 0;
for (let medi of medis) {
	medi = cleanSearchString(medi).filter(x => !stopWords.includes(x))
	console.log(medi)
	var P = 0;
	for (let med of medi) {
		P = pharma.cache.findName(med)
		// console.log('search', med, 'found', P ? 1 : 0);
		if(P) break;
		// console.log(x ? 1 : 0)
	}
	if(P) found ++
	console.log('\tfound', P ? Object.keys(P.title) : 0);
	// break
	// let data = await pharma.query(medi)
	// // console.log(medi, JSON.stringify(data))
	// // break;
	// if (++i % 10 == 0) Deno.writeTextFileSync(cacheFile, JSON.stringify(pharma.cache.data, null, '\t'))
	if (++i % 100 == 0) break;
}
console.log(found,i)
// console.log(pharma.cache.data)