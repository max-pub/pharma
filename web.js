import * as lib from './lib.js';
import HASH from './hash.js';



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
	console.log('hash', HASH.get())
	document.querySelector('#tags').innerHTML =
		HASH.get().queries.map(x => `<span class='${lib.QUERIES[x] ? 'done' : ''}'>${x}</span>`).join('\n');
	// document.querySelector('#tags').innerHTML += string.split(',').map(x => x.trim()).map(x => `<span>${x}</span>`).join('\n')

	search();
}
// console.log('hash',document.location.hash.trim())
if (document.location.hash.trim().length < 2)
	document.location.hash = 'aspirin---dormicum';
// document.location.hash = 'de:aspirin,dormicum';
else
	hashChange(); // call at startup and on events



async function search() {
	let todos = Array.from(document.querySelectorAll('#tags span')).filter(node => !node.classList.contains('done')).slice(0,5);//.map(x=>x.textContent);
	// console.log('web.search', todo);
	if (!todos.length) return;
	todos.map(x=>x.classList.add('loading'));
	// for (let query of HASH.get().queries) {
	// let result = await lib.loadPharmacon(HASH.get().language, todo[0].textContent)
	// await lib.loadPharmacon(todo[0].textContent)
	await Promise.all(todos.map(x => lib.loadPharmacon(x.textContent)))

	document.querySelector('#output').innerHTML = JSON.stringify(lib.DATA, null, '\t');
	todos.map(x=>x.classList.remove('loading'));
	todos.map(x=>x.classList.add('done'));
	// todo[0].classList.remove('loading')
	// todo[0].classList.add('done');
	// }
	search() // continue search, 1 by 1
}

// setTimeout(search, 500);


// lib.loadPharmacon('en', 'aspirin')





document.querySelector('#lang').addEventListener('click', e => {
	if (e.target.nodeName.toLowerCase() != 'span') return;
	HASH.setLanguage(e.target.textContent);
})
document.querySelector('#tags').addEventListener('click', e => {
	if (e.target.nodeName.toLowerCase() != 'span') return;
	HASH.removeQueries(e.target.textContent);
})


document.querySelector('input').addEventListener('keyup', event => {
	// console.log('input',event)
	// if (e.data == ',')
	if (event.key == 'Enter')
		addInput(event.target);
})

window.addEventListener('paste', e => {
	HASH.addQueries((e.clipboardData || window.clipboardData).getData('text'));
	e.preventDefault();
	return false;
})

window.addEventListener('hashchange', e =>
	hashChange()
)


document.querySelector('button').addEventListener('click', e => {
	addInput(document.querySelector('input'))
	// search()
})
// remdesivir
// beloc
// dormicum