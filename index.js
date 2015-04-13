var fs = require('fs');
var Grid = require('./lib/grid');

/*
 * Run
 */

require('dotenv').load();

fs.readFile(process.env.MAP_FILE, {encoding: 'utf-8'}, function(error, mapData) {
  if (error) {
    throw error;
  }

  var start = (new Date()).getTime();

  var grid = new Grid(mapData, {
    showSteps: process.env.SHOW_STEPS
  });
  var result = grid.findLongestPathWithLargestDrop();
  var journey = result.path.map(function(point) {
    return point.elevation;
  });

  var end = (new Date()).getTime();
  var time = (end - start) / 1000;

  console.log('==============================================\n' + 
              'Analyzed map: ' + grid.size.x + 'x' + grid.size.y + ' (' + (grid.size.x * grid.size.y) + ' points) in ' + time + ' seconds.\n' + 
              'The longest path (length = ' + result.path.length +') with largest drop (size = ' + result.drop + ') is ' + journey.join(' -> ') + 
              '\n==============================================');
});