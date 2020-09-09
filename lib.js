export class wiki {
	static async search(language, query) {
		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`).then(x => x.json());
		// console.log(result)
		return result.query.search;
	}
	static async page(language, title) {
		let result = await fetch(`https://${language}.wikipedia.org/w/api.php?action=parse&prop=wikitext&page=${title}&format=json&origin=*`).then(x => x.json())
		return result.parse.wikitext['*'];
	}
}

export async function loadPharmacon(language, query) {
	let results = await wiki.search(language, query)
	// console.log(query, results);
	let title = results.filter(x => x.wordcount > 99)[0]?.title
	if(!title) return {};
	let content = await wiki.page(language, title )
	// console.log('con', content)
	let data = WikiPage.de(content)
	data.INN = title.toLowerCase();
	return data;
}

/// parse a Wikipedia entry
function find(string, regex) {
	// console.log('find', regex, string.match(regex))
	// return string.match(regex) ?? [];
	var matches, result = [];
	while ((matches = regex.exec(string)) != null)
		result.push(matches[1]);
	return result;
	// RegExp(re, caseSensitive: false, multiLine: false)
	// 	.allMatches(this.text)
	// 	.map((e) => e.group(1))
	// 	.where((element) => element != "")
	// 	.toSet();
}

function findKey(text, key) {
	return find(text, new RegExp(`${key}.*?=(.*)`, 'g'));
}

class WikiPage {

	static de(text) {
		// console.log('frei', findKey(text, 'Freiname'))
		return {
			INN: findKey(text, 'Freiname').join('').trim().toLowerCase(),
			names: [],
			ATC: find(text, /{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, '')),
			CAS: findKey(text, 'CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
			formula: findKey(text, 'Suchfunktion').map(x => x.trim()),
			group: findKey(text, 'Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
		}
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


