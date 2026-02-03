const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const GENRES = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

const fetchMovies = async (endpoint, page = 1) => {
    if (!API_KEY) {
        console.warn("TMDB API Key is missing. Please check your .env file.");
        return [];
    }

    try {
        const response = await fetch(`${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`);
        const data = await response.json();

        if (!data.results) {
            return [];
        }

        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            genre: movie.genre_ids.map(id => GENRES[id]).slice(0, 2).join(' / ') || 'Unknown',
            year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
            backdrop: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            rating: movie.vote_average,
            desc: movie.overview
        }));
    } catch (error) {
        console.error(`Error fetching ${endpoint} movies from TMDB:`, error);
        return [];
    }
};

export const fetchPopularMovies = (page = 1) => fetchMovies('popular', page);
export const fetchTopRatedMovies = (page = 1) => fetchMovies('top_rated', page);
export const fetchUpcomingMovies = (page = 1) => fetchMovies('upcoming', page);

export const fetchDiscoverMovies = async (filters = {}, page = 1) => {
    if (!API_KEY) return [];

    let queryParams = `&page=${page}&sort_by=popularity.desc`;

    if (filters.genre) {
        queryParams += `&with_genres=${filters.genre}`;
    }

    if (filters.minRating) {
        queryParams += `&vote_average.gte=${filters.minRating}`;
    }

    if (filters.year) {
        queryParams += `&primary_release_year=${filters.year}`;
    }

    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US${queryParams}`);
        const data = await response.json();

        if (!data.results) {
            return [];
        }

        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            genre: movie.genre_ids.map(id => GENRES[id] || 'Unknown').slice(0, 2).join(' / ') || 'Unknown',
            year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
            backdrop: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            rating: movie.vote_average,
            desc: movie.overview
        }));
    } catch (error) {
        console.error("Error discovering movies:", error);
        return [];
    }
};

export const fetchMovieVideos = async (movieId) => {
    if (!API_KEY) return [];
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching videos for movie ${movieId}:`, error);
        return [];
    }
};

export const fetchWatchProviders = async (movieId) => {
    if (!API_KEY) return null;
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results?.US || null; // Default to US for now, or make dynamic later
    } catch (error) {
        console.error(`Error fetching watch providers for movie ${movieId}:`, error);
        return null;
    }
};

export const fetchMovieDetails = async (movieId) => {
    if (!API_KEY) return null;
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
        const movie = await response.json();

        if (!movie || movie.success === false) return null;

        return {
            id: movie.id,
            title: movie.title,
            genre: movie.genres ? movie.genres.map(g => g.name).slice(0, 2).join(' / ') : 'Unknown',
            year: movie.release_date ? movie.release_date.split('-')[0] : 'Unknown',
            image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image',
            backdrop: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : null,
            rating: movie.vote_average,
            desc: movie.overview
        };
    } catch (error) {
        console.error(`Error fetching movie details for ${movieId}:`, error);
        return null;
    }
};
