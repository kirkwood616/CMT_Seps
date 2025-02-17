// Polyfills to make scripting more like ES6 syntax

Array.prototype.filter = function (callback) {
  var filtered = [];
  for (var i = 0; i < this.length; i++) if (callback(this[i], i, this)) filtered.push(this[i]);
  return filtered;
};

Array.prototype.forEach = function (callback) {
  for (var i = 0; i < this.length; i++) callback(this[i], i, this);
};

Array.prototype.includes = function (item) {
  for (var i = 0; i < this.length; i++) if (this[i] == item) return true;
  return false;
};
