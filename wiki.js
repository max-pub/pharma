export default function parseWikiPage(text) {
	for (let boxName in WikiPage) {
		// console.log('boxname', boxName)
		let x = text.find(new RegExp(`{{(${boxName})`, 'gi'));
		// console.log('boxname', boxName, x)
		if (x.length) return WikiPage[boxName](text);
	}
	return {};
}

const WikiPage = {
	'Infobox Protein': text => ({
		// INN: text.findKey('Freiname').map(x => x.toLowerCase()),//.join('').trim().toLowerCase(),
		// names: [],
		CAS: text.findKeyMultiLine('CAS').map(x => x.replace(/\*/g,'').trim().split(' ')[0]),
		ATC: text.find(/{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, '')),
		// CAS: text.findKey('CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		// formula: text.findKey('Suchfunktion').map(x => x.trim()),
		// group: text.findKeyMultiLine('Wirkstoffgruppe').join(' ').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()).map(x => x.split('|').slice(-1)[0]),
		group: text.findKeyMultiLine('Wirkstoffklasse ')?.join('\n').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()),
	})
	,
	'Infobox Chemikalie': text => ({
		// names: [],
		CAS: text.findKeyMultiLine('CAS').map(x => x.replace(/[^0-9\-]/g, ' ').trim().split(' ')[0].trim()),
		ATC: text.find(/{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, '')),
		INN: text.findKey('Freiname').map(x => x.toLowerCase()),//.join('').trim().toLowerCase(),
		// CAS: text.findKey('CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		formula: text.findKey('Suchfunktion').map(x => x.trim()),
		// group: text.findKeyMultiLine('Wirkstoffgruppe').join(' ').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()).map(x => x.split('|').slice(-1)[0]),
		group: text.findKeyMultiLine('Wirkstoffgruppe')?.join('\n').split(']]').map(x => x.replace(/[\[\]\*]/g, '').trim()),
	})
	,
	'Infobox drug': text => ({
		// INN: text.findKey( 'Freiname').join('').trim().toLowerCase(),
		// names: [],
		CAS: text.findKey('CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		ATC: [text.findKey('ATC_prefix')?.[0] + text.findKey('ATC_suffix')?.[0], ...text.find(/{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, ''))],
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
		ATC: [text.findKey('ATC_prefix')?.[0] + text.findKey('ATC_suffix')?.[0], ...text.find(/{{ATC\|(.*?)}}/g).map(x => x.replace(/\|/g, ''))],
		UNII: text.findKey('UNII'),
		DrugBank: text.findKey('DrugBank'),
		KEGG: text.findKey('KEGG'),
		PubChem: text.findKey('PubChem'),
		formula: text.findKey('chemical_formula').map(x => x.replace(/[|=\s]/g, '')),
		tradeNames: text.findKey('tradename')?.[0]?.split(',')?.map(x => x.trim().toLowerCase()),
		group: text.findKey('Wirkstoffgruppe').map(x => x.replace(/[\[\]]/g, '').trim()),
	})

}



String.prototype.find = function (regex) {
	// console.log('find', regex, regex.exec(string))
	// return string.match(regex) ?? [];
	var matches, result = [];
	while ((matches = regex.exec(this)) != null) {
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

String.prototype.findKey = function (key) {
	return this.find(new RegExp(`${key}\\s+?=\\s+(.*)`, 'gm'));
}

String.prototype.findKeyMultiLine = function (key) {
	return this.find(new RegExp(`${key}\\s+?=\\s+([\\s\\S]*?(?=^\\|))`, 'gm'))?.join()?.split('\n');
}


