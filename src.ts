
interface Constructor {
	prototype: unknown;
}

type Primitive = number | string | boolean | symbol | bigint | null | undefined

type Parameter = Primitive | Constructor;

const fn = () => {
	const map = new Map<string, Function>();
	let size = 0;

	const param2str = (param: Parameter): string => {
		if (typeof param === 'function') return param.prototype.constructor.name ?? param.name ?? 'Anonymous';
		if (param === null || param === void 0) return `${param}`;
		return Object.getPrototypeOf(param).constructor.name ?? 'Unknown';
	};

	const params2key = (...params: Parameter[]): string =>
		String([...params].map(e => param2str(e)));

	const $ = (...args: Parameter[]) => {
		const key = params2key(...args);
		const f = map.get(key);
		if (!f) throw new Error(`Overload do NOT exist.`);
		return f(...args);
	};

	$.size = 0;

	$.overload = (params: Parameter[], f: Function) => {
		const str = params2key(...params);
		if (map.has(str)) throw new Error(`Do you mean 'override'? Overload already exists: ${map.get(str)}`);
		size++;
		map.set(str, f);
		return $;
	};

	$.override = (params: Parameter[], f: Function) => {
		const str = params2key(...params);
		if (!map.has(str)) size++;
		map.set(str, f);
		return $;
	};

	$.delete = (params: Parameter[]) => {
		map.delete(params2key(...params));
		size--;
		return $;
	};

	$.clear = () => {
		map.clear();
		size = 0;
		return $;
	};

	$.get = (...params: Parameter[]) => map.get(params2key(...params));

	$.has = (...params: Parameter[]) => map.has(params2key(...params));

	Object.defineProperty($, "size", {
		get() {
			return size;
		}
	});

	return $;
	// static isConstructor = (f: Function) => f.prototype?.constructor === f;
};

export { fn };
