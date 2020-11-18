
import wiki from 'https://max.pub/lib/wiki.js';
import merge from 'https://max.pub/lib/merge.js';
import { intersection, cartesian } from 'https://max.pub/lib/array.js';

import parseWikiPage from './regex.js';
import CACHE from './cache.js';




function overlap(...pages) {
	let output = {};
	for (let key of ['CAS', 'ATC', 'formula', 'PubChem', 'UNII', 'KEGG']) {
		let list = intersection(...pages.map(x => x[key] ?? []));
		// output[key] = pages.filter(x=>x[key].includes).length;
		if (list.length) {
			output[key] = {};
			for (let val of list)
				output[key][val] = pages.filter(x => x[key].includes(val)).map(x => Object.keys(x.title)[0])
		}
		// if (list.length) output.push(key)
		// score += list.length ? 1 : 0;
		// console.log('pharma', key, 'intersection', list)
	}
	return output;
}
function mergeLanguages(...a) {
	// console.log('mergeLanguages', a);
	let output = merge({ _unique: true }, ...a)
	output.overlap = overlap(...a);
	return output;
}


let languages = ['de', 'en', 'es'];

export default new class {
	async title(query, language) {
		if (language) return this.singleLanguageTitle(query, language)
		else return this.multiLanguageTitle(query);
	}

	async multiLanguageTitle(title, languages = ['de', 'en', 'es']) {
		let titles = await wiki.languages(languages[0], title);
		titles[languages[0]] = title;
		// console.log('titles', titles)
		let pages = await Promise.all(languages.map(lang => this.singleLanguageTitle(titles[lang], lang)))
		// console.log('pages', pages);
		return mergeLanguages(...pages);
	}

	async singleLanguageTitle(title, language) {
		// console.log('title', title, language)
		let P = CACHE.find({ title: [title] })
		if (P) { // title is already in cache
			console.log('pharma.load from cache:   ', title)
			// return P;
		}
		let data = await this.loadPageFromNetwork(title, language);
		// if (options.validate) {
		// 	let languages = await wiki.languages(language, title);
		// 	console.log('languages', languages);
		// 	tmp = [data];
		// 	for (let lang of languages)
		// 		if (lang != languages)
		// 			tmp.push(await )

		// }
		// console.log('data',data)
		CACHE.add(data);
		return data;
	}

	async loadPageFromNetwork(title, language) {
		console.log('pharma.load from network: ', title, language.toUpperCase())
		let page = await wiki.page(language, title)
		let data = parseWikiPage(page);
		if (!data.CAS?.length) return {};
		if (!data.title) data.title = {};
		data.title[language] = title.toLowerCase();
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
		// results.map(x => console.log('len', x[0].title[0][1], x.length))

		let list = cartesian(...results)
			.map(combination => mergeLanguages(...combination))
			.sort((a, b) => Object.keys(b.overlap).length - Object.keys(a.overlap).length)

		console.log('list', list.length, list[0]);
		if (Object.keys(list[0]?.overlap)?.length)
			CACHE.add(list[0])

		return list[0];
	}



	async singleLanguageQuery(query, language, count = 3) {
		let results = await wiki.search(language, query)
		// console.log('query', query, results);
		let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, count); // filter out results with little content
		console.log('pharma.singleLanguageQuery: ', query, language.toUpperCase(), '->', titles.join('    '))

		results = await Promise.all(titles.map(x => this.loadPageFromNetwork(x, language)))
		results.map(x => x.query = [query])
		return results.filter(x => x.CAS?.length)

	}


}







