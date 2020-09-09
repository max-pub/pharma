DATA = {};


function addInput(node) {
	HASH.addQueries(node.value);
	node.value = '';
}


function hashChange() {
	document.querySelectorAll('#lang span').forEach(node =>
		node.textContent.trim() == HASH.get().language
			? node.classList.add('active')
			: node.classList.remove('active')
	);

	document.querySelector('#tags').innerHTML =
		HASH.get().queries.map(x => `<span class='${DATA[x] ? 'done' : ''}'>${x}</span>`).join('\n');
	// document.querySelector('#tags').innerHTML += string.split(',').map(x => x.trim()).map(x => `<span>${x}</span>`).join('\n')

	search();
}
hashChange(); // call at startup and on events



async function search() {
	let todo = Array.from(document.querySelectorAll('#tags span')).filter(node => !node.classList.contains('done'));
	console.log('query', todo);
	todo[0].classList.add('loading');
	// for (let query of HASH.get().queries) {
	let result = await loadPharmacon(HASH.get().language, todo[0].textContent)
	DATA[result.INN] = result;
	document.querySelector('#output').innerHTML = JSON.stringify(DATA);
	todo[0].classList.remove('loading')
	todo[0].classList.add('done');
	// }
	search()
}

// setTimeout(search, 500);


