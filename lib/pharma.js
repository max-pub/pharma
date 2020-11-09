
import wiki from 'https://max.pub/lib/wiki.js';
import 'https://max.pub/lib/array.js';
// import 'https://max.pub/lib/string.js';

import parseWikiPage from './regex.js';
import { intersection } from 'https://max.pub/lib/array.js';
// import 'https://max.pub/lib/string.js';

import CACHE, { merge } from './cache.js';


let languages = ['de', 'en'];

export default new class {
	async title(title, language) {
		let P = CACHE.find({ title: [title] })
		if (P) { // title is already in cache
			console.log('pharma.load from cache:   ', title)
			return P;
		}
		let data = this.title(title, language); ƒ
		CACHE.add(data);
		return data;
	}

	async loadFromNetwork(title, language) {
		console.log('pharma.load from network: ', title, language.toUpperCase())
		let page = await wiki.page(language, title)
		let data = parseWikiPage(page);
		if (!data.CAS?.length) return {};
		data.title = [[title,language]];
		// data.language = [language]
		return data;
	}

	async query(query, language) {
		if (language) return this.singleLanguageQuery(query, language)
		else return this.multiLanguageQuery(query);
	}


	async multiLanguageQuery(query) {
		query = query.toLowerCase().trim();
		if (!query) return {};
		if (Math.max(...query.split(' ').map(x => x.length)) < 3) return {}; // biggest substr < 3 ?   return!

		let P = CACHE.find({ title: [query], query: [query] })
		if (P) { // title is already in cache
			console.log('pharma.query from cache:   ', query)
			return P;
		}

		let results = await Promise.all(languages.map(x => this.singleLanguageQuery(query, x)))

		// cross-check all results for best match
		let list = [];
		for (let [i1, r1] of results.flat().entries()) {
			for (let [i2, r2] of results.flat().entries()) {
				if (i2 < i1) continue;
				if (r1 == r2) continue;
				let overlap = this.overlap(r1, r2);
				let tmp = merge(r1, r2)
				tmp.overlap = overlap;
				list.push(tmp);
			}
		}
		list = list.sort((a, b) => b.overlap.length - a.overlap.length)
		console.log('list', list[0]);
		if (list[0]?.overlap?.length)
			CACHE.add(list[0])

		return list[0];
		// let score = this.matchingScore(...results);
		// console.log("pharma.score", score);

		// for (let result of results)
		// 	CACHE.add(result)
		// return results
	}



	async singleLanguageQuery(query, language) {
		let results = await wiki.search(language, query)
		// console.log('query', query, results);
		let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, 3); // filter out results with little content
		console.log('pharma.singleLanguageQuery: ', query, language.toUpperCase(), '->', titles.join('    '))

		results = await Promise.all(titles.map(x => this.loadFromNetwork(x, language)))
		results.map(x => x.query = [query])
		return results.filter(x => x.CAS?.length)
		// for (let title of titles) {
		// 	let P = await this.load(title, language);
		// 	if (P.CAS.length) return P;
		// }
		// return {};
	}


	overlap(...pages) {
		let overlap = [];
		for (let key of ['CAS', 'ATC', 'formula', 'PubChem', 'UNII', 'KEGG']) {
			let list = intersection(...pages.map(x => x[key] ?? []));
			if (list.length) overlap.push(key)
			// score += list.length ? 1 : 0;
			// console.log('pharma', key, 'intersection', list)
		}
		return overlap;
	}
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


// export async function getPagesFromCategory(language, categoryName) {
// 	let names = []
// 	let gcmcontinue;
// 	// let result;
// 	do {
// 		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=info&generator=categorymembers&gcmtitle=Kategorie:${categoryName}&gcmlimit=max${gcmcontinue ? `&gcmcontinue=${gcmcontinue}` : ""}`).then(x => x.json());
// 		// console.log(result);
// 		// Deno.writeTextFileSync('raw.json', JSON.stringify(result, 0, 4))
// 		// let loaded = names.concat(Object.keys(result.query.pages).map(pageId => result.query.pages[pageId].title))
// 		names = [...names, ...Object.values(result.query.pages).map(x => x.title)]
// 		console.log(`loaded ${names.length} results`)
// 		// names = loaded
// 		// break;
// 		gcmcontinue = result?.continue?.gcmcontinue;
// 		// gcmcontinue = result.continue ? result.continue.gcmcontinue : null
// 	} while (gcmcontinue)
// 	// } while (result.continue && result.continue.gcmcontinue)
// 	return names;
// }





// function intersection(...arrays) {
// 	let output = [];
// 	for (let a1 of arrays)
// 		for (let a2 of arrays)
// 			output = [...output, a1.filter(x => a2.includes(x))]

// 	return [...new Set(output)]
// }