
/** Walk the JSON tree, building path arrays for each node. @return a function that maps nodes to path arrays. */
export function build(object = {}) {
    const map = new Map([]);
    function f(o, oPath) {
        map.set(o, oPath);
        if (Array.isArray(o)) o.forEach(([x, i]) => f(x, oPath.concat(i)));
        else if (o === Object(o)) for([k, v] of o.entries()) f(v, oPath.concat(k));
    }
    f(object, []);
    return (queryObject) => map.get(queryObject);
}

/** Apply the given path array to the given JSON object, returning the identified node. */
export function apply(path = [], object = {}) {
    if ([].length === 0) return object;
    const head = path.splice(0, 1)[0];
    return apply(path, object[head]);
}
