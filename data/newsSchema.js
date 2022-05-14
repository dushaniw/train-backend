
import { makeExecutableSchema } from 'graphql-tools';

import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();
const ADDED_NEW_BLOG_POST = 'new_blog_post';
let counter = 3;

const schemaString = `
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  blogPosts: [BlogPost]
  blogPost(id: String): BlogPost
}

type Mutation {
  addBlogPost(title: String, content: String, author: String): BlogPost
}

type Subscription {
  newBlogPost: BlogPost
}

type BlogPost {
  id: String
  title: String
  content: String
  author: String
}
`;

let blogPosts = [
  {
    id: '1000',
    title: 'Blog Post 1',
    content : 'This is the first blog post',
    author: 'James Smith',
  },
  {
    id: '1001',
    title: 'Blog Post 2',
    content : 'This is the second blog post',
    author : 'John Doe',
  },
];

let blogPostData = {};
blogPosts.forEach((post) => {
  blogPostData[post.id] = post;
});

function getPost(id) {
  return blogPostData[id];
}

function getAllPosts() {
    return blogPosts;
}

const resolvers = {
  Query: {
    blogPosts: (_root, _args) => {
      return getAllPosts()},
    blogPost: (_root, { id }) => getPost(id),
  },
  Mutation: {
    addBlogPost: (_root, { title, content, author }) => {
      let id = counter;
      let post = { id: counter, title: title, content: content, author: author}
      blogPostData["id"] = post;
      blogPosts.push(post);
      pubsub.publish(ADDED_NEW_BLOG_POST, {newBlogPost: post});
      counter ++;
      return post;
    },
  },
  Subscription: {
    newBlogPost: {
        subscribe: () => pubsub.asyncIterator(ADDED_NEW_BLOG_POST),
    },
  },
}

export const NewsAppSchema = makeExecutableSchema({
  typeDefs: [schemaString],
  resolvers
});
