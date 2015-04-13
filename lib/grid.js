/*
 * Constructor. 
 * Init data structure.
 */
var Grid = function Grid(mapData, opts) {
  var self = this;
  var data = self._data = [];

  self.opts = opts || self.opts;

  var linesData = mapData.split('\n');

  linesData.forEach(function(lineData, lineIx) {
    var elevations = lineData.trim().split(' ');

    if (lineIx === 0) {
      self.size.x = elevations[0];
      self.size.y = elevations[1];
      return;
    }

    var line = [];

    elevations.forEach(function(elevation, x) {
      var point = {
        elevation: parseInt(elevation),
        pos: {
          x: x,
          // we start to add lines at index 1 to the grid data at index 0
          y: lineIx - 1
        },
        isChildOfPath: false
      };
      
      line.push(point);
    });

    data.push(line);
  });

  return self;
};

Grid.prototype = {

  _data: [],

  size: {
    x: -1,
    y: -1
  },

  opts: {
    showSteps: false
  },

  /*
   * Find the highest drop!
   */
  findLongestPathWithLargestDrop: function findLongestPathWithLargestDrop() {
    var self = this;

    var longestPathWithLargestDrop;
    var largestDrop = -1;

    var longestPaths = self.findLongestPaths();

    longestPaths.forEach(function(path) {
      var top = path[0];
      var bottom = path[path.length - 1];
      var drop = top.elevation - bottom.elevation;

      if (drop > largestDrop) {
        largestDrop = drop;
        longestPathWithLargestDrop = path;
      }
    });

    return {
      path: longestPathWithLargestDrop,
      drop: largestDrop
    };
  },

  /*
   * Find paths and determine the longest ones
   */
  findLongestPaths: function findLongestPaths() {
    var self = this;
    var data = self._data;
    var showSteps = self.opts.showSteps == 'true';

    var longestPathLength = -1;
    var longestPaths = [];

    data.forEach(function(line) {
      line.forEach(function(point) {
        if (point.isChildOfPath) {
          // no point looking at a point being a child
          return;
        }

        var paths = self.findPossiblePaths(point);

        if (showSteps) {
          console.log('Root Point: ' + point.pos.x + ',' + point.pos.y + ' (' + point.elevation + ')');
        }

        paths.forEach(function(path) {
          var pathLength = path.length;

          if (pathLength > longestPathLength) {
            // new record!
            longestPathLength = pathLength;
            longestPaths = [path];

          } else if (pathLength === longestPathLength) {
            // congratulations
            longestPaths.push(path);
          }
          // else get off

          if (showSteps) {
            var journey = path.map(function(point) {
              return point.elevation;
            });
            console.log(journey.join(' -> '));
          }
        });

        if (showSteps) {
          console.log('==============================================\n\n');
        }
      });
    });

    return longestPaths;
  },

  /*
   * Find all possible paths from a point
   */
  findPossiblePaths: function findPossiblePaths(startingPoint, initPath) {
    var self = this;
    var data = self._data;

    initPath = initPath || [startingPoint];

    var paths = [initPath];

    var x = startingPoint.pos.x;
    var y = startingPoint.pos.y;
    var elevation = startingPoint.elevation;

    var line = data[y];
    var upperLine = data[y - 1];
    var belowLine = data[y + 1];

    var siblingPoints = {
      n: upperLine ? upperLine[x] : null,
      s: belowLine ? belowLine[x]: null,
      e: line[x + 1] || null,
      w: line[x - 1] || null
    };

    Object.keys(siblingPoints).forEach(function(direction) {
      var siblingPoint = siblingPoints[direction];

      if (!siblingPoint || siblingPoint.elevation >= elevation) {
        return;
      }

      siblingPoint.isChildOfPath = true;

      var siblingPath = initPath.concat([siblingPoint]);
      // lookup recursively
      var siblingPaths = self.findPossiblePaths(siblingPoint, siblingPath);

      paths = paths.concat(siblingPaths);
    });

    return paths;
  }

};

module.exports = Grid;