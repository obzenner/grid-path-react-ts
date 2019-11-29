import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactSlider from 'react-slider';
import { SketchPicker } from 'react-color';
import { uniq } from 'lodash';

function random0or1(): number {
  return Math.round(Math.random());
}

type GridArray = Array<{ value: number }>;
type ArrayOfIndexes = Array<number>;

function generateGridArray(size: number): GridArray {
  return Array.from({ length: size * size }, () => { return { value: random0or1() } });
}

type BoxProps = {
  isColored?: boolean,
  color?: string,
  onClick: Function
}

const Box = styled.div<BoxProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  width: 50px;
  height: 50px;
  margin: 4px 4px 0 0;
  border-radius: 10px;
  background-color: ${({ isColored, color }) => isColored ? color : 'black'};
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

    .thumb {
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

// Try to rewrite with reduce
function getSetForId(size: number, arrayForIndex: ArrayOfIndexes, gridArray: GridArray) {
  let resultAccumulator: ArrayOfIndexes = [];

  function getSet(arr: ArrayOfIndexes): ArrayOfIndexes {
    const toCheck = arr.filter(i => {
      return !resultAccumulator.includes(i);
    })
    if (toCheck.length) {
      resultAccumulator = uniq([...resultAccumulator, ...arr]);
      toCheck.forEach(i => {
        getSet(returnAdjacentIndexes(size, i, gridArray));
      });
    } else {
      return uniq(resultAccumulator);
    }
    return resultAccumulator;
  }

  return getSet(arrayForIndex);
}

function returnAdjacentIndexes(size: number, index: number, array: GridArray) {
  // horizontal and vertical indexes to check
  const conditionalIndexes = [index - 1, index + 1, index - size, index + size];
  const rowNumber = Math.floor(index / size);
  const initReduceArray: Array<number> = [];

  const result = conditionalIndexes.reduce((acc, cond, condIndex) => {
    const isBleedingHorizontally =
      (condIndex === 0 || condIndex === 1) &&
      Math.floor(index / size) === rowNumber && Math.floor(cond / size) !== rowNumber;
    if (array[index] && array[index].value === 1 &&
      array[cond] && array[cond].value === 1 &&
      !isBleedingHorizontally) {
      return [...acc, cond];
    } else {
      return acc;
    }
  }, initReduceArray);
  return result;
};

type allSetsAccumulator = Array<{
  id: number,
  set: ArrayOfIndexes
}>;

function calcFilledSets(size: number, gridArray: GridArray): allSetsAccumulator {
  const allSetsAccumulator: allSetsAccumulator = [];
  const allSetsReducer = gridArray.reduce((acc, curr, index) => {
    const set = {
      id: index,
      set: getSetForId(size, returnAdjacentIndexes(size, index, gridArray), gridArray)
    }
    const shouldNotInlcudeSet = acc.find(i => i.set.includes(index));
    if (shouldNotInlcudeSet) {
      return acc;
    } else {
      acc.push(set);
      return acc;
    }
  }, allSetsAccumulator);
  return allSetsReducer.filter(i => i.set.length > 0);
}

const BoxElement = (props: {
  activeIndex: number | null,
  numberOfAdjacentElements: number | null,
  boxColor: string,
  index: number,
  indexValue: number,
  showSetNumber: (index: number) => number | null
}) => {
  const { activeIndex, boxColor, index, showSetNumber, indexValue, numberOfAdjacentElements } = props;
  const [adjacentElements, setActiveIndexValue] = useState<number | null>(null);

  useEffect(() => {
    if (index === activeIndex) {
      setActiveIndexValue(numberOfAdjacentElements);
    }
  }, [activeIndex])

  return <Box onClick={() => { showSetNumber(index) }}
    isColored={indexValue === 1}
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
  const [numberOfAdjacentElements, setNumberOfAdjacentElements] = useState<number | null>(null);

  const sets = calcFilledSets(gridSize, gridArray);

  function showSetNumber(index: number): number | null {
    const clickedSet = sets.filter(set => {
      return set.set.includes(index);
    });
    const numberOfAdjacentElements = clickedSet[0] && clickedSet[0].set.length;
    setActiveIndex(index);
    setNumberOfAdjacentElements(numberOfAdjacentElements);
    return numberOfAdjacentElements || null;
  };

  function handleChangeComplete(color: { hex: React.SetStateAction<string>; }) {
    setBoxColor(color.hex);
  }

  return (
    <MainContainer>
      <ReactSlider max={25} defaultValue={10} onChange={(value) => {
        setGridSize(Number(value));
        setGridArray(generateGridArray(Number(value)));
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
          />
        })}
      </GridWrapper>
    </MainContainer>
  );
}

export default App;
