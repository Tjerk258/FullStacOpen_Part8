import { useMutation, useQuery } from "@apollo/client"
import { ALL_AUTHORS, CHANGE_AUTHOR } from "../queries"
import { useState } from "react"

const SetBirthYear = ({authors}) => {
  const [changeAuthor] = useMutation(CHANGE_AUTHOR, {
      refetchQueries: [{ query: ALL_AUTHORS }],
      onError: (error) => {
        const messages = error.graphQLErrors.map((e) => e.message).join("\n");
        console.log(messages);
      },
  })

  const [name, setName] = useState("")
  const [born, setBorn] = useState("")

  const submit = async (event) => {
    event.preventDefault();
    changeAuthor({variables: {name, born: Number(born)}})
    setName("Select Author")
    setBorn("")
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          author
          <select value={name} onChange={({target}) => setName(target.value)}>
            <option value='Select Author'>Select Author...</option>
            {authors.map(author => <option key={author.id} value={author.name}>{author.name}</option>)}
          </select>
          {/* <input value={name} onChange={({ target }) => setName(target.value)} /> */}
        </div>
        <div>
          published
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">Update Year</button>
      </form>
    </div>
  )
}

const Authors = (props) => {
  const response = useQuery(ALL_AUTHORS)

  if (!props.show) {
    return null
  }
  if (response.loading) {
    return <div>Loading...</div>
  }

  const authors = response.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirthYear authors={authors} />
    </div>
  );
};

export default Authors;
