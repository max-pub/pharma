let args = [...Deno.args];

let titles = args[0];
let lang = args[1];
let llcontinue;
let langlinks = []

do{
    let res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&titles=${titles}&llprop=autonym%7Clangname%7Curl&lllimit=max${llcontinue?`&llcontinue=${llcontinue}`:''}`).then(data=> data.json())
    langlinks = langlinks.concat( Object.values(res?.query?.pages)[0]?.langlinks ?? [] )
    llcontinue = res?.continue?.llcontinue
}while(llcontinue)

console.log(langlinks)


let short = Object.fromEntries(langlinks.map(x => [x.lang, x['*']]));
console.log(short)
