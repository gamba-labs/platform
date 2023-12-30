import styled from "styled-components";

export const StyledItemPreview = styled.div`
  display: flex;
  gap: 5px;

  & > div {
    position: relative;
    width: 50px;
    aspect-ratio: 1/1.5;
    border-radius: 5px;
    border: 1px solid #2d2d57;
  }

  & > div.hidden {
    opacity: .5;
  }

  & > div > .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  & > div > .multiplier {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
    color: black;
    background: #ffec63;
    z-index: 10;
    padding: 0 2px;
    border-radius: 2px;
    z-index: 1;
  }

`
