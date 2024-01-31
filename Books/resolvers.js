const { PubSub } = require('graphql-subscriptions');
const Book = require('./models/books');
const Author = require('./models/author')
const pubsub = new PubSub()
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require("graphql");

const resolvers = {
  Query: {
    bookCount: async () => await Book.find({}).length,
    authorCount: async () => await Author.find({}).length,
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author');
      console.log(books)
      if (args.author && args.genre)
        return books.filter(
          (book) =>
            book.author.name === args.author && book.genres.includes(args.genre)
        );
      else if (args.genre)
        return books.filter((book) => book.genres.includes(args.genre));
      else if (args.author)
        return books.filter((book) => book.author.name === args.author);
      else return books
    },
    allAuthors: async () => await Author.find({}),
    me: (root, args, context) => context.currentUser
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })
      try {
        if (!author) {
          const newAuthor = new Author({ name: args.author, bookCount: 1 })
          author = await newAuthor.save()
        } else {
          const newAuthor = { ...author._doc, bookCount: author.bookCount+1 }
          delete newAuthor._id
          console.log(newAuthor);
          author = await Author.findByIdAndUpdate(author._id, newAuthor, { new: true, runValidators: true, context: 'query' })
        }
        const book = new Book({ ...args, author: author._id })
        const newBook = await book.save()
        await newBook.populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
        return book;

      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: error.message,
            invalidArgs: args.name,
            error
          }
        })
      }
    },
    editAuthor: async (root, args) => {
      const oldAuthor = await Author.findOne({ name: args.name })
      const author = { ...oldAuthor._doc, born: args.setBornTo || null }
      let newAuthor
      console.log({ ...oldAuthor._doc }, author);
      const id = author._id
      delete author._id

      try {
        newAuthor = await Author.findByIdAndUpdate(id, author, { new: true, runValidators: true, context: 'query' })
      } catch (error) {
        throw new GraphQLError('Chagning author failed', {
          extensions: {
            code: error.message,
            invalidArgs: args.born,
            error
          }
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username })

      try {
        const newUser = await user.save()
        return newUser
      } catch (error) {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
};

module.exports = resolvers