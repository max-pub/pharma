export default function extractData(text) {
	// console.log('regex',text)
	for (let boxName in WikiPage) {
		// console.log('boxname', boxName,text)
		let x = text.groups(new RegExp(`{{(${boxName})`, 'gi')).flat();
		// console.log('boxname', boxName, x)
		// console.log('FORMU', text.findKey('Fórmula_química'))
		// console.log('FORMU', text.findKey('Nombre_IUPAC'))
		// console.log('form',text.findKey('StdInChI').first().groups(/1S\/(.*?)\//g))
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
			o[a] = o[a].map(x => x.clearTags())
			o[a] = o[a].unique().trim().clearEmpty().sort()
		} catch { o[a] = []; } //  o[a] = []; 
		if (o[a].length < 1) delete o[a];
	}
	return o;
}

function cleanData(data) {
	if (data.INN?.length)
		data.INN = data.INN.map(x => x.replace(/\(.*?\)/g, '')).trim()
	if (data.ATC?.length)
		data.ATC = data.ATC.map(x => x.slice(0, 7)).trim()
	// data.INN = data.INN.map(x=> x.replace(/\(.*\)/g,'').trim())
	if (data.group?.length)
		data.group = data.group.map(x => x.split('|')).flat().map(x => x.replace(/,/g, '').trim())
	if (data.formula?.length)
		data.formula = data.formula.map(x => x.replace(/([a-z]+)(1)([a-z]+)/gi, '$1$3')) // remove single "1"s   like H7N1O3 -> H7NO3
	if (data.tradeNames?.length) {
		// console.log('clean TRADE',data.tradeNames)
		data.tradeNames = data.tradeNames
			.trim()
			.join('|')
			//remove stuff in {{ stuff }} 
			.replace(/(?:{{.*}}|\(.*\))/g, '')
			//remove "other" and "others"
			.replace(/\|?other[s]?\|?/, '||')
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
	'Infobox Polymer': text => ({
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
		// IUPAC: text.findKey('IUPAC_name').map(x => x.toLowerCase()),
		CAS: text.findKey('CAS_number').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		ATC: [text.findKey('ATC_prefix')?.[0] + text.findKey('ATC_suffix')?.[0], ...text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, ''))],
		UNII: text.findKey('UNII'),
		DrugBank: text.findKey('DrugBank'),
		KEGG: text.findKey('KEGG'),
		PubChem: text.findKey('PubChem'),
		formula: [text.findKey('chemical_formula').map(x => x.replace(/[|=\s]/g, '')), text.findKey('StdInChI').first().groups(/1S\/(.*?)\//g).first()].flat().clearEmpty(),
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
	}),

	'Ficha de medicamento': text => ({
		// IUPAC: text.findKey('Nombre_IUPAC').map(x => x.toLowerCase()),
		CAS: [...text.findKey('Número_CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()), ...text.findKey('CAS_number') ],
		ATC: [text.findKey('Prefijo_ATC').first() + text.findKey('Sufijo_ATC').first(), ...text.groups(/{{ATC\|(.*?)}}/g).flat().map(x => x.replace(/\|/g, ''))],
		PubChem: text.findKey('PubChem'),
		DrugBank: text.findKey('DrugBank'),
		formula: text.findKeyMultiLine('Fórmula_química').map(x => x.replace(/[{}|=\s]/g, '').replace('fquim', '')),
	})
	,	
	'Ficha de compuesto químico': text => ({
		// IUPAC: text.findKey('Nombre_IUPAC').map(x => x.toLowerCase()),
		CAS: text.findKey('CAS').map(x => x.replace(/[^0-9\-]/g, '').trim()),
		ATC: text.findKey('ATC'),
		PubChem: text.findKey('PubChem'),
		DrugBank: text.findKey('DrugBank'),
		formula: text.findKeyMultiLine('Fórmula_química').map(x => x.replace(/[{}|=\s]/g, '').replace('fquim', '')),
	})
	,
}






import 'https://max.pub/lib/array.js';
import 'https://max.pub/lib/string.js';


Object.defineProperties(String.prototype, {
	findKey: {
		value: function (key) {
			return this.groups(new RegExp(`${key}\\s*?=\\s*(.*)`, 'gm')).flat();
		}
	},
	findKeyMultiLine: {
		value: function (key) {
			return this.groups(new RegExp(`${key}\\s+?=\\s+([\\s\\S]*?(?=^\\|))`, 'gm'))?.flat()?.join()?.split('\n');
		}
	},
});


// Fórmula_química\s+?=\s+((?:\|\s+[A-Z]{1,2}\s+=\s+\d+\s+)*)

