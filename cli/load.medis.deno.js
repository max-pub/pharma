import 'https://max.pub/lib/array.js';
import pharma from '../lib/pharma.js';
const cacheFile = '../data/cache.json';
pharma.cache.init(cacheFile)


let medis = Deno
	.readTextFileSync('../data/medis.tsv')
	.split('\n')
	.map(x => x
		.trim()
		.split('\t')
		.slice(-1)[0]
		.replace(/\(.*?\)/g, '')
		.replace(/\[.*?\]/g, '')
		.replace(/[^a-zäöüß]/gmi, " ")
		.replace(/\s\s+/g, ' ')
		.trim()
		.toLowerCase()
		.split(' ')
		.filter(y => y.length > 3)
	).slice(0, 100)
	.flat().unique()

console.log(medis)

let i = 0;
for (let medi of medis) {
	console.log(i, medis.length, medi)
	let data = await pharma.findAndCache(medi)
	// console.log(medi, JSON.stringify(data))
	// break;
	if (++i % 10 == 0) Deno.writeTextFileSync(cacheFile, JSON.stringify(pharma.cache.data, null, '\t'))
	// if (i % 100 == 0) break;
}
console.log(pharma.cache.data)