const HASH = {
	get: () => {
		return { queries: document.location.hash.substr(1).split('---').map(x => decodeURI(x)) }
		let tmp = document.location.hash.substr(1).split(':');
		return { language: tmp[0] ?? '', queries: tmp[1]?.split('---')?.map(x => decodeURI(x)) ?? [] }
	},
	// set: (language, queries) => document.location.hash = language + ':' + queries.join('---'),
	set: (language, queries) => document.location.hash = queries.join('---'),
	addQueries: (queries) => {
		console.log('add queries', queries)
		if (typeof queries == 'string') queries = queries.split('\n').map(x => decodeURI(x).trim()).filter(x => x);
		// for (let i in queries)
		// 	if (queries[i].endsWith(',')) queries[i] = queries[i].slice(0, -1);
		let old = HASH.get();
		HASH.set(old.language, [...new Set([...old.queries, ...queries])].sort())
	},
	removeQueries: queries => {
		if (typeof queries == 'string') queries = queries.split('---').filter(x => x);
		let old = new Set(HASH.get().queries);
		for (let query of queries) old.delete(query);
		HASH.set(HASH.get().language, [...old]);

	},
	setLanguage: language => HASH.set(language, HASH.get().queries)
}

export default HASH;