import  { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import CardSlider from "../components/CardSlider";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies, getGenres } from "../store";
import SelectGenre from "../components/SelectGenre";
import Slider from "../components/Slider";
import NotAvailable from "../components/NotAvailable";

function MoviePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const movies = useSelector((state) => state.netflix.movies);
  const genres = useSelector((state) => state.netflix.genres);
  const genresLoaded = useSelector((state) => state.netflix.genresLoaded);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGenres());
  }, []);

  useEffect(() => {
    if (genresLoaded) {
      dispatch(fetchMovies({ genres, type: "movie" }));
    }
  }, [genresLoaded]);

  const [user, setUser] = useState(undefined);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) setUser(currentUser.uid);
    else navigate("/login");
  });

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
    return () => (window.onscroll = null);
  };

  return (
    <Container>
      <div className="navbar">
        <Navbar isScrolled={isScrolled} />
      </div>
      <div className="data">
        <div className="header-row">
          <PageDescription>Explore thousands of movies across all genres</PageDescription>
          <SelectGenre genres={genres} type="movie" />
        </div>
        {movies.length ? <Slider movies={movies} /> : <NotAvailable />}
      </div>
    </Container>
  );
}

const Container = styled.div`
  .data {
    margin-top: 8rem;
    
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4rem;
      margin-bottom: 2rem;
      gap: 2rem;
      
      @media (max-width: 968px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }
      
      @media (max-width: 768px) {
        padding: 0 2rem;
      }
    }
    
    .not-available {
      text-align: center;
      color: white;
      margin-top: 4rem;
    }
  }
`;

const PageDescription = styled.h2`
  font-size: 1.8rem;
  color: #ffffff;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export default MoviePage;