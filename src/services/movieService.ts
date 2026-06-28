import axios from 'axios'

import type { MoviesResponse } from '../types/movie'

const movieApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
})

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500'

async function fetchMovieCollection(
  endpoint: string,
  page = 1,
  query?: string,
): Promise<MoviesResponse> {
  const response = await movieApi.get<MoviesResponse>(endpoint, {
    params: {
      include_adult: false,
      language: 'uk-UA',
      page,
      ...(query ? { query } : {}),
    },
    headers: {
      Authorization: getAuthorizationHeader(),
    },
  })

  return response.data
}

function getAuthorizationHeader(): string {
  const token = import.meta.env.VITE_TMDB_TOKEN?.trim()

  if (!token) {
    throw new Error(
      'Не знайдено VITE_TMDB_TOKEN. Додайте токен TMDB у файл .env.',
    )
  }

  return `Bearer ${token}`
}

export async function fetchMovies(
  query: string,
  page = 1,
): Promise<MoviesResponse> {
  return fetchMovieCollection('/search/movie', page, query)
}

export async function fetchPopularMovies(page = 1): Promise<MoviesResponse> {
  return fetchMovieCollection('/movie/popular', page)
}

export function getPosterUrl(posterPath: string): string {
  return `${POSTER_BASE_URL}${posterPath}`
}
