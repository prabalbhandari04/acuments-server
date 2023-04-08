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

// Define the movie model
const Movie = mongoose.model('Movie', movieSchema);
// Define the watchlist item model
const WatchlistItem = mongoose.model('WatchlistItem', watchlistItemSchema);
