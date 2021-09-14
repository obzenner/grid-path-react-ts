export type GridArray = Array<{ value: number }>;
export type ArrayOfIndexes = Array<number>;
export type Set = {
  id: number,
  set: ArrayOfIndexes
}
export type allSetsAccumulator = Array<Set>;