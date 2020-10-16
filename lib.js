
import wiki from 'https://max.pub/lib/wiki.js';
import parseWikiPage from './wiki.js';

export let DATA = {};
export let QUERIES = {};

let languages = ['de', 'en'];




function merge(...data) {
	let output = {};
	for (let result of data) {
		// console.log('multi result', query, result);
		for (let key in result) {
			// console.log('     ', key, result[key]);
			output[key] = [... new Set([...output[key] ?? [], ...result[key] ?? []])].map(x => x.trim()).filter(x => x)
		}
	}
	return output;
}
// export async function loadPharmaconInBatches(...queries) {
// 	return await Promise.all(queries);
// }
export async function loadPharmacon(query) {
	if (QUERIES[query.toLowerCase()]) return DATA[QUERIES[query.toLowerCase()]]
	let results = await Promise.all(languages.map(x => loadPharmaconForLanguage(x, query)))
	let output = merge(...results);
	// output.query = [...output.query ?? [], query];
	console.log('OUTPUT', output)
	DATA[output.CAS[0]] = merge(DATA[output.CAS[0]], output)
	QUERIES[query] = output.CAS[0];
	return output;
}
export async function loadPharmaconForLanguage(language, query) {
	let results = await wiki.search(language, query)
	// console.log('query', query, results);
	let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, 5);
	console.log('lib.search', language.toUpperCase(), query, titles)
	// let pages = await Promise.all(titles.map(x => wiki.page(language, x)));
	// console.log('lib.pages', language, pages);
	// for (let i in pages) {
	let i = 0;
	for (let title of titles) {
		if(QUERIES[title.toLowerCase()]) return DATA[QUERIES[title.toLowerCase()]]
		// let data = WikiPage[language](pages[i]);
		console.log(language.toUpperCase(), ++i, title);
		let page = await wiki.page(language, title)
		let data = parseWikiPage(page);
		data.title = [title];
		data.names = [title.toLowerCase(), query.toLowerCase()]
		// console.log("PAGE", language, titles[i], data)
		if (data.CAS?.length) {
			QUERIES[title.toLowerCase()] = data.CAS[0];
			return data;
		}
		// console.log('lib.data', data);
	}
	// let titles = results.filter(x => x.wordcount > 99).map(x => x.title);
	// console.log('query', query, titles);
	// if (!titles.length) return {};
	// let content = await wiki.page(language, title)
	// console.log('page', content)
	// let data = WikiPage.de(content)
	// data.INN = title.toLowerCase();
	// return data;
}





// 	// Set<String> get drugBank => find(r"DrugBank.*?=(.*)")
// 	//     .map((e) => e.replaceAll(RegExp(r'[^0-9\-]'), '').trim())
// 	//     .where((element) => element != "")
// 	//     .toSet();

// 	Set<String> get group =>
// 		findKey('Wirkstoffgruppe')
// 			.map((e) => e.replaceAll(RegExp(r'[\[\]]'), '').trim())
// 			.toSet() ??
// 		findKey("Wirkstoffklasse")
// 			.map((e) => e.replaceAll(RegExp(r'[\[\]]'), '').trim())
// 			.toSet();



// export class wiki {
// 	static async search(language, query) {
// 		console.log('search', language, query)
// 		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`).then(x => x.json());
// 		console.log('search result', result)
// 		return result.query.search;
// 	}
// 	static async page(language, title) {
// 		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=parse&prop=wikitext&page=${title}&format=json&origin=*`).then(x => x.json())
// 		return result.parse.wikitext['*'];
// 	}
// }
// https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=aspirin&format=json&origin=*
// alle medikamente
// https://de.wikipedia.org/wiki/Kategorie:Arzneistoff
// https://imigitlab.uni-muenster.de/MeDIC/etl/wikipedia-medication-extractor/-/blob/master/test_data/medi.txt
