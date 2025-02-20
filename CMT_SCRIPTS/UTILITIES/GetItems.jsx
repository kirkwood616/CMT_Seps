//@include 'Polyfills.js';
//@include 'Layers.jsx';

/**
 * Recursive function to get PathItems from a collection of PageItems
 * @param {PageItem[]|PathItem} pageItemsArray Array of PageItems
 * @returns {PathItem[]}
 */
function getPathItems(pageItemsArray) {
  var elements = pageItemsArray;
  var paths = [];

  if (elements.length < 1) {
    return;
  } else {
    for (var i = 0; i < elements.length; i++) {
      try {
        switch (elements[i].typename) {
          case "PathItem":
            paths.push(elements[i]);
            break;
          case "GroupItem":
            getPathItems(elements[i]);
            break;
          case "CompoundPathItem":
            var _pathItems = elements[i].pathItems;
            for (var j = 0; j < _pathItems.length; j++) {
              paths.push(_pathItems[j]);
            }
            break;
          default:
            throw new Error("Non-Path Elements Found");
        }
      } catch (e) {
        alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
      }
    }
  }
  return paths;
}

/**
 * Recursive function to retrieve any children on a specified layer, no matter the depth
 * @param {String} typeName         Typename of target items
 * @param {String} layerName        Name of target Layer
 * @param {Layer|PageItem} [parent] Container of target items
 * @param {Boolean} [deep]          Is a Container
 * @returns {PageItem[]}
 */
function getLayerPageItems(typeName, layerName, parent, deep) {
  if (arguments.length == 2 || !parent) {
    if (!isLayerNamed(layerName)) return;
    parent = app.activeDocument.layers.getByName(layerName);
    deep = true;
  }
  var result = [];
  if (!parent[typeName]) return [];
  for (var i = 0; i < parent[typeName].length; i++) {
    result.push(parent[typeName][i]);
    if (parent[typeName][i][typeName] && deep)
      result = [].concat(result, getLayerPageItems(typeName, layerName, parent[typeName][i], deep));
  }
  return result;
}

/**
 * Gets the names of all spot colors used in a named layer
 * @param {String} layerName Name of target Layer
 * @returns {Array}
 */
function getLayerColorNames(layerName) {
  try {
    if (isLayerNamed(layerName)) {
      var _pageItems = getLayerPageItems("pageItems", layerName);
      var uniqueColors = [];

      getPathItems(_pageItems)
        .filter(function (pageItem) {
          return pageItem.fillColor && pageItem.fillColor.typename !== "NoColor";
        })
        .forEach(function (pathItem, index) {
          var colorValue =
            pathItem.fillColor.typename === "SpotColor" ? pathItem.fillColor.spot.name : pathItem.fillColor.typename;
          if (!uniqueColors.includes(colorValue)) {
            uniqueColors.push(colorValue);
          }
        });

      return uniqueColors;
    } else {
      throw new Error("No Layer With Name");
    }
  } catch (e) {
    alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
  }
}

/**
 *
 * @param {String} layerName    Name of target Layer
 * @param {String} fillName     Name of target Swatch/Spot Color
 * @param {Swatch} newSwatch    Swatch to replace target color
 */
function recolorPathsInLayer(layerName, fillName, newSwatch) {
  try {
    if (isLayerNamed(layerName)) {
      var _pageItems = getLayerPageItems("pageItems", layerName);
      var paths = getPathItems(_pageItems);

      paths
        .filter(function (path) {
          return path.fillColor && path.fillColor.typename !== "NoColor";
        })
        .forEach(function (pathItem) {
          if (pathItem.fillColor.typename === "SpotColor" && pathItem.fillColor.spot.name === fillName) {
            pathItem.fillColor = newSwatch.color;
          }
        });
    } else {
      throw new Error("No Layer With Name");
    }
  } catch (e) {
    alert(e + "\n\n" + "Error Code: " + e.line, "Script Alert", true);
  }
}
