'use strict';

const Long = require('long');
const dictionary = require(process.env.DIAMETER_DICTIONARY || 'diameter-dictionary');

const toCamelMap = {};
const fromCamelMap = {};

dictionary.avps.forEach(avp => {
  const key = avp.name;
  const camelized = key
    .split('-')
    .map((token, idx) => {
      const lc = token.toLowerCase();

      return idx
        ? lc[0].toUpperCase() + lc.slice(1)
        : lc;
    })
    .join('');

  toCamelMap[key] = camelized;
  fromCamelMap[camelized] = key;
});

function toObject(avpList) {
  const obj = {};

  avpList.forEach(avp => {
    const key = toCamelMap[avp[0]];
    let value = avp[1];

    if (value instanceof Array) {
      value = toObject(value);
    }

    if (obj.hasOwnProperty(key)) {
      obj[key] = [].concat(obj[key], value);
    } else {
      obj[key] = value;
    }
  });

  return obj;
}

function fromObject(obj) {
  const avpList = [];

  Object.keys(obj).forEach(key => {
    let value = obj[key];
    const decamelizedKey = fromCamelMap[key];

    function pushValue(value) {
      avpList.push([
        decamelizedKey,
        value instanceof Object && !(value instanceof Long) && !(value instanceof Buffer)
          ? fromObject(value)
          : value
      ]);
    }

    if (value instanceof Array) {
      value.forEach(pushValue);
    } else {
      pushValue(value);
    }
  });

  return avpList;
}

module.exports = Object.freeze({
  toObject,
  fromObject
});
