export default function parseWikiPage(text) {
	for (let boxName in WikiPage) {
		// console.log('boxname', boxName)
		let x = text.groups(new RegExp(`{{(${boxName})`, 'gi')).flat();
		// console.log('boxname', boxName, x)
		if (x.length) {
			let data = WikiPage[boxName](text);
			cleanArrays(data);
			cleanData(data)
			return data
		}
	}
	return {};
}

function cleanArrays(o) {
	// console.log('clean', o)
	for (let a in o) {
		try {
			// o[a] = [...new Set(o[a].map(x => x?.trim()).filter(x => x))]
			o[a] = o[a].map(x=>x.clearTags())
			o[a] = o[a].unique().trim().clearEmpty().sort()
		} catch { o[a] = []; } //  o[a] = []; 
		if (o[a].length < 1) delete o[a];
	}
	return o;
}

function cleanData(data) {
	if(data.INN?.length)
		data.INN = data.INN.map(x=> x.replace(/\(.*\)/g,'').trim())
	if(data.group?.length)
		data.group = data.group.map(x=> x.split('|')).flat().map(x=>x.replace(/,/g,'').trim())
	if (data.formula?.length)
		data.formula = data.formula.map(x => x.replace(/([a-z]+)(1)([a-z]+)/gi, '$1$3')) // remove single "1"s   like H7N1O3 -> H7NO3
	if (data.tradeNames?.length) {
		console.log('clean TRADE',data.tradeNames)
		data.tradeNames = data.tradeNames
									.trim()
									.join('|')
									//remove stuff in {{ stuff }} 
									.replace(/(?:{{.*}}|\(.*\))/g,'')
									//remove "other" and "others"
									.replace(/\|other[s]?\|?/,'||')
									.split('|').clearEmpty()
	}
	return data
}

const WikiPage = {
	'Infobox Protein': text => ({
		// INN: text.findKey('Freiname').map(x => x.toLowerCase()),//.join('').trim().toLowerCase(),
		// names: [],
		CAS: text.findKeyMultiLine('CAS').map(x => x.replace(/\*/g, '').trim().split(' ')[0]),
		ATC: text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, '')),
		// CAS: text.findKey('CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		// formula: text.findKey('Suchfunktion').map(x => x.trim()),
		// group: text.findKeyMultiLine('Wirkstoffgruppe').join(' ').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()).map(x => x.split('|').slice(-1)[0]),
		group: text.findKeyMultiLine('Wirkstoffklasse')?.join('\n').split(']]').map(x => x.replace(/[\[\]\*]/g, '')).trim().clearEmpty().unique().sort(),
		tradeNames: text.groups(/([a-z -]*) \(D\)/gmi).flat().trim().clearEmpty().unique().sort(),
	})
	,
	'Infobox Chemikalie': text => ({
		// names: [],
		CAS: text.findKeyMultiLine('CAS').map(x => x.replace(/[^0-9\-]/g, ' ').trim().split(' ')[0].trim()),
		ATC: text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, '')),
		INN: text.findKey('Freiname').map(x => x.toLowerCase()),//.join('').trim().toLowerCase(),
		// CAS: text.findKey('CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		formula: text.findKey('Suchfunktion').map(x => x.trim()),
		// group: text.findKeyMultiLine('Wirkstoffgruppe').join(' ').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()).map(x => x.split('|').slice(-1)[0]),
		group: text.findKeyMultiLine('Wirkstoffgruppe')?.join('\n').split(']]').map(x => x.replace(/[\[\]\*]/g, '')).trim().clearEmpty().unique().sort(),
		tradeNames: text.groups(/([a-z -]*) \(D\)/gmi).flat().trim().clearEmpty().unique().sort(),
	})
	,
	'Infobox drug': text => ({
		// INN: text.findKey( 'Freiname').join('').trim().toLowerCase(),
		// names: [],
		CAS: text.findKey('CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		ATC: [text.findKey('ATC_prefix')?.[0] + text.findKey('ATC_suffix')?.[0], ...text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, ''))],
		UNII: text.findKey('UNII'),
		DrugBank: text.findKey('DrugBank'),
		KEGG: text.findKey('KEGG'),
		PubChem: text.findKey('PubChem'),
		formula: text.findKey('chemical_formula').map(x => x.replace(/[|=\s]/g, '')),
		group: text.findKey('Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
	})
	,
	'Drugbox': text => ({
		// names: [],
		CAS: [...text.findKey('CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()), ...text.findKey('CAS_supplemental').map(x => x.replace(/[^0-9\-]/g, '').trim())],
		ATC: [text.findKey('ATC_prefix')?.[0] + text.findKey('ATC_suffix')?.[0], ...text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, ''))],
		UNII: text.findKey('UNII'),
		DrugBank: text.findKey('DrugBank'),
		KEGG: text.findKey('KEGG'),
		PubChem: text.findKey('PubChem'),
		formula: text.findKey('chemical_formula').map(x => x.replace(/[|=\s]/g, '')),
		tradeNames: text.findKey('tradename')?.[0]?.split(',')?.map(x => x.trim().toLowerCase()),
		group: text.findKey('Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
	})

}

import 'https://max.pub/lib/array.js';
import 'https://max.pub/lib/string.js';

String.prototype.findKey = function (key) {
	return this.groups(new RegExp(`${key}\\s+?=\\s+(.*)`, 'gm')).flat();
}

String.prototype.findKeyMultiLine = function (key) {
	return this.groups(new RegExp(`${key}\\s+?=\\s+([\\s\\S]*?(?=^\\|))`, 'gm'))?.flat()?.join()?.split('\n');
}



String.prototype.clearTags = function () {
	return this.replace(/<.*?>/g,'')
}







// String.prototype.groups = function (regex) {
// 	return Array.from(this.matchAll(regex)).map(i => i.slice(1)).flat();
// }

// Array.prototype.trim = function () {
// 	return this.map(x => x.trim());
// }

// Array.prototype.unique = function () {
// 	return [...new Set(this)];
// }
// Array.prototype.clearEmpty = function () {
// 	return this.filter(x => x);
// }
// Array.prototype.intersection = function (other) {
// 	return this.filter(value => other.includes(value))
// }
// Array.prototype.union = function (other) {
// 	return [...this, ...other]
// }


// String.prototype.find = function (regex) {
// 	// console.log('find', regex, regex.exec(string))
// 	// return string.match(regex) ?? [];
// 	var matches, result = [];
// 	while ((matches = regex.exec(this)) != null) {
// 		// console.log(matches)
// 		result.push(matches[1]);
// 	}
// 	return result;
// 	// RegExp(re, caseSensitive: false, multiLine: false)
// 	// 	.allMatches(this.text)
// 	// 	.map((e) => e.group(1))
// 	// 	.where((element) => element != "")
// 	// 	.toSet();
// }