import { getPagesFromCategory}  from './lib.js'

getPagesFromCategory("de", "Arzneistoff").then(data=> console.log(JSON.stringify(data, null, 4)))