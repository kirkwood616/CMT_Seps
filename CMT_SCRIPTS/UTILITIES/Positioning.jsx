/**
 * Centers item vertically & horizontally on the current artboard.
 * @param {PathItem|any} item Selected art or path item
 * @param {Artboard} artboard Current artboard
 */
function centerOnArtboard(item, artboard) {
  var artboard_x = artboard.artboardRect[0] + artboard.artboardRect[2];
  var artboard_y = artboard.artboardRect[1] + artboard.artboardRect[3];
  var x = (artboard_x - item.width) / 2;
  var y = (artboard_y + item.height) / 2;
  item.position = [x, y];
}
