/*
============================================================

 SayBon Asset Manager

 asset-registry.js

 Keeps track of every asset already loaded by the app.

============================================================
*/

class AssetRegistry {

    constructor() {

        this.cache = new Map();

    }

    has(path) {

        return this.cache.has(path);

    }

    get(path) {

        return this.cache.get(path);

    }

    register(path, promise) {

        this.cache.set(path, promise);

        return promise;

    }

    remove(path) {

        this.cache.delete(path);

    }

    clear() {

        this.cache.clear();

    }

    size() {

        return this.cache.size;

    }

    entries() {

        return [...this.cache.entries()];

    }

}

const registry = new AssetRegistry();

export default registry;
