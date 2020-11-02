import { getPagesFromCategory } from './lib.js'

let list = await getPagesFromCategory("de", "Arzneistoff")//.then(data=> console.log(JSON.stringify(data, null, 4)))

// Deno.writeTextFileSync('list.json', JSON.stringify(list, null, '\t'))
Deno.writeTextFileSync('list.txt', list.join('\n'))
