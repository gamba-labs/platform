import styled, { DefaultTheme, createGlobalStyle, keyframes } from 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    palette: {
      background: string,
      backgroundLight: string
      textColor: string,
      primary: string,
    },
  }
}

export const theme: DefaultTheme = {
  palette: {
    background: '#080809',
    backgroundLight: '#1a1c24',
    textColor: '#ffffff',
    primary: '#ff335c',
  },
}

export const GlobalStyle = createGlobalStyle`
  #root, html, body {
    height: 100%;
  }
  :root {
    ${({ theme }) => `
      --border-radius: 5px;
      --text-color: ${theme.palette.textColor};
      --primary-color: ${theme.palette.primary};
      --header-bg-color: ${theme.palette.background}EE;
      --gamba-modal-bg: ${theme.palette.backgroundLight};
      --gamba-modal-text: ${theme.palette.textColor};
      --bg-color: ${theme.palette.background};
      --bg-light-color: ${theme.palette.backgroundLight};
    `})
  }
  html, body {
    overflow-x: hidden;
  }
  * {
    box-sizing: border-box;
  }
  ::selection {
  }
  button {
    user-select: none;
  }
  body {
    margin: 0;
    color: var(--text-color);
    background: var(--bg-color);
    cursor: default;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: .4em;
    }
    &::-webkit-scrollbar-thumb {
      bg-color: #cccccc33;
    }
  }
  h1, h2, h3, h4 {
    margin: 0;
    font-weight: normal;
  }

  body, input, button, textarea, pre {
    font-family: 'Roboto Mono', monospace;
    font-display: block;
    font-size: 14px;
  }
  button, a {
    cursor: pointer;
  }
  a:not([href^="https://"]) {
    text-decoration: none;
  }
  a {
    color: unset;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const Section = styled.div`
  padding: 10px;
  width: 100%;
  transition: width .25s ease;
  @media (min-width: 800px) {
    width: 720px;
  }
  @media (min-width: 1280px) {
    width: 960px;
  }
  display: grid;
  gap: 10px;
  margin: 0 auto;
  padding: 20px;
`

export const Banner = styled.div<{size: 'big' | 'medium' | 'default'}>`
  position: relative;
  transition: height .25s ease;
  height: 100vh;
  ${({ size }) => size === 'default' && `
    @media (min-height: 420px) {
      height: 420px;
    }
    @media (min-height: 500px) {
      height: 500px;
    }
    @media (min-height: 960px) {
      height: 40vh;
    }
  `}
  ${({ size }) => size === 'medium' && `
    @media (min-height: 800px) {
      height: 50vh!important;
    }
  `}
  ${({ size }) => size === 'big' && `
    @media (min-height: 800px) {
      height: 75vh!important;
    }
  `}
  & > div {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    animation: ${fadeIn} .5s;
    &:last-child {
      display: flex;
      text-align: left;
      z-index: 1;
      flex-direction: column;
      justify-content: space-between;
    }
  }
  &:after {
    content: "";
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    background-image: linear-gradient(0deg, var(--bg-color) 0%, ${({ theme }) => theme.palette.background}00 100%);
  }
`

export const StylelessButton = styled.button`
  border: none;
  margin: 0;
  outline: none;
  padding: 0;
  background: none;
`
