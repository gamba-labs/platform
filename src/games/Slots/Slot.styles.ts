import styled from "styled-components";

export const StyledSpinner = styled.div`
  @keyframes spinning {
    0% {
      top: 0;
    }
    100% {
      top: calc(var(--num-items) * -100%);
    }
  }

  --num-items: 5;
  --spin-speed: .6s;

  position: absolute;
  width: 100%;
  height: 100%;

  transition: opacity .1s .1s ease;
  animation: spinning var(--spin-speed) .1s linear infinite;
  opacity: 0;

  &[data-spinning="true"] {
    opacity: 1;
  }

  & > div {
    color: white;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 15px;
  }

`
