import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "../utils/firebase-config";
import Card from "../components/Card";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { getUsersLikedMovies } from "../store";
import { useDispatch, useSelector } from "react-redux";

export default function UserListedMovies() {
  const likedMovies = useSelector((state) => state.netflix.likedMovies);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState(undefined);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) setEmail(currentUser.email);
    else navigate("/login");
  });

  useEffect(() => {
    if (email) {
      dispatch(getUsersLikedMovies(email));
    }
  }, [email, dispatch]);

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <Navbar isScrolled={isScrolled} />
      <div className="content flex column">
        <h1>My List</h1>
        {likedMovies.length === 0 ? (
          <EmptyMessage>
            <p>Your list is empty!</p>
            <p>Add movies to your list to see them here.</p>
          </EmptyMessage>
        ) : (
          <div className="grid flex">
            {likedMovies.map((movie, index) => {
              return (
                <Card
                  movieData={movie}
                  index={index}
                  key={movie.id}
                  isLiked={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .content {
    margin: 2.3rem;
    margin-top: 8rem;
    gap: 3rem;
    h1 {
      margin-left: 3rem;
      font-size: 2.5rem;
    }
    .grid {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  
  p {
    font-size: 1.5rem;
    color: #b3b3b3;
    
    &:first-child {
      font-size: 2rem;
      font-weight: 600;
      color: white;
    }
  }
`;