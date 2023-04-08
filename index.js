// index.js

// Impoting Neccessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Express app initialization
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the movie schema
const movieSchema = new mongoose.Schema({
    title: String,
    overview: String,
    poster_path: String,
    release_date: Date,
    vote_average: Number,
    original_language: String,
  });

// Define the watchlist item schema
const watchlistItemSchema = new mongoose.Schema({
    movieId: Number,
    title: String,
    poster_path: String,
    watched: Boolean,
  });

// Define the movie and watchlist model
const Movie = mongoose.model('Movie', movieSchema);
const WatchlistItem = mongoose.model('WatchlistItem', watchlistItemSchema);

// import api key from env file and get base url
const API_KEY = process.env.MOVIE_DB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// GET /movies endpoint
app.get('/movies', async (req, res) => {
  try {
    const { page, sort_by, year, language } = req.query;
    const response = await axios.get(`${BASE_URL}/discover/movie`, {
      params: {
        api_key: API_KEY,
        page: page || 1,
        sort_by: sort_by || 'popularity.desc',
        primary_release_year: year || '',
        with_original_language: language || ''
      }
    });
    const { results, total_pages } = response.data;
    const updatedResults = results.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date
    }));
    res.json({ results: updatedResults, total_pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /movies/:id endpoint 
app.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// creating a service to fecth movie by id for crud watchlist 
// Memoization caching strategy to prevent rate limiting
const memoize = (fn) => {
  const cache = new Map();
  return async (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
};

const fetchMovieById = memoize(async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}`, {
    params: { api_key: API_KEY },
  });
  return response.data;
});


// POST /watchlist post watchlist 
app.post('/watchlist', async (req, res) => {
  const { movieId } = req.body;
  try {
    const movie = await fetchMovieById(movieId);
    const savedMovie = await Movie.create(movie);
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// GET /watchlist get watchlist 
router.get('/watchlist', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// GET / test endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(5050, () => {
  console.log('Server is running on port 5050');
});