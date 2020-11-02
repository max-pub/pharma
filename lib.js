
import wiki from 'https://max.pub/lib/wiki.js';
import 'https://max.pub/lib/array.js';
// import 'https://max.pub/lib/string.js';

import parseWikiPage from './wiki.js';


export let DATA = {};
export let QUERIES = {};

let languages = ['de', 'en'];


export async function getPagesFromCategory(language, categoryName) {
	let names = []
	let gcmcontinue;
	// let result;
	do {
		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=info&generator=categorymembers&gcmtitle=Kategorie:${categoryName}&gcmlimit=max${gcmcontinue ? `&gcmcontinue=${gcmcontinue}` : ""}`).then(x => x.json());
		// console.log(result);
		// Deno.writeTextFileSync('raw.json', JSON.stringify(result, 0, 4))
		// let loaded = names.concat(Object.keys(result.query.pages).map(pageId => result.query.pages[pageId].title))
		names = [...names, ...Object.values(result.query.pages).map(x => x.title)]
		console.log(`loaded ${names.length} results`)
		// names = loaded
		// break;
		gcmcontinue = result?.continue?.gcmcontinue;
		// gcmcontinue = result.continue ? result.continue.gcmcontinue : null
	} while (gcmcontinue)
	// } while (result.continue && result.continue.gcmcontinue)
	return names;
}

function merge(...data) {
	let output = {};
	for (let result of data) {
		// console.log('multi result', query, result);
		for (let key in result) {
			// console.log('     ', key, result[key]);
			try {
				output[key] = [... new Set([...output[key] ?? [], ...result[key] ?? []])].map(x => x?.trim()).filter(x => x)
			} catch (e) {
				console.log('merge error', e, output[key]);
				output[key] = [];
			}
		}
	}
	return output;
}


function cleanArrays(o) {
	for (let a in o) {
		try {
			o[a] = [...new Set(o[a].map(x => x?.trim()).filter(x => x))]
		} catch { o[a] = []; }
	}
}

export async function loadPharmacon(query) {
	query = query.toLowerCase().trim();
	if (!query) return {};
	if (Math.max(...query.split(' ').map(x => x.length)) < 3) return {}; // biggest substr < 3 ?   return!
	if (QUERIES[query]) return DATA[QUERIES[query]]
	let results = await Promise.all(languages.map(x => loadPharmaconForLanguage(x, query)))
	// let output = merge(...results);
	// output.query = [...output.query ?? [], query];
	// console.log('OUTPUT', output)
	let sameCAS = results.map(x => x?.CAS?.[0]).filter(x => x);
	console.log('\t', query.padEnd(30), 'CAS', sameCAS)
	if (sameCAS.length < languages.length || new Set(sameCAS).size > 1) {
		QUERIES[query] = '';
		return {}
	}
	for (let i in languages) {
		let CAS = results[i]?.CAS?.[0];
		if (!DATA[CAS]) DATA[CAS] = {};
		cleanArrays(results[i])
		DATA[CAS][languages[i]] = results[i];
	}
	// if (output.CAS?.length) {
	// 	DATA[output.CAS[0]] = merge(DATA[output.CAS[0]], output)
	// 	QUERIES[query] = output.CAS[0];
	// } else {
	// 	QUERIES[query] = ''
	// }
	// console.log("STATE", QUERIES, DATA)
	// return output;
}



export async function loadPharmaconForLanguage(language, query) {
	let results = await wiki.search(language, query)
	// console.log('query', query, results);
	let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, 3);
	console.log('\t', query.padEnd(30), language.toUpperCase(), 'search', titles.join('    '))
	// let pages = await Promise.all(titles.map(x => wiki.page(language, x)));
	// console.log('lib.pages', language, pages);
	// for (let i in pages) {
	let i = 0;
	for (let title of titles) {
		i++;
		if (QUERIES[title.toLowerCase()]) return DATA[QUERIES[title.toLowerCase()]]
		// let data = WikiPage[language](pages[i]);
		console.log('\t', query.padEnd(30), language.toUpperCase(), i, title);//, `(${query})`);
		let page = await wiki.page(language, title)
		let data = parseWikiPage(page);
		data.title = [title];
		data.queries = [query.toLowerCase()]
		console.log('\t', query.padEnd(30), language.toUpperCase(), i, title, '-->', data.CAS);//, `(${query})`);
		// console.log("PAGE", language, titles[i], data)
		if (data.CAS?.length) {
			QUERIES[title.toLowerCase()] = data.CAS[0];
			return data;
		}
	}
	return {};
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
