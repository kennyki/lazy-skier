var fs = require('fs');

var DIRECTIONS = {
  N: 'N',
  W: 'W'
};

var x = 0;
var y = 0;
var grid = [];
var longestPathLength = -1;
var longestPaths = [];

var exploreNeighbourPoint = function exploreNeighbourPoint(grid, currentPoint, direction) {
  var pointIx = currentPoint.pointIx;
  var lineIx = currentPoint.lineIx;
  var neighbourLineIx = -1;
  var neighbourPointIx = -1;

  if (direction === DIRECTIONS.N && lineIx > 0) {
    neighbourLineIx = lineIx - 1;
    neighbourPointIx = pointIx;

  } else if (direction === DIRECTIONS.W && pointIx > 0) {
    neighbourLineIx = lineIx;
    neighbourPointIx = pointIx - 1;

  } else {
    // invalid direction or index out of bound
    return;
  }

  var neighbourLine = grid[neighbourLineIx];
  var neighbourPoint = neighbourLine[neighbourPointIx];

  var currentPointElevation = currentPoint.elevation;
  var neighbourPointElevation = neighbourPoint.elevation;

  if (isNaN(currentPointElevation) || isNaN(neighbourPointElevation)) {
    return;
  }

  var neighbourPointPaths = neighbourPoint.paths;
  var newPaths = [];

  if (neighbourPointElevation < currentPointElevation) {
    neighbourPointPaths.forEach(function(path) {
      var pathHighestPoint = path[0];

      // only interested in connected paths that currently starts with the neighbour
      if (pathHighestPoint.lineIx === neighbourPoint.lineIx &&
          pathHighestPoint.pointIx === neighbourPoint.pointIx) {
        // put in front
        newPaths.push([currentPoint].concat(path));
        // make part of (note: neighbourPoint already has it)
        // currentPoint.paths.push(path);
      }
    });

    newPaths.push([currentPoint, neighbourPoint]);

  } else if (neighbourPointElevation > currentPointElevation) {
    neighbourPointPaths.forEach(function(path) {
      var pathLowestPoint = path[path.length - 1];

      // only interested in connected paths that currently ends with the neighbour
      if (pathLowestPoint.lineIx === neighbourPoint.lineIx &&
          pathLowestPoint.pointIx === neighbourPoint.pointIx) {
        // put at back
        newPaths.push(path.concat([currentPoint]));
        // make part of (note: neighbourPoint already has it)
        // currentPoint.paths.push(path);
      }
    });

    newPaths.push([neighbourPoint, currentPoint]);
  }

  if (newPaths.length !== 0) {
    currentPoint.paths = currentPoint.paths.concat(newPaths);
    neighbourPoint.paths = neighbourPoint.paths.concat(newPaths);
  }
};

var checkAgainstLongestPath = function checkAgainstLongestPath(path) {
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
};

/*
 * Run
 */

require('dotenv').load();

fs.readFile(process.env.MAP_FILE, {encoding: 'utf-8'}, function(error, rawMapData) {
  if (error) {
    throw error;
  }

  var start = (new Date()).getTime();

  var lines = rawMapData.split('\n');

  lines.forEach(function(line, lineIx) {
    var rawLineData = line.trim().split(' ');

    if (lineIx === 0) {
      x = rawLineData[0];
      y = rawLineData[1];
      return;
    }

    var lineData = [];

    grid.push(lineData);

    rawLineData.forEach(function(elevation, pointIx) {
      var point = {
        elevation: parseInt(elevation),
        paths: [],
        // we start to add lines at index 1 to the grid at index 0
        lineIx: lineIx - 1,
        pointIx: pointIx
      };
      
      lineData.push(point);

      exploreNeighbourPoint(grid, point, DIRECTIONS.N);
      exploreNeighbourPoint(grid, point, DIRECTIONS.W);
    });
  });

  var longestPathWithLargestDrop;
  var largestDrop = -1;

  longestPaths.forEach(function(path) {
    var top = path[0];
    var bottom = path[path.length - 1];
    var drop = top.elevation - bottom.elevation;

    if (drop > largestDrop) {
      largestDrop = drop;
      longestPathWithLargestDrop = path;
    }
  });

  var journey = longestPathWithLargestDrop.map(function(point) {
    return point.elevation;
  });

  var end = (new Date()).getTime();
  var time = (end - start) / 1000;

  console.log('==============================================\n' + 
              'Analyzed map: ' + x + 'x' + y + ' = ' + (x * y) + ' points in ' + time + 'seconds.\n' + 
              'The longest path (length = ' + longestPathWithLargestDrop.length +') with largest drop (size = ' + largestDrop + ') is ' + journey.join(' -> ') + 
              '\n==============================================');

  // grid.forEach(function(line) {
  //   line.forEach(function(point) {
  //     console.log('Point: ' + point.lineIx + ',' + point.pointIx + ' (' + point.elevation + ')');
  //     point.paths.forEach(function(path) {
  //       var journey = path.map(function(point) {
  //         return point.elevation;
  //       });
  //       console.log(journey.join(' -> '));
  //     });
  //     console.log('==============================================\n\n');
  //   });
  // });
});
