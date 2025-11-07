import { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies, getGenres } from "../store";
import { FaPlay, FaStar } from "react-icons/fa";
import { AiOutlineInfoCircle, AiOutlinePlus } from "react-icons/ai";
import Slider from "../components/Slider";
import SliderSlick from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "../components/Loader";

function Netflix() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroDetails, setHeroDetails] = useState({});
  
  const API_KEY = "3d39d6bfe362592e6aa293f01fbcf9b9";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const movies = useSelector((state) => state.netflix.movies);
  const genres = useSelector((state) => state.netflix.genres);
  const genresLoaded = useSelector((state) => state.netflix.genresLoaded);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`
        );
        const data = await response.json();
        const topMovies = data.results.slice(0, 5);
        setTrendingMovies(topMovies);
        
        // Fetch detailed info for each trending movie
        const detailsPromises = topMovies.map(async (movie) => {
          const detailResponse = await fetch(
            `https://api.themoviedb.org/3/${movie.media_type}/${movie.id}?api_key=${API_KEY}`
          );
          return detailResponse.json();
        });
        
        const details = await Promise.all(detailsPromises);
        const detailsMap = {};
        details.forEach((detail) => {
          detailsMap[detail.id] = detail;
        });
        setHeroDetails(detailsMap);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        setIsLoading(false);
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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getReleaseYear = (movie) => {
    const date = movie.release_date || movie.first_air_date;
    return date ? new Date(date).getFullYear() : "";
  };

  const getGenreNames = (movieId) => {
    const details = heroDetails[movieId];
    if (!details || !details.genres) return [];
    return details.genres.slice(0, 3).map(g => g.name);
  };

  const getRuntime = (movieId) => {
    const details = heroDetails[movieId];
    if (!details) return "";
    
    if (details.runtime) {
      const hours = Math.floor(details.runtime / 60);
      const mins = details.runtime % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } else if (details.episode_run_time && details.episode_run_time.length > 0) {
      return `${details.episode_run_time[0]}m`;
    }
    return "";
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container>
      <Navbar isScrolled={isScrolled} />
      <div className="hero">
        {trendingMovies.length > 0 ? (
          <SliderSlick {...settings}>
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="hero-slide">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title || movie.name}
                  className="background-image"
                />
                <div className="hero-gradient"></div>
                <div className="container">
                  <div className="content-wrapper">
                    <div className="badge-container">
                      <span className="top-badge">
                        <span className="badge-number">TOP</span> 10
                      </span>
                    </div>
                    <div className="logo">
                      <h1>{movie.title || movie.name}</h1>
                    </div>
                    
                    <div className="movie-info">
                      <div className="info-row">
                        {movie.vote_average > 0 && (
                          <span className="rating">
                            <FaStar /> {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                        <span className="year">{getReleaseYear(movie)}</span>
                        {getRuntime(movie.id) && (
                          <span className="runtime">{getRuntime(movie.id)}</span>
                        )}
                        <span className="quality-badge">HD</span>
                      </div>
                      
                      {getGenreNames(movie.id).length > 0 && (
                        <div className="genres">
                          {getGenreNames(movie.id).map((genre, index) => (
                            <span key={index} className="genre-tag">{genre}</span>
                          ))}
                        </div>
                      )}
                      
                      <p className="description">
                        {truncateText(movie.overview, 200)}
                      </p>
                    </div>
                    
                    <div className="buttons flex">
                      <button 
                        onClick={() => navigate("/player")} 
                        className="play-btn flex j-center a-center"
                      >
                        <FaPlay />
                        Play
                      </button>
                      <button 
                        onClick={() => navigate(`/movie/${movie.id}`)} 
                        className="info-btn flex j-center a-center"
                      >
                        <AiOutlineInfoCircle />
                        More Info
                      </button>
                      <button 
                        className="list-btn flex j-center a-center"
                        title="Add to My List"
                      >
                        <AiOutlinePlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </SliderSlick>
        ) : (
          <div className="hero-placeholder">
            <Loader />
          </div>
        )}
      </div>
      <Slider movies={movies} />
      
      <Footer>
        <div className="footer-content">
          <div className="footer-links">
            <div className="link-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>
            <div className="link-column">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQ</a>
            </div>
            <div className="link-column">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Preferences</a>
            </div>
            <div className="link-column">
              <h4>Connect</h4>
              <a href="#">Twitter</a>
              <a href="#">Facebook</a>
              <a href="#">Instagram</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Streamify. All rights reserved.</p>
            <p className="tagline">Unlimited entertainment, one click away.</p>
          </div>
        </div>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  
  .hero {
    position: relative;
    height: 100vh;
    
    .hero-placeholder {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, #000000 0%, #141414 100%);
    }
    
    .hero-slide {
      position: relative;
      height: 100vh;
    }
    
    .background-image {
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      filter: brightness(50%);
      animation: zoomIn 10s ease-out forwards;
    }

    @keyframes zoomIn {
      from {
        transform: scale(1.1);
      }
      to {
        transform: scale(1);
      }
    }
    
    .hero-gradient {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.95) 0%,
        rgba(0, 0, 0, 0.7) 30%,
        rgba(0, 0, 0, 0.4) 60%,
        transparent 100%
      );
      z-index: 1;
    }
    
    .container {
      position: absolute;
      bottom: 15%;
      left: 4%;
      z-index: 2;
      max-width: 45%;
      
      .content-wrapper {
        animation: fadeInUp 0.8s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .badge-container {
        margin-bottom: 1rem;
        
        .top-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
          
          .badge-number {
            font-size: 1.4rem;
            margin-right: 0.3rem;
          }
        }
      }
      
      .logo {
        margin-bottom: 1rem;
        
        h1 {
          font-size: 4rem;
          color: white;
          font-weight: 700;
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
          line-height: 1.1;
          margin: 0;
        }
      }
      
      .movie-info {
        margin-bottom: 1.5rem;
        
        .info-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          
          span {
            color: white;
            font-size: 1.1rem;
            font-weight: 500;
          }
          
          .rating {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            color: #46d369;
            
            svg {
              color: #ffd700;
            }
          }
          
          .year {
            color: #d2d2d2;
          }
          
          .runtime {
            color: #d2d2d2;
          }
          
          .quality-badge {
            border: 2px solid rgba(255, 255, 255, 0.6);
            padding: 0.1rem 0.5rem;
            font-size: 0.9rem;
            border-radius: 3px;
          }
        }
        
        .genres {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          
          .genre-tag {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.95rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }
        
        .description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          line-height: 1.6;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
          max-width: 90%;
        }
      }
      
      .buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        
        button {
          font-size: 1.3rem;
          gap: 0.8rem;
          border-radius: 6px;
          padding: 0.8rem 2rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          
          svg {
            font-size: 1.5rem;
          }
          
          &.play-btn {
            background: white;
            color: black;
            
            &:hover {
              background: rgba(255, 255, 255, 0.85);
              transform: scale(1.05);
            }
          }
          
          &.info-btn {
            background: rgba(109, 109, 110, 0.7);
            backdrop-filter: blur(10px);
            color: white;
            
            svg {
              font-size: 1.8rem;
            }
            
            &:hover {
              background: rgba(109, 109, 110, 0.5);
              transform: scale(1.05);
            }
          }
          
          &.list-btn {
            background: rgba(42, 42, 42, 0.7);
            backdrop-filter: blur(10px);
            color: white;
            padding: 0.8rem 1.2rem;
            border: 2px solid rgba(255, 255, 255, 0.5);
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: white;
              transform: scale(1.05);
            }
          }
        }
      }
    }

    /* Responsive adjustments */
    @media (max-width: 1200px) {
      .container {
        max-width: 55%;
        
        .logo h1 {
          font-size: 3rem;
        }
      }
    }

    @media (max-width: 768px) {
      height: 80vh;
      
      .hero-slide {
        height: 80vh;
      }
      
      .background-image {
        height: 80vh;
      }
      
      .container {
        max-width: 90%;
        left: 5%;
        bottom: 10%;
        
        .logo h1 {
          font-size: 2rem;
        }
        
        .movie-info .description {
          font-size: 1rem;
        }
        
        .buttons button {
          font-size: 1.1rem;
          padding: 0.6rem 1.5rem;
        }
      }
    }

    @media (max-width: 480px) {
      .container {
        .logo h1 {
          font-size: 1.5rem;
        }
        
        .movie-info {
          .info-row {
            font-size: 0.9rem;
          }
          
          .description {
            font-size: 0.9rem;
          }
        }
        
        .buttons {
          gap: 0.5rem;
          
          button {
            font-size: 1rem;
            padding: 0.5rem 1rem;
            gap: 0.5rem;
          }
        }
      }
    }
  }

  /* Slick dots styling */
  .slick-dots {
    bottom: 30px;
    z-index: 3;
    
    li button:before {
      font-size: 12px;
      color: white;
      opacity: 0.5;
    }
    
    li.slick-active button:before {
      color: #e50914;
      opacity: 1;
    }
  }
`;

const Footer = styled.footer`
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, #000000 100%);
  padding: 4rem 4%;
  margin-top: 4rem;
  border-top: 2px solid rgba(229, 9, 20, 0.3);
  
  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    
    .footer-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 3rem;
      margin-bottom: 3rem;
      
      .link-column {
        h4 {
          color: #e50914;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 1rem;
          margin-bottom: 0.8rem;
          transition: all 0.3s ease;
          
          &:hover {
            color: white;
            padding-left: 5px;
          }
        }
      }
    }
    
    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      
      p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.95rem;
        margin: 0.5rem 0;
      }
      
      .tagline {
        color: rgba(255, 255, 255, 0.4);
        font-style: italic;
        font-size: 0.9rem;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 3rem 5%;
    
    .footer-content .footer-links {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 480px) {
    .footer-content .footer-links {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;

export default Netflix;
