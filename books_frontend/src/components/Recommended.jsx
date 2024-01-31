import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME } from "../queries"
import { useEffect, useState } from "react"

const Recommended = (props) => {
  const [filter, setFilter] = useState('')
  const response = useQuery(ALL_BOOKS)
  const meResponse = useQuery(ME)

  useEffect(() => {
    if (props.show && meResponse.data) {
      setFilter(meResponse.data.me.favoriteGenre)
      console.log(meResponse)
      meResponse.data = null
    }
  }, [meResponse])

  if (!props.show) {
    return null
  } if (response.loading) {
    return <div>Loading...</div>
  }

  const books = response.data.allBooks

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
    </div>
  )
}

export default Recommended
