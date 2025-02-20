//***********
// ARRAYS ***
//***********

/* filter polyfill: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter */
if (!Array.prototype.filter) {
  (function () {
    Array.prototype.filter = function (callback) {
      var filtered = [];
      for (var i = 0; i < this.length; i++) if (callback(this[i], i, this)) filtered.push(this[i]);
      return filtered;
    };
  })();
}

/* forEach polyfill: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach */
if (!Array.prototype.forEach) {
  (function () {
    Array.prototype.forEach = function (callback) {
      for (var i = 0; i < this.length; i++) callback(this[i], i, this);
    };
  })();
}

/* includes polyfill: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes */
if (!Array.prototype.includes) {
  (function () {
    Array.prototype.includes = function (item) {
      for (var i = 0; i < this.length; i++) if (this[i] == item) return true;
      return false;
    };
  })();
}

//************
// STRINGS ***
//************

/* trim ployfill: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim */
if (!String.prototype.trim) {
  (function () {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function () {
      return this.replace(rtrim, "");
    };
  })();
}
