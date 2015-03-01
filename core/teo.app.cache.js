/*!
 * App cache
 * @author Andrew Teologov <teologov.and@gmail.com>
 * @date 9/7/14
 */

exports = module.exports = AppCache;

function AppCache() {
    if (!(this instanceof AppCache))
        return new AppCache;

    this.cache = {};
}

/**
 * Add to cache by type
 * @param {String} key
 * @param {*} context
 * @return {*}
 */
AppCache.prototype.add = function(key, context) {
    if ((context !== void 0) && !(this.cache.hasOwnProperty(key))) {
        this.cache[key] = context;
    } else {
        console.error('Cannot add to cache: ' + key + ', val: ' + '\n' + context);
    }
    return context;
};

/**
 * Getter of cached item
 * @param key
 * @returns {*|undefined}
 */
AppCache.prototype.get = function(key) {
    if (key === '*')
        return this.cache;

    return this.cache[key] || undefined;
};