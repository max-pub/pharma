const regex = /([a-z -]*) \(D\)/gmi;
const str = `    Suprarenin (D)
    Adrenalin 1:1000 Infectopharm (D)
    sowie Generika (A, CH)

Autoinjektoren (Injektionslösung in Fertigpen)

    Emerade (D)
    EpiPen (A, CH)
    Fastjekt (D)
    Jext (D, A, CH, NL, DK, E, I, FIN, N, SLO, S, UK)
    Anapen (D, A, CH) – Lincoln Medical Limited rief am 5. Juni 2012 alle noch haltbaren Chargen wegen möglicher Nichtabgabe von Adrenalin zurück.


Monopräparate

Humanarzneimittel: Amoxibeta (D), Amoxilan (A), Amoxypen (D), Azillin (CH), Baktocillin (D), Clamoxyl (A, CH), Infectomox (D), Jutamox (D), Ospamox (A), Spectroxyl (CH), Supramox (CH)

Tierarzneimittel: Aciphen (D), Amox (D), Amoxanil (D), Amoxin (D), Amoxisel (D), Amoxival (D), Amoxy (D), Belamox (D), Bioamoxi (D), Clamoxyl (D), Duphamox (D), Hostamox (D), Klatocillin (D), Octacillin (D), Parkemoxin (D), Tamox (D), Vetrimoxin (D), Veyxyl (D), Wedemox (D)

Kombinationspräparate

    Mit Clavulansäure: Humanarzneimittel: Amoclav (D), AmoclanHexal (A), Amoxacid (A), AmoxiPLUS ratiopharm (A), Amoxi-saar plus (D), Amoxicomp (A), Augmentan (D), Augmentin (A, CH, D), Benomox (A), Betamoclav (A), Clavamox (A), Clavex (A), Clavolek (A), Clavoplus (A), Co-Amoxiclav (A), Curam (A), InfectoSupramox (D), Lekamoxiclav (A), Xiclav (A)

Tierarzneimittel: Amoxiclav (D), Clavaseptin (D), Kesium (D), Nicilan (D), Synulox (D), Amoxi-Clavulan (D)

    Mit Flucloxacillin: Flanamox (D)
    Mit Pantoprazol und Clarithromycin: Zacpac (D)

Darüber hinaus gibt es weitere Generika sowohl bei den Mono- als auch bei den Kombi-Präparaten. `;
let x = str.matchAll(regex);
console.log('x', Array.from(x).map(i=>i.slice(1)));
for (let a of x)
	console.log('a', a)
let m;

// while ((m = regex.exec(str)) !== null) {
// 	// This is necessary to avoid infinite loops with zero-width matches
// 	if (m.index === regex.lastIndex) {
// 		regex.lastIndex++;
// 	}

// 	// The result can be accessed through the `m`-variable.
// 	m.forEach((match, groupIndex) => {
// 		console.log(`Found match, group ${groupIndex}: ${match}`);
// 	});
// }
