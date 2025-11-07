import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { API_KEY, TMDB_BASE_URL } from "../utils/constants";
import { FaPlay, FaPlus, FaCheck, FaThumbsUp, FaInfoCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { addMovieToLiked, removeMovieFromLiked, getUsersLikedMovies } from "../store";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [email, setEmail] = useState(undefined);
  const [isInList, setIsInList] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const likedMovies = useSelector((state) => state.netflix.likedMovies);

  // Check authentication and get user email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) {
        setEmail(currentUser.email);
        dispatch(getUsersLikedMovies(currentUser.email));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  // Check if movie is in user's list
  useEffect(() => {
    if (likedMovies && id) {
      const isLiked = likedMovies.some((likedMovie) => likedMovie.id === parseInt(id));
      setIsInList(isLiked);
    }
  }, [likedMovies, id]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details with credits, videos, and images
        const { data } = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,images,reviews`
        );
        console.log(data);
        setMovie(data);
        setVideos(data.videos?.results || []);
        setReviews(data.reviews?.results.slice(0, 3) || []);

        // Fetch similar movies
        const similarResponse = await axios.get(
          `${TMDB_BASE_URL}/movie/${id}/similar?api_key=${API_KEY}&language=en-US&page=1`
        );
        setSimilarMovies(similarResponse.data.results.slice(0, 6));
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const getTrailer = () => {
    const trailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube");
    return trailer || videos[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleAddToList = async () => {
    if (!email) {
      navigate("/login");
      return;
    }

    setIsLoadingList(true);
    try {
      if (isInList) {
        await dispatch(removeMovieFromLiked({ movieId: movie.id, email }));
      } else {
        const movieData = {
          id: movie.id,
          name: movie.title,
          image: movie.backdrop_path || movie.poster_path,
          genres: movie.genres.map(g => g.name).slice(0, 3),
        };
        await dispatch(addMovieToLiked({ email, movieData }));
      }
    } catch (error) {
      console.error("Error toggling movie in list:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  if (!movie) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading Movie Details...</LoadingText>
      </LoadingContainer>
    );
  }

  const trailer = getTrailer();
  const MAX_DESCRIPTION_LENGTH = 250;
  const shouldTruncate = movie.overview && movie.overview.length > MAX_DESCRIPTION_LENGTH;

  const getDisplayedDescription = () => {
    if (!movie.overview) return "";
    if (!shouldTruncate || isDescriptionExpanded) {
      return movie.overview;
    }
    return movie.overview.substring(0, MAX_DESCRIPTION_LENGTH);
  };

  return (
    <Container>
      {/* Hero Section with Backdrop */}
      <HeroSection backdrop={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}>
        <Overlay />
        <HeroContent>
          <Title>{movie.title}</Title>
          <MetaInfo>
            <span className="rating">{movie.vote_average?.toFixed(1)} ⭐</span>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span>{formatRuntime(movie.runtime)}</span>
            {movie.adult && <span className="adult">18+</span>}
          </MetaInfo>
          <OverviewContainer>
            <Overview className={isDescriptionExpanded ? 'expanded' : ''}>
              {getDisplayedDescription()}
              {shouldTruncate && !isDescriptionExpanded && "..."}
            </Overview>
            {shouldTruncate && (
              <ReadMoreButton onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                {isDescriptionExpanded ? "Read Less" : "Read More"}
              </ReadMoreButton>
            )}
          </OverviewContainer>
          
          <ButtonGroup>
            <PlayButton onClick={() => navigate(`/player/${id}`)}>
              <FaPlay /> Play
            </PlayButton>
            <SecondaryButton 
              onClick={handleAddToList} 
              className={isInList ? "in-list" : ""}
              disabled={isLoadingList}
            >
              {isLoadingList ? (
                <>
                  <ButtonLoader />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  {isInList ? <FaCheck /> : <FaPlus />} 
                  {isInList ? "In My List" : "Add to My List"}
                </>
              )}
            </SecondaryButton>
            {trailer && (
              <SecondaryButton onClick={() => setShowTrailer(true)}>
                <FaInfoCircle /> Watch Trailer
              </SecondaryButton>
            )}
          </ButtonGroup>

          <GenreChips>
            {movie.genres.map((genre) => (
              <Chip key={genre.id}>{genre.name}</Chip>
            ))}
          </GenreChips>
        </HeroContent>
      </HeroSection>

      {/* Main Content */}
      <MainContent>
        {/* Cast Section */}
        <Section>
          <SectionTitle>Cast</SectionTitle>
          <CastGrid>
            {movie.credits?.cast.slice(0, 8).map((actor) => (
              <CastCard key={actor.id}>
                <CastImage 
                  src={actor.profile_path 
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
                    : 'https://via.placeholder.com/185x278?text=No+Image'
                  } 
                  alt={actor.name}
                />
                <CastInfo>
                  <CastName>{actor.name}</CastName>
                  <CastCharacter>{actor.character}</CastCharacter>
                </CastInfo>
              </CastCard>
            ))}
          </CastGrid>
        </Section>

        {/* Details Section */}
        <Section>
          <SectionTitle>Details</SectionTitle>
          <DetailsGrid>
            <DetailItem>
              <DetailLabel>Original Language</DetailLabel>
              <DetailValue>{movie.original_language?.toUpperCase()}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Budget</DetailLabel>
              <DetailValue>{movie.budget ? formatCurrency(movie.budget) : 'N/A'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Revenue</DetailLabel>
              <DetailValue>{movie.revenue ? formatCurrency(movie.revenue) : 'N/A'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>{movie.status}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Popularity</DetailLabel>
              <DetailValue>{movie.popularity?.toFixed(0)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Vote Count</DetailLabel>
              <DetailValue>{movie.vote_count?.toLocaleString()}</DetailValue>
            </DetailItem>
          </DetailsGrid>
        </Section>

        {/* Production Companies */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <Section>
            <SectionTitle>Production Companies</SectionTitle>
            <CompanyGrid>
              {movie.production_companies.slice(0, 6).map((company) => (
                <CompanyCard key={company.id}>
                  {company.logo_path ? (
                    <CompanyLogo 
                      src={`https://image.tmdb.org/t/p/w185${company.logo_path}`} 
                      alt={company.name}
                    />
                  ) : (
                    <CompanyName>{company.name}</CompanyName>
                  )}
                </CompanyCard>
              ))}
            </CompanyGrid>
          </Section>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Section>
            <SectionTitle>Reviews</SectionTitle>
            <ReviewsContainer>
              {reviews.map((review) => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <ReviewAuthor>{review.author}</ReviewAuthor>
                    {review.author_details?.rating && (
                      <ReviewRating>{review.author_details.rating} ⭐</ReviewRating>
                    )}
                  </ReviewHeader>
                  <ReviewContent>
                    {review.content.length > 400 
                      ? `${review.content.substring(0, 400)}...` 
                      : review.content
                    }
                  </ReviewContent>
                  <ReviewDate>
                    {new Date(review.created_at).toLocaleDateString()}
                  </ReviewDate>
                </ReviewCard>
              ))}
            </ReviewsContainer>
          </Section>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <Section>
            <SectionTitle>More Like This</SectionTitle>
            <SimilarMoviesGrid>
              {similarMovies.map((similarMovie) => (
                <MovieCard 
                  key={similarMovie.id}
                  onClick={() => {
                    navigate(`/movie/${similarMovie.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <MoviePoster 
                    src={`https://image.tmdb.org/t/p/w342${similarMovie.poster_path}`} 
                    alt={similarMovie.title}
                  />
                  <MovieInfo>
                    <MovieTitle>{similarMovie.title}</MovieTitle>
                    <MovieRating>{similarMovie.vote_average?.toFixed(1)} ⭐</MovieRating>
                  </MovieInfo>
                </MovieCard>
              ))}
            </SimilarMoviesGrid>
          </Section>
        )}

        {/* Official Website */}
        {movie.homepage && (
          <Section>
            <SectionTitle>Official Website</SectionTitle>
            <OfficialLink href={movie.homepage} target="_blank" rel="noopener noreferrer">
              Visit Official Website
            </OfficialLink>
          </Section>
        )}
      </MainContent>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <TrailerModal>
          <TrailerContent>
            <CloseButton onClick={() => setShowTrailer(false)}>
              <IoMdClose />
            </CloseButton>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={trailer.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </TrailerContent>
        </TrailerModal>
      )}
    </Container>
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

const ButtonLoader = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spinAnimation} 0.6s linear infinite;
`;

const Container = styled.div`
 width: 100%;
  background-color: #141414;
  color: white;
  min-height: 100vh;
`;

const LoadingContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #141414;
  gap: 2rem;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(229, 9, 20, 0.2);
  border-top: 4px solid #e50914;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  min-height: 90vh;
  max-height: 100vh;
  background-image: url(${props => props.backdrop});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 0 4rem 4rem 4rem;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 70vh;
    max-height: 80vh;
    padding: 0 2rem 2rem 2rem;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(20, 20, 20, 1) 0%,
    rgba(20, 20, 20, 0.8) 30%,
    rgba(20, 20, 20, 0.4) 60%,
    rgba(20, 20, 20, 0.2) 100%
  );
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 60%;
  width: 100%;
  
  @media (max-width: 968px) {
    max-width: 70%;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.2;
  
  @media (max-width: 1200px) {
    font-size: 3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  align-items: center;
  flex-wrap: wrap;
  
  span {
    display: flex;
    align-items: center;
    
    &.rating {
      font-weight: 600;
      color: #46d369;
      font-size: 1.3rem;
    }
    
    &.adult {
      border: 2px solid #e50914;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-weight: 600;
      color: #e50914;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    gap: 1rem;
  }
`;

const OverviewContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Overview = styled.p`
  font-size: 1.3rem;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  max-height: ${props => props.className?.includes('expanded') ? 'none' : '7.5rem'};
  overflow: hidden;
  transition: max-height 0.5s ease-in-out;
  
  &.expanded {
    max-height: 50rem;
  }
  
  @media (max-width: 1200px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ReadMoreButton = styled.button`
  background: none;
  border: none;
  color: #e50914;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #f40612;
    transform: translateX(5px);
  }
  
  &::after {
    content: '→';
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: translateX(3px);
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2.5rem;
      font-size: 1.2rem;
  font-weight: 600;
  background-color: white;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.85);
    transform: scale(1.05);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
        font-size: 1.1rem;
  font-weight: 500;
  background-color: rgba(109, 109, 110, 0.7);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background-color: rgba(109, 109, 110, 0.5);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &.in-list {
    background-color: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.7);
    }
  }
  
  svg {
    font-size: 1rem;
  }
`;

const GenreChips = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const Chip = styled.span`
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.95rem;
  backdrop-filter: blur(10px);
`;

const MainContent = styled.div`
  padding: 3rem 4rem;
  background-color: #141414;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #e5e5e5;
`;

const CastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const CastCard = styled.div`
  background-color: #2f2f2f;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
  }
`;

const CastImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
`;

const CastInfo = styled.div`
  padding: 1rem;
`;

const CastName = styled.p`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: white;
`;

const CastCharacter = styled.p`
  font-size: 0.9rem;
  color: #999;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  background-color: #1f1f1f;
  padding: 2rem;
  border-radius: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailLabel = styled.span`
  font-size: 0.95rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #e5e5e5;
`;

const CompanyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
`;

const CompanyCard = styled.div`
  background-color: #2f2f2f;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CompanyLogo = styled.img`
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

const CompanyName = styled.p`
  font-size: 1rem;
  text-align: center;
  color: #e5e5e5;
`;

const ReviewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ReviewCard = styled.div`
  background-color: #1f1f1f;
  border-radius: 10px;
  padding: 2rem;
  border-left: 4px solid #e50914;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewAuthor = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #e5e5e5;
`;

const ReviewRating = styled.span`
        font-size: 1.1rem;
  color: #46d369;
  font-weight: 600;
`;

const ReviewContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #b3b3b3;
  margin-bottom: 1rem;
`;

const ReviewDate = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const SimilarMoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const MovieCard = styled.div`
  background-color: #2f2f2f;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.8);
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
`;

const MovieInfo = styled.div`
  padding: 1rem;
`;

const MovieTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MovieRating = styled.p`
  font-size: 0.9rem;
  color: #46d369;
`;

const OfficialLink = styled.a`
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #e50914;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f6121d;
    transform: scale(1.05);
  }
`;

const TrailerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TrailerContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 1200px;
  aspect-ratio: 16 / 9;
  background-color: black;
  border-radius: 10px;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -3rem;
  right: 0;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  z-index: 1001;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
  }
`;

export default MovieDetails;