export class wiki {
	static async search(language, query) {
		console.log('search', language, query)
		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`).then(x => x.json());
		console.log('search result', result)
		return result.query.search;
	}
	static async page(language, title) {
		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=parse&prop=wikitext&page=${title}&format=json&origin=*`).then(x => x.json())
		return result.parse.wikitext['*'];
	}
}
// https://de.wikipedia.org/w/api.php?action=query&list=search&srsearch=aspirin&format=json&origin=*
// alle medikamente
// https://de.wikipedia.org/wiki/Kategorie:Arzneistoff
// https://imigitlab.uni-muenster.de/MeDIC/etl/wikipedia-medication-extractor/-/blob/master/test_data/medi.txt

let DATA = {};

let languages = ['de', 'en'];

export async function loadPharmaconPlus(query) {
	let results = await Promise.all(languages.map(x => loadPharmacon(x, query)))
	let output = {};
	for (let result of results) {
		console.log('multi result', query, result);
		for (let key in result) {
			console.log('     ', key, result[key]);
			output[key] = [... new Set([...output[key] ?? [], ...result[key] ?? []])].map(x => x.trim()).filter(x => x)
		}
	}
	console.log('OUTPUT', output)
	return output;
}
export async function loadPharmacon(language, query) {
	let results = await wiki.search(language, query)
	// console.log('query', query, results);
	let titles = results.filter(x => x.wordcount > 99).map(x => x.title).slice(0, 3);
	console.log('lib.search', language.toUpperCase(), query, titles)
	let pages = await Promise.all(titles.map(x => wiki.page(language, x)));
	// console.log('lib.pages', language, pages);
	for (let i in pages) {
		// let data = WikiPage[language](pages[i]);
		let data = parseWikiPage(pages[i]);
		data.names = [titles[i].toLowerCase(), query.toLowerCase()]
		// console.log("PAGE", language, titles[i], data)
		if (data.ATC?.length) return data;
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

/// parse a Wikipedia entry
function find(string, regex) {
	// console.log('find', regex, regex.exec(string))
	// return string.match(regex) ?? [];
	var matches, result = [];
	while ((matches = regex.exec(string)) != null) {
		// console.log(matches)
		result.push(matches[1]);
	}
	return result;
	// RegExp(re, caseSensitive: false, multiLine: false)
	// 	.allMatches(this.text)
	// 	.map((e) => e.group(1))
	// 	.where((element) => element != "")
	// 	.toSet();
}

function findKey(text, key) {
	return find(text, new RegExp(`${key}\\s+?=\\s+(.*)`, 'gm'));
}

function findKeyMultiLine(text, key) {
	return find(text, new RegExp(`${key}\\s+?=\\s+([\\s\\S]*?(?=\\|))`, 'gm'));
}


function parseWikiPage(text) {
	for (let boxName in WikiPage) {
		// console.log('boxname', boxName)
		let x = find(text, new RegExp(`{{(${boxName})`, 'g'));
		// console.log('boxname', boxName, x)
		if (x.length) return WikiPage[boxName](text);
	}
	return {};
}
const WikiPage = {
	'Infobox Chemikalie': text => ({
		INN: findKey(text, 'Freiname').map(x=>x.toLowerCase()),//.join('').trim().toLowerCase(),
		// names: [],
		ATC: find(text, /{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, '')),
		CAS: findKey(text, 'CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		formula: findKey(text, 'Suchfunktion').map(x => x.trim()),
		group: findKeyMultiLine(text, 'Wirkstoffgruppe').join(' ').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()).map(x=>x.split('|').slice(-1)[0]),
	})
	,
	'Infobox drug': text => ({
		// INN: findKey(text, 'Freiname').join('').trim().toLowerCase(),
		// names: [],
		ATC: [findKey(text, 'ATC_prefix')?.[0] + findKey(text, 'ATC_suffix')?.[0], ...find(text, /{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, ''))],
		UNII: findKey(text, 'UNII'),
		DrugBank: findKey(text, 'DrugBank'),
		KEGG: findKey(text, 'KEGG'),
		PubChem: findKey(text, 'PubChem'),
		CAS: findKey(text, 'CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		formula: findKey(text, 'chemical_formula').map(x => x.replace(/[|=\s]/g, '')),
		group: findKey(text, 'Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
	})
	,
	'Drugbox': text => ({
		tradeNames: findKey(text, 'tradename')?.[0]?.split(',')?.map(x => x.trim().toLowerCase()),
		// names: [],
		ATC: [findKey(text, 'ATC_prefix')?.[0] + findKey(text, 'ATC_suffix')?.[0], ...find(text, /{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, ''))],
		UNII: findKey(text, 'UNII'),
		DrugBank: findKey(text, 'DrugBank'),
		KEGG: findKey(text, 'KEGG'),
		PubChem: findKey(text, 'PubChem'),
		CAS: findKey(text, 'CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		formula: findKey(text, 'chemical_formula').map(x => x.replace(/[|=\s]/g, '')),
		group: findKey(text, 'Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
	})

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


