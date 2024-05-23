"use strict";

const redis = require("../db/init.redis");

const { isObjectEmptyOrFalsy } = require("../utils");

const client = redis.getClient();

const createKey = ({ modelName, id }) => {
  return `${modelName}:${id}`;
};

const hSet = async (key, obj) => {
  if (isObjectEmptyOrFalsy(obj)) return null;

  return await client.hSet(key, ...Object.entries(obj).flat());
};

const hGet = async (key) => {
  return await client.hGetAll(key);
};

const set = async (key, value, options = {}) => {
  return await client.set(key, value, options);
};

const get = async (key) => {
  return await client.get(key);
};

const del = async (key) => {
  return await client.del(key);
};

module.exports = {
  del,
  createKey,
  hSet,
  hGet,
  set,
  get,
};
