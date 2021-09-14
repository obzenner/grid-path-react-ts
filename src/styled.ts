import styled from 'styled-components'

type BoxProps = {
    isColored?: boolean,
    color?: string,
    partOfActiveSet?: boolean,
    onClick: Function
  }
  
  export const Box = styled.div<BoxProps>`
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
  
  export const MainContainer = styled.div`
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
  
  export const GridWrapper = styled.div<{ size: number }>`
    display: grid;
    grid-template-columns: ${({ size }) => `repeat(${size}, 1fr)`};
  `;