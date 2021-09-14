import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import { MainContainer, Box, GridWrapper } from '../src/styled';
import { SketchPicker } from 'react-color';
import { generateGridArray, calcFilledSets } from '../src/utils';
import { GridArray, Set } from '../src/commonTypes';
import { v4 as uuidv4 } from 'uuid';

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
  }, [activeIndex, activeSet, index, numberOfAdjacentElements])

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
    const clickedSet = sets.filter(set => set.set.includes(index));

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
            key={uuidv4()}
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
