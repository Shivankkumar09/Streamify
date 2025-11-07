import { signOut } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { firebaseAuth } from "../utils/firebase-config";
import { FaPowerOff, FaSearch, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchResults } from "../store/index";

export default function Navbar({ isScrolled }) {
  const dispatch = useDispatch();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchResults = useSelector((state) => state.netflix.searchResults);

  const links = [
    { name: "Home", link: "/" },
    { name: "TV Shows", link: "/tv" },
    { name: "Movies", link: "/movies" },
    { name: "My List", link: "/mylist" },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setIsSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    dispatch(fetchSearchResults(""));
    setIsSearching(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchTerm("");
    dispatch(fetchSearchResults(""));
    setIsSearching(false);
  };

  // Improved debouncing with 600ms delay
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        dispatch(fetchSearchResults(searchTerm));
        setIsSearching(false);
      } else {
        dispatch(fetchSearchResults(""));
        setIsSearching(false);
      }
    }, 600); 

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, dispatch]);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchTerm("");
        dispatch(fetchSearchResults(""));
        setIsSearching(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showSearch, dispatch]);

  return (
    <Container>
      <nav className={`${isScrolled ? "scrolled" : ""} flex`}>
        <div className="left flex a-center">
          <div className="brand flex a-center j-center">
            <h1>STREAMIFY</h1>
          </div>
          <ul className="links flex">
            {links.map(({ name, link }) => (
              <li key={name}>
                <Link to={link}>{name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="right flex a-center">
          <div className={`search ${showSearch ? "show-search" : ""}`}>
            <button 
              className="search-icon-btn"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              <FaSearch />
            </button>

            <div
              className="search-box"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setTimeout(() => {
                    closeSearch();
                  }, 200);
                }
              }}
            >
              <div className="search-input-wrapper">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <button 
                    className="clear-btn"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {showSearch && searchTerm && (
                <div className="search-dropdown">
                  {isSearching ? (
                    <div className="search-loading">
                      <div className="spinner"></div>
                      <span>Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <ul className="search-results">
                        {searchResults.slice(0, 8).map((movie) => (
                          <Link 
                            to={`/movie/${movie.id}`} 
                            key={movie.id}
                            onClick={closeSearch}
                          >
                            <li className="search-item">
                              <img
                                src={
                                  movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                    : "https://via.placeholder.com/92x138?text=No+Image"
                                }
                                alt={movie.title || movie.name}
                              />
                              <div className="item-info">
                                <span className="item-title">
                                  {movie.title || movie.name}
                                </span>
                                <span className="item-year">
                                  {movie.release_date 
                                    ? new Date(movie.release_date).getFullYear()
                                    : movie.first_air_date 
                                    ? new Date(movie.first_air_date).getFullYear()
                                    : "N/A"}
                                </span>
                              </div>
                            </li>
                          </Link>
                        ))}
                      </ul>
                      {searchResults.length > 8 && (
                        <div className="show-more">
                          +{searchResults.length - 8} more results
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-results">
                      <FaSearch />
                      <p>No results found for "{searchTerm}"</p>
                      <span>Try searching with different keywords</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button className="logout" onClick={() => signOut(firebaseAuth)}>
            <FaPowerOff />
          </button>
        </div>
      </nav>
    </Container>
  );
}

const Container = styled.div`
  .scrolled {
    background-color: black;
  }

  nav {
    position: sticky;
    top: 0;
    height: 6.5rem;
    width: 100%;
    justify-content: space-between;
    position: fixed;
    top: 0;
    z-index: 2;
    padding: 0 4rem;
    align-items: center;
    transition: 0.3s ease-in-out;

    .left {
      gap: 2rem;
      .brand {
        h1 {
          font-size: 3.5rem;
          font-family: "Bebas Neue", sans-serif;
          font-weight: 500;
          color: #e50914;
        }
      }
      .links {
        list-style-type: none;
        gap: 2rem;
        li a {
          color: white;
          text-decoration: none;
          font-size: 1.2rem;
        }
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .search {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 50px;
        padding: 0.5rem 1rem;
        transition: all 0.3s ease-in-out;
        border: 2px solid transparent;

        &.show-search {
          background-color: rgba(0, 0, 0, 0.85);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .search-icon-btn {
          background-color: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: transform 0.2s ease;
          
          svg {
            color: white;
            font-size: 1.5rem;
          }

          &:hover {
            transform: scale(1.1);
          }
        }

        .search-box {
          position: relative;
          display: flex;
          flex-direction: column;
          outline: none;

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            input {
              width: 0;
              opacity: 0;
              visibility: hidden;
              transition: all 0.3s ease-in-out;
              background-color: transparent;
              border: none;
              color: white;
              font-size: 1rem;
              
              &::placeholder {
                color: rgba(255, 255, 255, 0.6);
              }

              &:focus {
                outline: none;
              }
            }

            .clear-btn {
              position: absolute;
              right: 0.5rem;
              background: none;
              border: none;
              color: rgba(255, 255, 255, 0.6);
              cursor: pointer;
              display: flex;
              align-items: center;
              padding: 0.3rem;
              transition: all 0.2s ease;
              opacity: 0;
              visibility: hidden;

              svg {
                font-size: 1rem;
              }

              &:hover {
                color: white;
                transform: scale(1.1);
              }
            }
          }

          .search-dropdown {
            position: absolute;
            top: calc(100% + 1rem);
            right: 0;
            background-color: #181818;
            border-radius: 8px;
            width: 400px;
            max-height: 500px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideDown 0.3s ease-out;

            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            &::-webkit-scrollbar {
              width: 8px;
            }

            &::-webkit-scrollbar-track {
              background: #181818;
            }

            &::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 4px;

              &:hover {
                background: #555;
              }
            }

            .search-loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 3rem 2rem;
              gap: 1rem;

              .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(229, 9, 20, 0.2);
                border-top-color: #e50914;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }

              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }

              span {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.95rem;
              }
            }

            .search-results {
              list-style: none;
              padding: 0.5rem;
              margin: 0;

              a {
                text-decoration: none;
              }

              .search-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.8rem;
                border-radius: 6px;
                color: white;
                transition: all 0.2s ease;
                cursor: pointer;

                img {
                  width: 50px;
                  height: 75px;
                  object-fit: cover;
                  border-radius: 4px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .item-info {
                  display: flex;
                  flex-direction: column;
                  gap: 0.3rem;
                  flex: 1;

                  .item-title {
                    font-size: 1rem;
                    font-weight: 500;
                    color: white;
                    line-height: 1.3;
                  }

                  .item-year {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.6);
                  }
                }

                &:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                  transform: translateX(5px);
                }
              }
            }

            .show-more {
              text-align: center;
              padding: 1rem;
              color: rgba(255, 255, 255, 0.6);
              font-size: 0.9rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              background: rgba(229, 9, 20, 0.05);
            }

            .no-results {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 3rem 2rem;
              gap: 0.8rem;
              text-align: center;

              svg {
                font-size: 3rem;
                color: rgba(255, 255, 255, 0.3);
              }

              p {
                color: white;
                font-size: 1.1rem;
                font-weight: 500;
                margin: 0;
              }

              span {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.9rem;
              }
            }
          }
        }

        &.show-search {
          .search-input-wrapper {
            input {
              width: 300px;
              opacity: 1;
              visibility: visible;
              padding: 0.3rem 2.5rem 0.3rem 0.5rem;
            }

            .clear-btn {
              opacity: 1;
              visibility: visible;
            }
          }
        }

        @media (max-width: 768px) {
          &.show-search {
            .search-input-wrapper input {
              width: 200px;
            }

            .search-box .search-dropdown {
              width: 320px;
              right: -60px;
            }
          }
        }

        @media (max-width: 480px) {
          &.show-search {
            .search-input-wrapper input {
              width: 150px;
            }

            .search-box .search-dropdown {
              width: 280px;
              right: -80px;
            }
          }
        }
      }

      .logout {
        background-color: transparent;
        border: none;
        cursor: pointer;
        svg {
          color: #e50914;
          font-size: 1.5rem;
        }
      }
    }
  }
`;
