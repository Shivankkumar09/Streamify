
import styled from "styled-components";
import background from "../assets/login.jpg";

export default function BackgroundImage() {
  return (
    <Container>
      <img src={background} alt="background" />
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  z-index: -1;
  
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
  }
`;