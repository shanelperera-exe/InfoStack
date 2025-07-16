import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Temporary in-memory storage
let posts = [];

// Home Page
app.get("/", (req, res) => {
  // Map posts to add a dynamic timeAgo field
  const postsWithTimeAgo = posts.map(post => ({
    ...post,
    timeAgo: dayjs(post.createdAt).fromNow()
  }));

  res.render("index.ejs", { posts: postsWithTimeAgo });
});

// Create Page (GET)
app.get("/create", (req, res) => {
  res.render("create.ejs");
});

// Create Post (POST)
app.post("/create", (req, res) => {
  const { title, author, image, content } = req.body;
  const newPost = {
    id: Date.now().toString(), // unique ID for now
    title,
    author,
    image,
    content,
    createdAt: new Date()  // <-- add createdAt field here
  };
  posts.unshift(newPost); // Add to top
  res.redirect("/");
});

// View Article
app.get("/article/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    const date = post.createdAt ? post.createdAt.toDateString() : "Unknown date";
    res.render("article.ejs", { ...post, date });
  } else {
    res.status(404).send("Post not found");
  }
});

// Edit Article Form (GET)
app.get("/edit/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    res.render("edit.ejs", { post });
  } else {
    res.status(404).send("Post not found");
  }
});

// Submit Edited Article (POST)
app.post("/article/:id/edit", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (post) {
    const { title, author, image, content } = req.body;
    post.title = title;
    post.author = author;
    post.image = image;
    post.content = content;
    // Optional: update createdAt or keep original post time
    res.redirect(`/article/${post.id}`);
  } else {
    res.status(404).send("Post not found");
  }
});

// Delete Article (POST)
app.post("/delete/:id", (req, res) => {
  const postIndex = posts.findIndex(p => p.id === req.params.id);
  if (postIndex !== -1) {
    posts.splice(postIndex, 1); // Remove the post
    res.redirect("/");
  } else {
    res.status(404).send("Post not found");
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
