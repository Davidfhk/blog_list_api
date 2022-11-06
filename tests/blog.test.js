/* eslint-env jest */
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'David',
    url: 'www.david.com',
    likes: 3
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'Meloncia',
    url: 'www.meloncia.com',
    likes: 5
  }
]

const newBlog = {
  title: 'I am learning Test with Jest',
  author: 'David',
  url: 'www.david.com',
  likes: 3
}

const newBlogWithoutLikes = {
  title: 'post without likes',
  author: 'David without likes',
  url: 'www.david.com'
}

const newBlogWithoutTitleAndUrl = {
  author: 'David without likes'
}

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

describe('viewing all blogs', () => {
  test('it should get all blogs', async () => {
    const response = await request(app).get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('it should check that the blog has a id property', async () => {
    const response = await request(app).get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200)

    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('trying to create a new blog', () => {
  test('it should to create a new blog', async () => {
    await request(app).post('/api/blogs')
      .send(newBlog)
      .set('Accept', 'application/json')
      .expect(201)

    const response = await request(app).get('/api/blogs')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(response.body).toHaveLength(initialBlogs.length + 1)
  })

  test('it should to check if likes is isset', async () => {
    await request(app).post('/api/blogs')
      .send(newBlogWithoutLikes)
      .set('Accept', 'application/json')
      .expect(201)
    const blogWithoutLikes = await Blog.findOne({ author: 'David without likes' }).select('likes').exec()
    expect(blogWithoutLikes.likes).toBe(0)
  })

  test('it should to return a status code 400 Bad Request', async () => {
    await request(app).post('/api/blogs')
      .send(newBlogWithoutTitleAndUrl)
      .set('Accept', 'application/json')
      .expect(400)
  })
})

describe('Deleting a post', () => {
  test('it should to delete a post of the blog', async () => {
    const postId = await Blog.findOne({ author: 'David' }).select('id').exec()

    await request(app).delete(`/api/blogs/${postId.id}`)
      .expect(204)

    await request(app).get(`/api/blogs/${postId.id}`)
      .expect(404)
  })
})

describe('Updating a post', () => {
  test('it should to update a post of the blog', async () => {
    const post = await Blog.findOne({ author: 'David' }).select('id likes').exec()
    expect(post.likes).toBe(3)

    const response = await request(app).put(`/api/blogs/${post.id}`)
      .send({ likes: 10 })
      .set('Accept', 'application/json')
      .expect(200)
    expect(response.body.likes).toBe(10)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
