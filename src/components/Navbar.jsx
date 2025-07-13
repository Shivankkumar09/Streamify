import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { firebaseAuth } from "../utils/firebase-config";
import { FaPowerOff, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchResults } from "../store/index";

export default function Navbar({ isScrolled }) {
  const dispatch = useDispatch();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useSelector((state) => state.netflix.searchResults);

  const links = [
    { name: "Home", link: "/" },
    { name: "TV Shows", link: "/tv" },
    { name: "Movies", link: "/movies" },
    { name: "My List", link: "/mylist" },
  ];

  const handleSearch = (e) => {
  setSearchTerm(e.target.value);
};

 useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchTerm.trim()) {
      dispatch(fetchSearchResults(searchTerm));
    } else {
      dispatch(fetchSearchResults(""));
    }
  }, 400); // 400ms debounce delay

  return () => clearTimeout(delayDebounce);
}, [searchTerm, dispatch]);

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
            <button onClick={() => setShowSearch(!showSearch)}>
              <FaSearch />
            </button>

            <div
              className="search-box"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setTimeout(() => {
                    setShowSearch(false);
                    setSearchTerm("");
                    dispatch(fetchSearchResults(""));
                  }, 150);
                }
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />

              {searchTerm && searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((movie) => (
                    <Link to={`/movie/${movie.id}`} key={movie.id}>
                      <li className="search-item">
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                              : "https://via.placeholder.com/92x138?text=No+Image"
                          }
                          alt={movie.title}
                        />
                        <span>{movie.title || movie.name}</span>
                      </li>
                    </Link>
                  ))}
                </ul>
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
        transition: 0.3s ease-in-out;

        input {
          width: 0;
          opacity: 0;
          visibility: hidden;
          transition: width 0.3s ease-in-out;
          background-color: transparent;
          border: none;
          color: white;
          &:focus {
            outline: none;
          }
        }

        &.show-search input {
          width: 200px;
          opacity: 1;
          visibility: visible;
          padding: 0.3rem;
        }

        button {
          background-color: transparent;
          border: none;
          cursor: pointer;
          svg {
            color: white;
            font-size: 1.5rem;
          }
        }

        .search-box {
          position: relative;
          display: flex;
          flex-direction: column;
          outline: none;

          .search-results {
            position: absolute;
            top: 110%;
            left: 0;
            background-color: #1f1f1f;
            border-radius: 8px;
            list-style: none;
            padding: 0.5rem;
            width: 250px;
            z-index: 10;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);

            a {
              text-decoration: none;
            }

            .search-item {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 0.3rem 0.4rem;
              border-radius: 4px;
              color: white;

              img {
                width: 45px;
                height: auto;
                border-radius: 4px;
              }

              span {
                font-size: 0.95rem;
              }

              &:hover {
                background-color: #333;
              }
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
