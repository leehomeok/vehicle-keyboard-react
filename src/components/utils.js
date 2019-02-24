/* eslint-disable*/
// 工具函数
// Author: 陈哈哈 yoojiachen@gmail.com

export function __arrayOf(obj, fieldName) {
  var arr = obj[fieldName];
  return arr ? arr : [];
}

export function __orElse(val, def){
  return val === undefined ? def : val;
}

export function __isFun(vars){
  var check = function(fun){
      return typeof fun === "function";
  };
  if(Array.isArray(vars)){
      return vars.some(check)
  }else{
      return check(vars);
  }
}

export function __call(fun, var1, var2) {
  if(fun !== undefined && typeof fun === "function") {
      fun.apply(fun, [var1, var2]);
  }
}
// 将车牌号码，生成一个车牌字符数组
export function _rebuildNumberArray(updateNumber, originLength){
  var output = ["","","","","","",""]; // 普通车牌长度为7位，最大长度为8位
  if(originLength > 7) {
      output.push("");
  }
  // debugger
  if(updateNumber && updateNumber.length != 0) {
      var size = Math.min(8, updateNumber.length);
      for(var i = 0; i < size; i++) {
          output[i] = updateNumber.charAt(i);
      }
  }
  return output;
}

export function _isEnergyNumber(number) {
  return /\W[A-Z][0-9DF][0-9A-Z]\d{3}[0-9DF]/.test(number);
}

export function deepClone(obj) {
	// Handle the 3 simple types, and null or undefined or function
	if (null === obj || "object" !== typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		let copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
	// Handle Array or Object
	if (obj instanceof Array | obj instanceof Object) {
		let copy = (obj instanceof Array) ? [] : {};
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr))
				copy[attr] = deepClone(obj[attr]);
		}
		return copy;
	}
	throw new Error("Unable to clone obj! Its type isn't supported.");
}


let isArray = Array.isArray;
let keyList = Object.keys;
let hasProp = Object.prototype.hasOwnProperty;

export function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA !== arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA !== dateB) return false;
    if (dateA && dateB) return a.getTime() === b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA !== regexpB) return false;
    if (regexpA && regexpB) return a.toString() === b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

export default {
  __arrayOf,
  __orElse,
  __isFun,
  __call,
  _rebuildNumberArray,
  _isEnergyNumber,
  equal,
  deepClone
}
