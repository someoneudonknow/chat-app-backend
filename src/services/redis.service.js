"use strict";

const redis = require("../db/init.redis");

const { isObjectEmptyOrFalsy } = require("../utils");

const client = redis.getClient();

const createKey = ({ modelName, id }) => {
  return `${modelName}:${id}`;
};

const hSet = async (key, obj) => {
  if (isObjectEmptyOrFalsy(obj)) return null;

  return await client.hSet(key, obj);
};

const hDel = async (key, field) => {
  return await client.hDel(key, field);
};

const hGetAll = async (key) => {
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

const sAdd = async (key, data) => {
  return await client.sAdd(key, data);
};

const sRem = async (key, data) => {
  return await client.sRem(key, data);
};

module.exports = {
  sAdd,
  sRem,
  del,
  createKey,
  hSet,
  hGetAll,
  set,
  get,
  hDel,
};
