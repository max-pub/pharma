

document.querySelector('#lang').addEventListener('click', e => {
	if (e.target.nodeName.toLowerCase() != 'span') return;
	HASH.setLanguage(e.target.textContent);
})
document.querySelector('#tags').addEventListener('click', e => {
	if (e.target.nodeName.toLowerCase() != 'span') return;
	HASH.removeQueries(e.target.textContent);
})


document.querySelector('textarea').addEventListener('input', e => {
	if (e.data == ',')
		addInput(e.target);
})

window.addEventListener('paste', e => {
	HASH.add((event.clipboardData || window.clipboardData).getData('text'));
	e.preventDefault();
	return false;
})

window.addEventListener('hashchange', e =>
	hashChange()
)


document.querySelector('button').addEventListener('click', e => {
	search()
})
