import pharma from '../lib/pharma.js';

let P = await pharma.findAndCache(Deno.args[0])

console.log(pharma.cache.data)