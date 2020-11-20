
import wiki from 'https://max.pub/lib/wiki.js';
import merge from 'https://max.pub/lib/merge.js';
import { intersection, cartesian } from 'https://max.pub/lib/array.js';

import regex from './regex.js';
import CACHE from './cache.js';




function mergeLanguages(...a) {
	return merge(...a, merge.SORT, merge.UNIQUE,)
}
function addLanguage(input, lang) {
	let output = {};
	for (let key in input) {
		output[key] = {}
		for (let val of input[key]) {
			output[key][val] = [lang];
		}
	}
	return output
}




export default new class {
	cache = CACHE;
	//  languages = ['de', 'en', 'es'];
	languages = ['de', 'en'];

	async find(query) {
		let P = this.cache.findName(query);
		if (P) return P
		for (let lang of this.languages) {
			P = await this.multiLanguageTitle(query, lang)
			// console.log('PP',P)
			if (P) return P;
		}

		// console.log('search', query, 'found', P ? 1 : 0);
		return await this.multiLanguageQuery(query)
	}
	async findAndCache(query) {
		let P = await this.find(query)
		if (P) {
			this.cache.add(P);
			return P;
		}
		return false;
	}

	// async title(query, language) {
	// 	if (language) return this.singleLanguageTitle(query, language)
	// 	else return this.multiLanguageTitle(query);
	// }

	async multiLanguageTitle(title, language) {
		let titles = await wiki.languages(language, title);
		console.log('find languages', language, title, titles?.length)
		// console.log('tit', language, titles)
		if (Object.keys(titles).length == 0) return false;
		// console.log('load multi now')
		titles[language] = title;
		// titles = this.languages.map(lang => titles[lang]).filter(x => x);
		if (this.languages.map(lang => titles[lang]).filter(x => x).length < this.languages.length) return false;
		// console.log('titles', titles)
		let pages = await Promise.all(this.languages.map(lang => this.singleLanguageTitle(titles[lang], lang)))
		// console.log('pages', pages);
		return mergeLanguages(...pages);
	}

	async singleLanguageTitle(title, language) {
		console.log('title', title, language)
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
		// CACHE.add(data);
		return data;
	}

	async loadPageFromNetwork(title, language) {
		console.log('pharma.load from network: ', title, language.toUpperCase())
		let page = await wiki.page(language, title)
		let data = regex(page);
		if (!data.CAS?.length) return {};
		// console.log("NET", data)
		data = addLanguage(data, language);
		data.title = { [title.toLowerCase()]: [language] }
		// console.log("+LANG", data)
		// if (!data.title) data.title = {};
		// data.title[language] = title.toLowerCase();
		return data;
	}

	async query(query, language) {
		if (language) return this.singleLanguageQuery(query, language)
		else return this.multiLanguageQuery(query);
	}


	async multiLanguageQuery(query) {
		query = query.toLowerCase().trim();
		if (!query) return false;
		// if (Math.max(...query.split(' ').map(x => x.length)) < 3) return {}; // biggest substr < 3 ?   return!

		let P = CACHE.find({ title: [query], query: [query] })
		if (P) { // title is already in cache
			console.log('pharma.query from cache:   ', query)
			return P;
		}
		let score = o => Math.max(...Object.values(o?.CAS || []).map(x => x.length || 0));

		// each language-query returns array of 3 best results
		let results = await Promise.all(this.languages.map(x => this.singleLanguageQuery(query, x)))
		console.log('results', results.map(x => x.length))
		// results.map(x => console.log('len', x[0].title[0][1], x.length))
		// console.log('results', JSON.stringify(cartesian(...results),0,4))
		let list = cartesian(...results)
			.map(combination => mergeLanguages(...combination))
			.sort((a, b) => score(b) - score(a))
		// .sort((a, b) => Object.values(b.CAS).length - Object.values(a.CAS).length)
		// .sort((a, b) => Object.keys(b.overlap).length - Object.keys(a.overlap).length)

		// console.log('list', list.length, list[0]);

		if (score(list[0]) == this.languages.length)
			return list[0];
		// return CACHE.add(list[0])
		return false
		// return list[0];
	}



	async singleLanguageQuery(query, language, count = 3) {
		let results = await wiki.search(language, query)
		// console.log('query', query, results);
		let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, count); // filter out results with little content
		console.log('pharma.singleLanguageQuery: ', query, language.toUpperCase(), '->', titles.join('    '))

		results = await Promise.all(titles.map(x => this.loadPageFromNetwork(x, language)))
		results.map(x => x.query = [query])
		// console.log(language, results)
		// return results.filter(x => x.CAS?.length)
		return results.filter(x => x.CAS)
	}


}







