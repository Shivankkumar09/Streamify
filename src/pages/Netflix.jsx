import { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies, getGenres } from "../store";
import { FaPlay } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Slider from "../components/Slider";
import SliderSlick from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Netflix() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  
  const API_KEY = "3d39d6bfe362592e6aa293f01fbcf9b9"; // Replace with your TMDB API key
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const movies = useSelector((state) => state.netflix.movies);
  const genres = useSelector((state) => state.netflix.genres);
  const genresLoaded = useSelector((state) => state.netflix.genresLoaded);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`
        );
        const data = await response.json();
        setTrendingMovies(data.results.slice(0, 5)); // Get first 5 trending movies
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      }
    };

    fetchTrendingMovies();
  }, []);

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);

  useEffect(() => {
    if (genresLoaded) {
      dispatch(fetchMovies({ genres, type: "all" }));
    }
  }, [genresLoaded, genres, dispatch]);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (!currentUser) navigate("/login");
  });

  window.onscroll = () => {
    setIsScrolled(window.pageYOffset !== 0);
    return () => (window.onscroll = null);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,        // Increased speed for a smoother transition
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,  // Faster auto-scroll (2.5 seconds)
  };

  return (
    <Container>
      <Navbar isScrolled={isScrolled} />
      <div className="hero">
        <SliderSlick {...settings}>
          {trendingMovies.map((movie) => (
            <div key={movie.id} className="hero-slide">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title || movie.name}
                className="background-image"
              />
              <div className="container">
                <div className="logo">
                  <h1>{movie.title || movie.name}</h1>
                </div>
                <div className="buttons flex">
                  <button onClick={() => navigate("/player")} className="flex j-center a-center">
                    <FaPlay />
                    Play
                  </button>
                  <button onClick={() => navigate(`/movie/${movie.id}`)} className="flex j-center a-center">
                    <AiOutlineInfoCircle />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </SliderSlick>
      </div>
      <Slider movies={movies} />
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  .hero {
    position: relative;
    .hero-slide {
      position: relative;
    }
    .background-image {
      filter: brightness(60%);
      width: 100vw;
      height: 100vh;
      object-fit: cover;
    }
    .container {
      position: absolute;
      bottom: 5rem;
      left: 5rem;
      .logo {
        h1 {
          font-size: 3rem;
          color: white;
        }
      }
      .buttons {
        margin-top: 1.5rem;
        display: flex;
        gap: 2rem;
        button {
          font-size: 1.4rem;
          gap: 1rem;
          border-radius: 0.2rem;
          padding: 0.5rem 2rem;
          border: none;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          &:hover {
            opacity: 0.8;
          }
          &:nth-of-type(2) {
            background-color: rgba(109, 109, 110, 0.7);
            color: white;
            svg {
              font-size: 1.8rem;
            }
          }
        }
      }
    }
  }
`;

export default Netflix;
