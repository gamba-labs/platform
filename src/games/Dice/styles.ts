import styled from "styled-components";

export const Container = styled.div`
  color: white;
  user-select: none;
  width: min(100vw, 420px);
  font-size: 20px;
`

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  & > div {
    padding: 20px;
    text-align: center;
    div:last-child {
      font-size: 14px;
    }
  }
`

export const RollUnder = styled.div`
  display: flex;
  color: white;

  margin-bottom: 20px;

  & > div {
    margin: 0 auto;
    border-radius: 10px;
    text-align: center;
    & > div:first-child {
      font-weight: bold;
      font-size: 64px;
      font-variant-numeric: tabular-nums;
    }
  }
`

export const Result = styled.div`
  @keyframes result-appear {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  transform: translateX(-50%);
  position: absolute;
  top: -50px;
  transition: left .3s ease;

  & > div {
    animation: result-appear .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    transform-origin: bottom;
    background: #ffffffCC;
    backdrop-filter: blur(50px);
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
    width: 50px;
    text-align: center;
    color: black;
  }

  & > div::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px 10px 0px 10px;
    border-style: solid;
    border-color: #ffffffCC transparent transparent transparent;
  }

`
