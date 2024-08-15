"use strict";

class APIFilter {
  constructor({ queryObj, query }) {
    this.queryObj = queryObj;
    this.query = query;
  }

  #getFilterObj() {
    const clonedQuery = { ...this.query };
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.map((exfield) => delete clonedQuery[exfield]);

    const queryString = JSON.stringify(clonedQuery).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const filterObj = JSON.parse(queryString);

    return filterObj;
  }

  filter() {
    this.queryObj = this.queryObj.find(this.#getFilterObj());
    return this;
  }

  sort() {
    let sortObj = this.queryObj.sort({ _id: -1 });

    if (this.query.sort) {
      sortObj = this.queryObj.sort(this.query.sort.split(",").join(" "));
    }

    this.queryObj = sortObj;

    return this;
  }

  paginate() {
    const page = this.query.page || 1;
    const limit = this.query.limit || 10;
    const skip = (page - 1) * limit;

    this.queryObj = this.queryObj.skip(skip).limit(limit);

    return this;
  }

  selectFields() {
    if (this.query.fields) {
      const selectedFields = this.query.fields.split(",").join(" ");
      this.queryObj = this.queryObj.select(selectedFields);
    } else {
      this.queryObj = this.queryObj.select({ __v: 0 });
    }

    return this;
  }

  async count() {
    return await this.queryObj.model.countDocuments(this.#getFilterObj());
  }

  async build() {
    return await this.queryObj.lean();
  }
}

module.exports = APIFilter;
