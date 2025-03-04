import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { API_KEY, TMDB_BASE_URL } from "../utils/constants";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const { data } = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
        );
        console.log(data);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <h2>Loading...</h2>;

  return (
    <Container>
      <div className="top-section">
        <div className="poster-container">
          <img 
            className="poster" 
            src={`https://image.tmdb.org/t/p/original${movie.poster_path}`} 
            alt={movie.title} 
          />
        </div>
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <p>{movie.overview}</p>
          <div className="details">
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Rating:</strong> {movie.vote_average} / 10.00 ⭐</p>
            <p><strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(", ")}</p>
            <p><strong>Runtime:</strong> {movie.runtime} min</p>
            <p><strong>Adult:</strong> {movie.adult ? "Yes" : "No"}</p>
            <p><strong>popularity:</strong> {movie.popularity}</p>
          </div>
          <div className="cast">
            <h3>Cast:</h3>
            <p>
              {movie.credits.cast.slice(0, 5).map((actor) => actor.name).join(", ")}
            </p>
          </div>
          <div className="official-page">
            <h3>Official Page:</h3>
            <p>{movie.homepage}</p>
          </div>
        </div>
      </div>
    </Container>
  );
};

const Container = styled.div`
 width: 100%;
  padding: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
background-color: #4B4E53;
background-image: linear-gradient(147deg, #4B4E53 0%, #000000 74%);


  color: white;
  min-height: 100vh;

  .top-section {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 60px;
  }

  .poster-container {
    flex: 1;
    width: 600px;
    height:600px;
    img.poster {
      width: 100%;
        height: 100%;
        object-fit: cover;
      border-radius: 10px;
    }
  }

  .movie-info {
    flex: 2;
    padding:20px;
    h1 {
      font-size: 4rem;
      margin-bottom: 10px;
    }
    p {
      font-size: 1.2rem;
      color: #ccc;
    }
    .details {
      margin-top: 20px;
      p {
        font-size: 1.1rem;
      }
    }
    .cast {
      margin-top: 20px;
      h3 {
        font-size: 1.5rem;
      }
      p {
         margin-top: 10px;
        font-size: 1.1rem;
      }
    }
      .official-page{
        margin-top: 20px;}
  }
`;

export default MovieDetails;