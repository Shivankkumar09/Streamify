
import { useNavigate } from "react-router-dom";
import styled from "styled-components";


export default function Header(props) {
  const navigate = useNavigate();
  return (
    <StyledHeader className="flex a-center j-between  ">
      <div className="logo">
       <h1>STREAMIFY</h1>
      </div>
      <button onClick={() => navigate(props.login ? "/login" : "/signup")}>
        {props.login ? "Log In" : "Sign In"}
      </button>
    </StyledHeader>
  );
}
const StyledHeader = styled.header`
  padding: 0 4rem;  
  .logo {
    h1{
     font-size: 4rem;
    font-family: "Bebas Neue", sans-serif;
    font-weight: 500;
    font-style: normal;
    color: #e50914;
    text-align: center;}
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #e50914;
    border: none;
    cursor: pointer;
    color: white;
    border-radius: 0.2rem;
    font-weight: bolder;
    font-size: 1.05rem;
  }
`;