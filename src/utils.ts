import { uniq } from 'lodash';
import { GridArray, ArrayOfIndexes, Set } from '../src/commonTypes';

const returnAdjacentIndexes = (size: number, index: number, array: GridArray) => {
    // horizontal and vertical indexes to check
    const adjacentIndexes = [index - 1, index + 1, index - size, index + size];
    const rowNumber = Math.floor(index / size);
    const accumulator: Array<number> = [];

    return adjacentIndexes.reduce((acc, adjacentIndex, i) => {
        const isBleedingHorizontally =
            (i === 0 || i === 1) &&
            Math.floor(index / size) === rowNumber &&
            Math.floor(adjacentIndex / size) !== rowNumber;

        const shouldAddIndex = array[index] && array[index].value === 1 &&
            array[adjacentIndex] && array[adjacentIndex].value === 1 && !isBleedingHorizontally;

        return shouldAddIndex ? [...acc, adjacentIndex] : acc;
    }, accumulator);
};

// Try to rewrite with reduce
const getSetForId = (adjacentIndexes: ArrayOfIndexes, size: number, gridArray: GridArray): ArrayOfIndexes => {
    let resultAccumulator: ArrayOfIndexes = [];

    function getSet(arr: ArrayOfIndexes): ArrayOfIndexes {
        const indexesToCheck = arr.filter(i => !resultAccumulator.includes(i));

        if (indexesToCheck.length) {
            resultAccumulator = uniq([...resultAccumulator, ...arr]);
            indexesToCheck.forEach(i => {
                const adjacentIndexes = returnAdjacentIndexes(size, i, gridArray);
                getSet(adjacentIndexes);
            });
        } else {
            return uniq(resultAccumulator);
        }

        return resultAccumulator;
    }

    return getSet(adjacentIndexes);
}

export const calcFilledSets = (size: number, gridArray: GridArray): Array<Set> => {
    const allSetsAccumulator: Array<Set> = [];
    const allSetsReducer = gridArray.reduce((acc, curr, index) => {
        // get closest adjacent indexes for current index
        const adjacentIndexes = returnAdjacentIndexes(size, index, gridArray);
        const set = {
            id: index,
            set: getSetForId(adjacentIndexes, size, gridArray)
        }
        const shouldNotInlcudeSet = acc.find(i => i.set.includes(index));
        return shouldNotInlcudeSet ? acc : [...acc, set];
    }, allSetsAccumulator);
    // remove empty sets in return
    return allSetsReducer.filter(i => i.set.length > 0);
}


const random0or1 = (): number => {
    return Math.round(Math.random());
}

export const generateGridArray = (size: number): GridArray => {
    return Array.from({ length: size * size }, () => { return { value: random0or1() } });
}