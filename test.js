const axios = require('axios');

// import api key from env file and get base url
const API_KEY = process.env.MOVIE_DB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';


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


jest.mock('axios');

describe('fetchMovieById', () => {
  it('should return movie data from API', async () => {
    const movieData = {
      id: 123,
      title: 'The Matrix',
      overview: 'A computer hacker learns about the true nature of reality.',
      poster_path: '/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg',
      release_date: '1999-03-30',
      vote_average: 8.1,
      original_language: 'en',
    };
    axios.get.mockResolvedValueOnce({ data: movieData });

    const result = await fetchMovieById(123);

    expect(result).toEqual(movieData);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/123',
      { params: { api_key: process.env.MOVIE_DB_API_KEY } },
    );
  });

  it('should return cached data for subsequent calls with same arguments', async () => {
    const movieData = {
      id: 123,
      title: 'The Matrix',
      overview: 'A computer hacker learns about the true nature of reality.',
      poster_path: '/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg',
      release_date: '1999-03-30',
      vote_average: 8.1,
      original_language: 'en',
    };
    axios.get.mockResolvedValueOnce({ data: movieData });

    const result1 = await fetchMovieById(123);
    const result2 = await fetchMovieById(123);

    expect(result1).toEqual(movieData);
    expect(result2).toEqual(movieData);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/123',
      { params: { api_key: process.env.MOVIE_DB_API_KEY } },
    );
  });

  it('should throw an error if API call fails', async () => {
    const errorMessage = 'Internal server error';
    axios.get.mockRejectedValueOnce({ response: { data: { error: errorMessage } } });

    await expect(fetchMovieById(123)).rejects.toThrowError(errorMessage);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
