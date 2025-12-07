# Open Bracket Manager

A small JavaScript library that renders brackets based on the [Open Bracket Format](https://github.com/openbracketformat/openbracketformat).

[Live Demo](https://obf-visualizer.vercel.app/)

# Usage

Start by creating a new instance of the `BracketEvent` class and passing in your OBF sets and entrants:

```javascript
const bracket = new BracketEvent({
  sets,
  entrants,
  layout: "Single Elimination"
})
```

If you don't have any sets you can pass in an empty array instead, the library will render sets for you.

# Methods

## BracketEvent
| name        | return | description                                          |
|-------------|--------|------------------------------------------------------|
| exportSets  | Array  | Returns an array of OBF sets for the current event.  |

# Properties

## BracketEvent
| name        | type       | description                                                     |
|-------------|------------|-----------------------------------------------------------------|
| root        | BracketSet | The root node of a single bracket.                              |
| winnersRoot | BracketSet | The root node of a winners bracket (double elimination only).   |
| losersRoot  | BracketSet | The root node of a losers bracket (double elimination only).    |
| extraRoot   | BracketSet | Extra set in case of a bracket reset (double elimination only). |
| other       | Object     | An object to store custom user data.                            |

## BracketEntrant
| name           | type   | description                           |
|----------------|--------|---------------------------------------|
| entrantID      | string | ID of the current player.             |
| entrantTag     | string | Name of the current player.           |
| initialSeed    | number | Starting seed of the current player.  |
| finalPlacement | number | Final placement of the current player |
| other          | Object | An object to store custom user data.  |

## BracketSet
| name             | type           | description                                                   |
|------------------|----------------|---------------------------------------------------------------|
| setId            | string         | Unique id for a current node.                                 |
| uuid             | string         | Original set id if passing in sets.                           |
| round            | number         | Round identifier of the current set.                          |
| leftSet          | BracketSet     | Left child set.                                               |
| rightSet         | BracketSet     | Right child set.                                              |
| parentSet        | BracketSet     | Parent set of current node.                                   |
| leftEntrant      | BracketEntrant | Entrant in the player 1 slot.                                 |
| rightEntrant     | BracketEntrant | Entrant in the player 2 slot.                                 |
| leftWinnerSet    | BracketSet     | Link to the player 1 slot for of the winners set.             |
| rightWinnerSet   | BracketSet     | Link to the player 2 slot for of the winners set.             |
| loserSet         | BracketSet     | Link to the proceeding loser set.                             |
| type             | string         | Which bracket type the set belongs to (winners or losers).    |
| status           | string         | The status of the set ("pending", "started", or "completed"). |
| startTime        | string         | The start time for when a set enters "started" state.         |
| endTime          | string         | The end time for when a set enters "completed" state.         |
| onStream         | boolean        | Whether the set is on stream or not.                          |
| numberToWin      | number         | The number of games to be played in the current node.         |
| entrant1Score    | number         | Score for player 1.                                           |
| entrant2Score    | number         | Score for player 2.                                           |
| entrant1Ready    | boolean        | Flag for when player 1 is ready to start the set.             |
| entrant2Ready    | boolean        | Flag for when player 2 is ready to start the set.             |
| entrant1Reported | boolean        | Flag for when player 1 has reported their score.              |
| entrant2Reported | boolean        | Flag for when player 2 has reported their score.              |
| winner           | string         | ID for the set winner.                                        |
| loser            | string         | ID for the set loser.                                         |
| placement        | number         | Final placement for current node in the bracket.              |
| other            | Object         | An object to store custom user data.                          |
