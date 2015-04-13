# Lazy Skier
This is a demo of an interesting question asked [here](http://geeks.redmart.com/2015/01/07/skiing-in-singapore-a-coding-diversion/). In short: given a map, find its **longest (and then steepest) path**.

## Run the demo
1. Clone the repo
1. Execute `npm install`
1. Execute `node index`

### The steps
As our teachers have always asked, show your steps to prove that you understand it.

1. Edit `.env`
1. Set **SHOW_STEPS**=true
1. For easier viewing, 2 smaller maps are available:
    - ./data/4x4.txt
    - ./data/5x5.txt

## Explanation
As I can barely remember the implementation details of Dijkstra's shortest path algorithm for a workflow engine 6 years ago, it appears that *longest path problem cannot be solved in polynomial time* :-(

The question indicates a map that represents Directed Acyclic Graph (highest to lowest elevation) and what's needed is to find a simple path.

I'm no algorithmatic wizard, so these are my humble attempts:

### Topological lookup (index.js + Grid.js)
The most effective in my opinion. Works in a linear way. A parser would read the map file and initialize necessary data structures: a **two-dimensional** array that allows easy traversing.

#### Pseudo-code:
```
For each point in the grid,
  If it's not already in a path, find its sibling points from all directions; 
  (*) For each accessible sibling point,
    If its elevation is lower than the origin point, construct a path
    Recursively constructing all possible paths by repeating (*) for the current sibling point
  For each path,
    If it's longer than the recorded longest path, replace that
    Else if it's of the same length, add in
  For each longest path,
    If the difference of its highest and lowest elevation is larger than the recorded path, replace that
```

#### Sample output
```
Analyzed map: 1000x1000 (1000000 points) in 8.721 seconds.
The longest path (length = 15) with largest drop (size = 1422) is 1422 -> 1412 -> 1316 -> 1304 -> 1207 -> 1162 -> 965 -> 945 -> 734 -> 429 -> 332 -> 310 -> 214 -> 143 -> 0
```

### Just-In-Time (method2-buggy.js)
I'd have thought that this is a better way as it'd construct all possible paths while initializing the data structure. The idea was to explore the north and west sibling points when visiting a point to check and create paths. But it'd ended up with more complex checking and data traversing (need to maintain a lot more references too) yet I couldn't get it correctly. I might still revisit this when I have time next time. But the first approach should be sufficient for now.

## Feedback
Criticisms/compliments/suggestions are welcomed: knyki.12@gmail.com