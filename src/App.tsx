import React, { useState } from 'react';
import styled from 'styled-components';
import ReactSlider from 'react-slider';

function random0or1(): number {
  return Math.round(Math.random());
}

type FinalArray = Array<Array<{ value: number }>>

function generateArray(size: number): FinalArray {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => {
    return { value: random0or1() };
  }));
}

function chunkArray(array: FinalArray, size: number) {
  const chunked_arr = [];
  let index = 0;

  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }

  return chunked_arr;
}

type BoxProps = {
  isColored?: boolean
}

const Box = styled.div<BoxProps>`
  width: 50px;
  height: 50px;
  background-color: ${({ isColored }) => isColored ? 'red' : 'blue'};
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  .slider {
    max-width: 200px;
    width: 100%;
    margin: 20px 0;
    height: 30px;
    background-color: #efefef;

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

const GridWrapper = styled.div`
  display: flex;
`;

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(10);
  const gridArray = generateArray(gridSize);

  return (
    <MainContainer>
      <ReactSlider max={30} onChange={(value) => {
        setGridSize(Number(value))
      }} renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>} />
      <GridWrapper>
        {chunkArray(gridArray, 10).map(i => {
          return i.map(sub => {
            return <div>{sub.map(i => <Box isColored={i.value === 1} />)}</div>;
          });
        })}
      </GridWrapper>
    </MainContainer>
  );
}

export default App;
