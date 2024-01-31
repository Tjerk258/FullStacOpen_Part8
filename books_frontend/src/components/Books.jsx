import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import {  useState } from "react"

const Books = (props) => {
  const [filter, setFilter] = useState('')
  const variable = filter ? {genre: filter}: {}
  const response = useQuery(ALL_BOOKS, {variables: variable} )


  if (!props.show) {
    return null
  } if (response.loading) {
    return <div>Loading...</div>
  }
  const books = response.data.allBooks
  const genres = ['refactoring', 'agile', 'patterns', 'design', 'crime', 'classic']

  const filterHandle = ({target}) => {
    response.refetch()
    setFilter(target.value)
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.filter(book => filter ? book.genres.includes(filter) : true).map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Filter</h3>
      <div>
        Genre
        <select value={filter} onChange={filterHandle}>
          <option value=''>All Genres</option>
          {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
        </select>
        {/* <input value={name} onChange={({ target }) => setName(target.value)} /> */}
      </div>
    </div>
  )
}

export default Books
