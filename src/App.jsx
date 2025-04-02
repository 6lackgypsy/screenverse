import { useEffect, useState } from "react"
import Search from "./components/Search"
import Spinner from "./components/Spinner"
import MovieCard from "./components/MovieCard"
import { useDebounce } from "react-use"
import { getTrendingMovies, updateSearchCount } from "./appwrite"

const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [movies, setMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [moviesError, setMoviesError] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingMoviesError, setTrendingMoviesError] = useState("")
  const [loadingTrendingMovies, setLoadingTrendingMovies] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = "") => {
    setLoadingMovies(true)
    setMoviesError("")

    try {
      const endpoint = !query
        ? `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
        : `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }

      const data = await response.json()

      if (data.Response === "False") {
        setMoviesError(data.Error || "Failed to fetch movies")
        setMovies([])
        return
      }

      setMovies(data.results || [])

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
      }
    } catch (err) {
      console.error(err)
      setMovies("Error fetching movies. Try again later.")
    } finally {
      setLoadingMovies(false)
    }
  }

  const loadTrendingMovies = async () => {
    setLoadingTrendingMovies(true)
    setTrendingMoviesError("")

    try {
      const movies = await getTrendingMovies()

      setTrendingMovies(movies)
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`)
      setTrendingMoviesError("Error fetching trending movies")
    } finally {
      setLoadingTrendingMovies(false)
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            {loadingTrendingMovies ? (
              <Spinner />
            ) : trendingMoviesError ? (
              <p className="text-red-500">{trendingMoviesError}</p>
            ) : (
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <section className="all-movies">
          <h2>All Movies</h2>
          {loadingMovies ? (
            <Spinner />
          ) : moviesError ? (
            <p className="text-red-500">{moviesError}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
