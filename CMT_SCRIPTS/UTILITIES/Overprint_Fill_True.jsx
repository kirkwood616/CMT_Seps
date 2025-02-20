/**
 * Set overprint for page items.
 * @author m1b
 * @discussion https://community.adobe.com/t5/illustrator-discussions/interacting-with-overprint-using-scripts/m-p/14206629
 */
(function () {
  var OVERPRINT_SETTING = true;

  var doc = app.activeDocument;

  // example usage 1: selection
  var items = itemsInsideGroupItems(doc.selection);

  // example usage 2: all page items in document
  // var items = itemsInsideGroupItems(doc.pageItems);

  for (var i = 0; i < items.length; i++) setOverprintOfItem(items[i], OVERPRINT_SETTING);
})();

/**
 * Sets item's overprinting to `value`.
 * @author m1b
 * @version 2023-11-04
 * @param {PageItem} item - an Illustrator page item.
 * @param {Boolean} value - the value to set to.
 * @returns {Object} -  {fillColors: Array<Color>, strokeColors: Array<Color>}
 */
function setOverprintOfItem(item, value) {
  if (item == undefined) throw Error("getBasicColorablesFromItem: No `item` supplied.");

  // collect all the overprintables
  if (item.constructor.name == "PathItem") {
    setOverprint(item, value);
  } else if (item.constructor.name == "CompoundPathItem" && item.pathItems) {
    setOverprint(item.pathItems[0], value);
  } else if (item.constructor.name == "TextFrame" && item.textRanges) {
    var ranges = getTextStyleRanges(item.textRange, ["overprintFill", "overprintStroke"]);
    for (var i = ranges.length - 1; i >= 0; i--) setOverprint(ranges[i], value);
  } else if (item.constructor.name == "GroupItem") {
    for (var i = 0; i < item.pageItems.length; i++) setOverprint(item.pageItems[i], value);
  }

  // helper function
  function setOverprint(item, value) {
    // most basic page items
    if (item.hasOwnProperty("fillOverprint")) {
      item.fillOverprint = value;
      item.strokeOverprint = value;
    }

    // text style ranges
    else if (item.hasOwnProperty("overprintFill")) {
      item.overprintFill = value;
      item.overprintStroke = value;
    }
  }
}

/**
 * Returns an array containing items,
 * including items found inside GroupItems.
 * Optionally can supply a filter function.
 * @author m1b
 * @param {Array<PageItem>} items - the starting items, may include group items.
 * @param {Function} [filter] - whether to collect item (default: collect all).
 * @returns {Array<PageItem>}
 */
function itemsInsideGroupItems(items, filter) {
  var found = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    if (item.typename == "GroupItem") found = found.concat(itemsInsideGroupItems(item.pageItems, filter));
    else if (filter == undefined || filter(item)) found.push(item);
  }

  return found;
}

/**
 * Returns an array of TextRanges,
 * determined by mapping changes
 * in supplied keys. For example,
 * supplying the 'fillColor' key
 * will return ranges divided when
 * the text's fillColor changes.
 * @author m1b
 * @version 2023-04-26
 * @param {TextRange} textRange - an Illustrator TextRange.
 * @param {Array<String>} keys - an array of keys to match, eg ['fillColor'].
 */
function getTextStyleRanges(textRange, keys) {
  if (textRange == undefined || textRange.constructor.name != "TextRange")
    throw Error("getTextStyleRanges: bad `textRange` supplied.");

  if (keys == undefined || keys.constructor.name != "Array") throw Error("getTextStyleRanges: bad `textRange` supplied.");

  // check keys are valid
  for (var j = 0; j < keys.length; j++)
    if (!textRange.characterAttributes.hasOwnProperty(keys[j]))
      throw Error('getTextStyleRanges: bad key supplied ("' + keys[j] + '")');

  var ranges = [],
    start = 0,
    currentValues = {};

  charactersLoop: for (var i = 0; i < textRange.length; i++) {
    var tr = textRange.textRanges[i],
      matches = true;

    // check each key
    keysLoop: for (var j = 0; j < keys.length; j++) {
      if (i == 0) currentValues[keys[j]] = tr.characterAttributes[keys[j]];
      else if (stringify(tr.characterAttributes[keys[j]]) !== stringify(currentValues[keys[j]])) {
        matches = false;
        break keysLoop;
      }
    }

    currentValues[keys[j]] = tr.characterAttributes[keys[j]];

    if (i == textRange.length - 1 || !matches) {
      // start a new range
      var newTextRange = textRange.textRanges[start];
      newTextRange.end = i == textRange.length - 1 ? i + 1 : i;
      ranges.push(newTextRange);
      start = i;
    }
  }

  return ranges;
}

/**
 * Stringify tailored for the purpose of
 * identifying overprintable text ranges.
 * @author m1b
 * @version 2023-04-26
 * @param {Object} obj - the object to stringify.
 * @returns {String}
 */
function stringify(obj) {
  var str = obj.toString();

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (key == "overprintFill" || key == "overprintStroke") str += stringify(obj[key]);
    else str += obj[key];
  }

  return str;
}
