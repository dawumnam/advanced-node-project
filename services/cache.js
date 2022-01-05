const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

const redisUrl = "redis://localhost:6379";
const redisClient = redis.createClient(redisUrl);
redisClient.hget = util.promisify(redisClient.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  //Makes it chainable
  return this;
};

mongoose.Query.prototype.exec = async function () {
  //Check if we are to use cache
  if (!this.useCache) return exec.apply(this, arguments);

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have value for ' key ' in redis
  const cacheValue = await redisClient.hget(this.hashKey, key);

  // If we do, return that

  if (cacheValue) {
    console.log("IN CACHE");
    const model = JSON.parse(cacheValue);

    return Array.isArray(model)
      ? model.map((m) => new this.model(m))
      : new this.model(model);
  }

  // Otherwise, issue the query and store the result in redis
  const queryResult = await exec.apply(this, arguments);

  redisClient.hset(this.hashKey, key, JSON.stringify(queryResult), "EX", 10);
  console.log("IN DB");
  return queryResult;
};

module.exports = {
  clearHash(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  },
};
