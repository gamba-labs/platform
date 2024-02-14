import React from 'react';
import styled from 'styled-components';

const Welcome = styled.div`
  background: transparent; 
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20vh;

  & > img {
    width: 40vW; /* Adjust based on your logo size, ensuring it's not too large */
    height: auto; /* Maintain aspect ratio */
    animation: logo-fade-in 1s ease; /* Optional: add animation for the logo */
  }

  @keyframes logo-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export function WelcomeBanner() {
  return (
    <Welcome>
      <img src="logo text.webp" alt="Logo" /> 
    </Welcome>
  );
}
