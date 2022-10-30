const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  blogs.forEach(blog => {
    total += blog.likes
  })
  return total
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {}

  const total = blogs.reduce((a, b) => {
    return (a.likes >= b.likes) ? a : b
  })

  delete total.__v
  delete total._id
  delete total.url
  return total
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}

  const groupByAuthor = _.groupBy(blogs, blog => blog.author)
  const authors = _.keys(groupByAuthor)
  const blogsWithAuthors = authors.map(author => {
    return {
      author,
      blogs: groupByAuthor[author].length
    }
  })

  return blogsWithAuthors.reduce((a, b) => a.blogs >= b.blogs ? a : b)
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {}

  const groupByAuthor = _.groupBy(blogs, blog => blog.author)
  const authors = _.keys(groupByAuthor)
  return _(authors)
    .map(author => {
      return {
        author,
        likes: _.sumBy(groupByAuthor[author], 'likes')
      }
    })
    .reduce((a, b) => a.likes >= b.likes ? a : b)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
