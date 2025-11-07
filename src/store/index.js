import {
    configureStore,
    createAsyncThunk,
    createSlice,
  } from "@reduxjs/toolkit";
  import axios from "axios";
  import { API_KEY, TMDB_BASE_URL } from "../utils/constants";
  import { firebaseDB } from "../utils/firebase-config";
  import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
//store
  
  const initialState = {
    movies: [],
    genresLoaded: false,
    genres: [],
    searchResults: [],
    likedMovies: [],
  };
  
  export const getGenres = createAsyncThunk("netflix/genres", async () => {
    const {
      data: { genres },
    } = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
    );
    return genres;
  });
  
  const createArrayFromRawData = (array, moviesArray, genres) => {
    array.forEach((movie) => {
      const movieGenres = [];
      movie.genre_ids.forEach((genre) => {
        const name = genres.find(({ id }) => id === genre);
        if (name) movieGenres.push(name.name);
      });
      if (movie.backdrop_path)
        moviesArray.push({
          id: movie.id,
          name: movie?.original_name ? movie.original_name : movie.original_title,
          image: movie.backdrop_path,
          genres: movieGenres.slice(0, 3),
        });
    });
  };
  
  const getRawData = async (api, genres, paging = false) => {
    const moviesArray = [];
    for (let i = 1; moviesArray.length < 60 && i < 10; i++) {
      const {
        data: { results },
      } = await axios.get(`${api}${paging ? `&page=${i}` : ""}`);
      createArrayFromRawData(results, moviesArray, genres);
    }
    return moviesArray;
  };
  
  export const fetchDataByGenre = createAsyncThunk(
    "netflix/genre",
    async ({ genre, type }, thunkAPI) => {
      const {
        netflix: { genres },
      } = thunkAPI.getState();
      return getRawData(
        `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${genre}`,
        genres
      );
    }
  );
  
  export const fetchMovies = createAsyncThunk(
    "netflix/trending",
    async ({ type }, thunkAPI) => {
      const {
        netflix: { genres },
      } = thunkAPI.getState();
      return getRawData(
        `${TMDB_BASE_URL}/trending/${type}/week?api_key=${API_KEY}`,
        genres,
        true
      );
    }
  );

  export const fetchSearchResults = createAsyncThunk(
    "netflix/search",
    async (searchTerm) => {
      if (!searchTerm) return []; // Return empty if no input
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`
      );
      return data.results.slice(0, 5); // Return top 5 search results
    }
  );
  
  export const getUsersLikedMovies = createAsyncThunk(
    "netflix/getLiked",
    async (email) => {
      try {
        console.log("Fetching liked movies for:", email);
        const userDocRef = doc(firebaseDB, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Liked movies found:", data.likedMovies);
          return data.likedMovies || [];
        }
        console.log("No liked movies document found for user");
        return [];
      } catch (error) {
        console.error("❌ Error fetching liked movies:", error);
        console.error("Error details:", error.message);
        return [];
      }
    }
  );
  
  export const addMovieToLiked = createAsyncThunk(
    "netflix/addLiked",
    async ({ email, movieData }) => {
      try {
        console.log("Adding movie to list:", movieData.name, "for user:", email);
        const userDocRef = doc(firebaseDB, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log("User document exists, updating...");
          await updateDoc(userDocRef, {
            likedMovies: arrayUnion(movieData)
          });
        } else {
          console.log("Creating new user document...");
          await setDoc(userDocRef, {
            email: email,
            likedMovies: [movieData]
          });
        }
        
        // Return updated list
        const updatedDoc = await getDoc(userDocRef);
        const updatedList = updatedDoc.data().likedMovies || [];
        console.log("✅ Movie added successfully! Total movies:", updatedList.length);
        return updatedList;
      } catch (error) {
        console.error("❌ Error adding movie to liked:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (error.code === 'permission-denied') {
          alert("⚠️ Permission Denied! Please enable Firestore in Firebase Console and update security rules.");
        } else {
          alert(`Error adding movie: ${error.message}`);
        }
        throw error;
      }
    }
  );
  
  export const removeMovieFromLiked = createAsyncThunk(
    "netflix/deleteLiked",
    async ({ movieId, email }) => {
      try {
        console.log("Removing movie ID:", movieId, "for user:", email);
        const userDocRef = doc(firebaseDB, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const currentMovies = userDoc.data().likedMovies || [];
          const movieToRemove = currentMovies.find(movie => movie.id === movieId);
          
          if (movieToRemove) {
            console.log("Movie found, removing:", movieToRemove.name);
            await updateDoc(userDocRef, {
              likedMovies: arrayRemove(movieToRemove)
            });
            
            // Return updated list
            const updatedDoc = await getDoc(userDocRef);
            const updatedList = updatedDoc.data().likedMovies || [];
            console.log("✅ Movie removed successfully! Remaining:", updatedList.length);
            return updatedList;
          } else {
            console.log("Movie not found in list");
          }
        }
        return [];
      } catch (error) {
        console.error("❌ Error removing movie from liked:", error);
        console.error("Error message:", error.message);
        throw error;
      }
    }
  );
  
  const NetflixSlice = createSlice({
    name: "Netflix",
    initialState,
    extraReducers: (builder) => {
      builder.addCase(getGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
        state.genresLoaded = true;
      });
      builder.addCase(fetchMovies.fulfilled, (state, action) => {
        state.movies = action.payload;
      });
      builder.addCase(fetchDataByGenre.fulfilled, (state, action) => {
        state.movies = action.payload;
      });
      builder.addCase(getUsersLikedMovies.fulfilled, (state, action) => {
        state.likedMovies = action.payload;
      });
      builder.addCase(addMovieToLiked.fulfilled, (state, action) => {
        state.likedMovies = action.payload;
      });
      builder.addCase(removeMovieFromLiked.fulfilled, (state, action) => {
        state.likedMovies = action.payload;
      });

      builder.addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      });
    },
  });
  
  export const store = configureStore({
    reducer: {
      netflix: NetflixSlice.reducer,
    },
  });
  
  export const { setGenres, setMovies } = NetflixSlice.actions;