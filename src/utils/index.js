"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");
const APIFilter = require("./APIFilter");

const pickDataInfo = (fields = [], object = {}) => {
  return _.pick(object, fields);
};

const pickDataInfoExcept = (exceptFields = [], object = {}) => {
  return _.omit(object, exceptFields);
};

const convertStringToObjectId = (string) => {
  return new Types.ObjectId(string);
};

// remove null and undefined fields from the object
const deepCleanObject = (object) => {
  if (typeof object !== "object") return object;

  Object.keys(object).forEach((key) => {
    if (_.isPlainObject(object[key])) {
      const result = deepCleanObject(object[key]);

      if (_.isEmpty(result)) {
        delete object[key];
      } else {
        object[key] = result;
      }
    } else {
      if (_.isNull(object[key]) || _.isUndefined(object[key])) {
        delete object[key];
      }
    }
  });

  return object;
};

// flatten object for update
const flattenObject = (object) => {
  const flatted = {};

  Object.keys(object).forEach((key) => {
    if (_.isPlainObject(object[key])) {
      const result = flattenObject(object[key]);

      Object.keys(result).forEach((innerKey) => {
        flatted[`${key}.${innerKey}`] = result[innerKey];
      });
    } else {
      flatted[key] = object[key];
    }
  });

  return flatted;
};

const compareObjIdAndStr = (objId, str) => {
  return objId.toString() === str;
};

const selectDataQuery = (selectedFields) => {
  return Object.fromEntries(selectedFields.map((field) => [field, 1]));
};

const unSelectDataQuery = (unSelectedFields) => {
  return Object.fromEntries(unSelectedFields.map((field) => [field, 0]));
};

const filterDataWithQueryObj = async (query, queryObj) => {
  const apiFilter = new APIFilter({ query, queryObj }).filter().paginate().sort().selectFields();

  return await apiFilter.build();
};

const isObjectEmptyOrFalsy = (obj) => {
  if (!obj || !_.isObject(obj) || _.isEmpty(obj)) return true;
  return false;
};

const replaceTemplateData = (templateString, data) => {
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\{\{${key}\}\}`, "g");
    templateString = templateString.replace(regex, data[key]);
  });

  return templateString;
};

const removeDuplicatesWith = (data, comparator) => {
  return _.uniqWith(data, comparator);
};

const removeDuplicates = (data) => {
  return _.uniq(data);
};

module.exports = {
  removeDuplicates,
  removeDuplicatesWith,
  replaceTemplateData,
  isObjectEmptyOrFalsy,
  filterDataWithQueryObj,
  selectDataQuery,
  pickDataInfo,
  unSelectDataQuery,
  pickDataInfoExcept,
  convertStringToObjectId,
  deepCleanObject,
  flattenObject,
  compareObjIdAndStr,
};
