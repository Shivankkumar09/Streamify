import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { IoPlayCircleSharp } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { RiThumbUpFill, RiThumbDownFill } from "react-icons/ri";
import { BiChevronDown } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useDispatch, useSelector } from "react-redux";
import { addMovieToLiked, removeMovieFromLiked, getUsersLikedMovies } from "../store";
import video from "../assets/video.mp4";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default React.memo(function Card({ index, movieData, isLiked = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState(undefined);
  const [isInMyList, setIsInMyList] = useState(isLiked);
  const [isLoading, setIsLoading] = useState(false);
  
  const likedMovies = useSelector((state) => state.netflix.likedMovies);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setEmail(currentUser.email);
        // Fetch liked movies when user logs in
        dispatch(getUsersLikedMovies(currentUser.email));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  // Check if this movie is in the liked list
  useEffect(() => {
    if (likedMovies && movieData) {
      const isMovieLiked = likedMovies.some((movie) => movie.id === movieData.id);
      setIsInMyList(isMovieLiked);
    }
  }, [likedMovies, movieData]);

  const addToList = async () => {
    if (!email) {
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(addMovieToLiked({ email, movieData }));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromList = async () => {
    if (!email) {
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    try {
      await dispatch(removeMovieFromLiked({ movieId: movieData.id, email }));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movieData.image}`}
        alt="card"
        onClick={() => navigate("/player")}
      />

      {isHovered && (
        <div className="hover">
          <div className="image-video-container">
            <img
              src={`https://image.tmdb.org/t/p/w500${movieData.image}`}
              alt="card"
              onClick={() => navigate("/player")}
            />
            <video
              src={video}
              autoPlay={true}
              loop
              muted
              onClick={() => navigate("/player")}
            />
          </div>
          <div className="info-container flex column">
            <h3 className="name" onClick={() => navigate("/player")}>
              {movieData.name}
            </h3>
            <div className="icons flex j-between">
              <div className="controls flex">
                <IoPlayCircleSharp
                  title="Play"
                  onClick={() => navigate("/player")}
                />
                <RiThumbUpFill title="Like" />
                <RiThumbDownFill title="Dislike" />
                {isLoading ? (
                  <LoadingSpinner />
                ) : isInMyList ? (
                  <BsCheck
                    title="Remove from List"
                    onClick={removeFromList}
                    className="in-list-icon"
                  />
                ) : (
                  <AiOutlinePlus title="Add to my list" onClick={addToList} />
                )}
              </div>
              {/* Details Button to navigate to the Movie Details page */}
               <button
                    className="details-button"
                    onClick={() => navigate(`/movie/${movieData.id}`)}
                >
                  <IoMdInformationCircleOutline />
                </button>
              <div className="info">
                <BiChevronDown title="More Info" />
              </div>
            </div>
            <div className="genres flex">
              <ul className="flex">
                {movieData.genres.map((genre, index) => (
                  <li key={index}>{genre}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
});

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(229, 9, 20, 0.2);
  border-top: 3px solid #e50914;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

const Container = styled.div`
  max-width: 230px;
  width: 230px;
  height: 100%;
  cursor: pointer;
  position: relative;
  img {
    border-radius: 0.2rem;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .hover {
    z-index: 99;
    height: max-content;
    width: 20rem;
    position: absolute;
    top: -18vh;
    left: 0;
    border-radius: 0.3rem;
    box-shadow: rgba(0, 0, 0, 0.75) 0px 3px 10px;
    background-color: #181818;
    transition: 0.3s ease-in-out;
    .image-video-container {
      position: relative;
      height: 140px;
      img {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 0.3rem;
        top: 0;
        z-index: 4;
        position: absolute;
      }
      video {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 0.3rem;
        top: 0;
        z-index: 5;
        position: absolute;
      }
    }
    .info-container {
      padding: 1rem;
      gap: 0.5rem;
    }
    .icons {
      .controls {
        display: flex;
        gap: 1rem;
      }
      svg {
        font-size: 2rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: #b8b8b8;
        }
        
        &.in-list-icon {
          color: #46d369;
          border: 2px solid #46d369;
          border-radius: 50%;
          padding: 0.2rem;
          
          &:hover {
            color: #5ae57f;
            border-color: #5ae57f;
          }
        }
      }
    }
    .genres {
      ul {
        gap: 1rem;
        li {
          padding-right: 0.7rem;
          &:first-of-type {
            list-style-type: none;
          }
        }
      }
    }
  }

  .details-button{
  background-color:transparent;
  color:white;
  font-size:1.5rem;
  cursor:pointer
  border:none;
  &:hover {
          color: #b8b8b8;
        }
          border:none;
}
`;
