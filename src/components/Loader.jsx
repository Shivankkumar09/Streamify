import styled, { keyframes } from "styled-components";

const Loader = ({ size = "medium", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <FullScreenLoader>
        <NetflixSpinner />
      </FullScreenLoader>
    );
  }

  return (
    <LoaderContainer size={size}>
      <NetflixSpinner size={size} />
    </LoaderContainer>
  );
};

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const FullScreenLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.size === "small" ? "0.5rem" : "1rem"};
`;

const NetflixSpinner = styled.div`
  width: ${props => {
    switch(props.size) {
      case "small": return "20px";
      case "large": return "60px";
      default: return "40px";
    }
  }};
  height: ${props => {
    switch(props.size) {
      case "small": return "20px";
      case "large": return "60px";
      default: return "40px";
    }
  }};
  border: 3px solid rgba(229, 9, 20, 0.2);
  border-top: 3px solid #e50914;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

export default Loader;




