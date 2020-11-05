// import { getPagesFromCategory } from './lib.js'

import wiki from 'https://max.pub/lib/wiki.js';

async function loadAndSave(language, title) {
	let list = await wiki.category(language, title)//.then(data=> console.log(JSON.stringify(data, null, 4)))
	try { Deno.mkdirSync('data') } catch { }
	Deno.writeTextFileSync(`data/list.${language}.txt`, list.sort().join('\n'))
}

// await loadAndSave('de', 'Arzneistoff')
// await loadAndSave('en', 'Drugs')
// await loadAndSave('en', 'World_Health_Organization_essential_medicines')
await loadAndSave('en', 'Redirects_from_trade_names_of_drugs')
