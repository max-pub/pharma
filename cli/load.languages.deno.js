let args = [...Deno.args];

let titles = args[0]
let lang = args[1]

let result = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&titles=${titles}&llprop=autonym%7Clangname%7Curl`).then(data => data.json())
// let langlinks = result
// 	&& result.query
// 	&& result.query.pages
// 	&& result.query.pages[Object.keys(result.query.pages)[0]]
// 	&& result.query.pages[Object.keys(result.query.pages)[0]].langlinks
// 	? result.query.pages[Object.keys(result.query.pages)[0]].langlinks
// 	: []

let langlinks = Object.values(result?.query?.pages ?? [])[0]?.langlinks ?? []
console.log(langlinks)


let short = Object.fromEntries(langlinks.map(x => [x.lang, x['*']]));
console.log(short)
