import wiki from 'https://max.pub/lib/wiki.js';

const DATA_DIR = '../data/';
try { Deno.mkdirSync(DATA_DIR) } catch { }


async function loadAndSave(language, title) {
	let list = await wiki.category(language, title)//.then(data=> console.log(JSON.stringify(data, null, 4)))
	
	Deno.writeTextFileSync(DATA_DIR + `/list.${language}.txt`, list.sort().join('\n'))
}

// await loadAndSave('de', 'Arzneistoff')
// await loadAndSave('en', 'Drugs')
// await loadAndSave('en', 'World_Health_Organization_essential_medicines')
await loadAndSave('en', 'Redirects_from_trade_names_of_drugs')
