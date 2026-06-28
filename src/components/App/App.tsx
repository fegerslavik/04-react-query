import { useEffect, useRef, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import ReactPaginateModule from 'react-paginate'
import type { ReactPaginateProps } from 'react-paginate'
import type { ComponentType } from 'react'
import { toast } from 'react-hot-toast'

import { fetchMovies } from '../../services/movieService'
import type { Movie } from '../../types/movie'
import ErrorMessage from '../ErrorMessage/ErrorMessage'
import Loader from '../Loader/Loader'
import MovieGrid from '../MovieGrid/MovieGrid'
import MovieModal from '../MovieModal/MovieModal'
import SearchBar from '../SearchBar/SearchBar'
import styles from './App.module.css'

const DEFAULT_ERROR_MESSAGE =
  'Не вдалося завантажити дані. Спробуйте повторити запит трохи пізніше.'

type ModuleWithDefault<T> = { default: T }

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default

export default function App() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const normalizedQuery = query.trim()
  const isSearchMode = normalizedQuery.length > 0
  const notifiedQueryRef = useRef<string | null>(null)

  const { data, error, isError, isPending } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(normalizedQuery, page),
    enabled: isSearchMode,
    placeholderData: keepPreviousData,
  })

  const movies = data?.results ?? []
  const totalPages = data?.total_pages ?? data?.total_page ?? 0

  function handleSelect(movie: Movie): void {
    setSelectedMovie(movie)
  }

  function handleCloseModal(): void {
    setSelectedMovie(null)
  }

  useEffect(() => {
    if (!isSearchMode) {
      notifiedQueryRef.current = null
      return
    }

    const hasNoResults = data !== undefined && data.total_results === 0

    if (hasNoResults && notifiedQueryRef.current !== query) {
      toast.error('No movies found for your request.')
      notifiedQueryRef.current = query
    }
  }, [data, isSearchMode, query])

  function handleSearch(nextQuery: string): void {
    setSelectedMovie(null)
    setPage(1)
    setQuery(nextQuery)
  }

  const errorMessage =
    error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE

  const shouldShowMovies = !isPending && !isError && movies.length > 0
  const shouldShowPagination = shouldShowMovies && totalPages > 1

  return (
    <main className={styles.app}>
      <SearchBar onSubmit={handleSearch} />

      <section className={styles.resultsSection}>
        {isPending && <Loader />}

        {isError && <ErrorMessage message={errorMessage} />}

        {shouldShowPagination && (
          <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={7}
            marginPagesDisplayed={0}
            breakLabel={null}
            onPageChange={({ selected }) => setPage(selected + 1)}
            forcePage={page - 1}
            containerClassName={styles.pagination}
            activeClassName={styles.active}
            nextLabel="→"
            previousLabel="←"
          />
        )}

        {shouldShowMovies && (
          <MovieGrid movies={movies} onSelect={handleSelect} />
        )}
      </section>

      {selectedMovie !== null && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </main>
  )
}
