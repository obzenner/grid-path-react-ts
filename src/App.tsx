import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactSlider from 'react-slider';
import { SketchPicker } from 'react-color';
import { uniq } from 'lodash';

type GridArray = Array<{ value: number }>;
type ArrayOfIndexes = Array<number>;
type Set = {
  id: number,
  set: ArrayOfIndexes
}
type allSetsAccumulator = Array<Set>;


function random0or1(): number {
  return Math.round(Math.random());
}

function generateGridArray(size: number): GridArray {
  return Array.from({ length: size * size }, () => { return { value: random0or1() } });
}

type BoxProps = {
  isColored?: boolean,
  color?: string,
  partOfActiveSet?: boolean,
  onClick: Function
}

const Box = styled.div<BoxProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-size: 25px;
  text-shadow: 1px 2px #000;
  width: 50px;
  height: 50px;
  margin: 4px 4px 0 0;
  border-radius: 10px;
  background-color: ${({ isColored, color }) => isColored ? color : 'black'};
  ${({ partOfActiveSet }) => partOfActiveSet && `
    opacity: ${partOfActiveSet ? '0.5' : '1'};
    transform: ${partOfActiveSet ? `scale(0.9)` : 'none'};
    transition: opacity ${partOfActiveSet ? `${Math.random()}s ease-in-out` : 'none'}, transform ${partOfActiveSet ? `${Math.random()}s ease-in-out` : 'none'};
  `}
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  .sketch-picker {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .slider {
    max-width: 200px;
    width: 100%;
    margin: 20px 0;
    height: 30px;
    background-color: #d4d4d4;
    border-radius: 8px;

    .thumb {
      border-radius: 8px;
      cursor: pointer;
      height: 100%;
      width: 30px;
      background-color: #383838;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
  }
`;

const GridWrapper = styled.div<{ size: number }>`
  display: grid;
  grid-template-columns: ${({ size }) => `repeat(${size}, 1fr)`};
`;

function returnAdjacentIndexes(size: number, index: number, array: GridArray) {
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
function getSetForId(adjacentIndexes: ArrayOfIndexes, size: number, gridArray: GridArray): ArrayOfIndexes {
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

function calcFilledSets(size: number, gridArray: GridArray): allSetsAccumulator {
  const allSetsAccumulator: allSetsAccumulator = [];
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

const BoxElement = (props: {
  activeSet: Set | null,
  activeIndex: number | null,
  numberOfAdjacentElements: number | null,
  boxColor: string,
  index: number,
  indexValue: number,
  showSetNumber: (index: number) => number | null
}) => {
  const { activeSet,
    activeIndex,
    boxColor,
    index,
    showSetNumber,
    indexValue,
    numberOfAdjacentElements
  } = props;
  const [adjacentElements, setActiveIndexValue] = useState<number | null>(null);
  const [partOfActiveSet, setIsPartOfActiveSet] = useState<boolean>(false);

  useEffect(() => {
    if (index === activeIndex) {
      setActiveIndexValue(numberOfAdjacentElements);
    }

    if (activeSet && activeSet.set.includes(index)) {
      setIsPartOfActiveSet(true);
    }
  }, [activeIndex])

  return <Box onClick={() => { showSetNumber(index) }}
    isColored={indexValue === 1}
    partOfActiveSet={partOfActiveSet}
    color={boxColor}>
    {adjacentElements}
  </Box>
}

// APP
const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(10);
  const [boxColor, setBoxColor] = useState("blue");
  const [gridArray, setGridArray] = useState<GridArray>(generateGridArray(10));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSet, setActiveSet] = useState<Set | null>(null);
  const [numberOfAdjacentElements, setNumberOfAdjacentElements] = useState<number | null>(null);

  const sets = calcFilledSets(gridSize, gridArray);

  function showSetNumber(index: number): number | null {
    const clickedSet = sets.filter(set => {
      return set.set.includes(index);
    });
    const numberOfAdjacentElements = clickedSet[0] && clickedSet[0].set.length;
    setActiveSet(clickedSet[0]);
    setActiveIndex(index);
    setNumberOfAdjacentElements(numberOfAdjacentElements);
    return numberOfAdjacentElements || null;
  };

  function handleChangeComplete(color: { hex: React.SetStateAction<string>; }) {
    setBoxColor(color.hex);
    setActiveIndex(null);
    setActiveSet(null);
  }

  return (
    <MainContainer>
      <ReactSlider max={25} defaultValue={10} onChange={(value) => {
        setGridSize(Number(value));
        setGridArray(generateGridArray(Number(value)));
        setActiveIndex(null);
        setActiveSet(null);
      }} renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>} />
      <SketchPicker
        color={boxColor}
        onChangeComplete={handleChangeComplete}
      />
      <GridWrapper size={gridSize}>
        {gridArray.map((el, index) => {
          return <BoxElement
            boxColor={boxColor}
            key={Math.round(Math.random() * 10000000)}
            index={index}
            indexValue={el.value}
            activeIndex={activeIndex}
            numberOfAdjacentElements={numberOfAdjacentElements}
            showSetNumber={showSetNumber}
            activeSet={activeSet}
          />
        })}
      </GridWrapper>
    </MainContainer>
  );
}

export default App;
