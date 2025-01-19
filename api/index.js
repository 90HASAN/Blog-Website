import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Required for ES modules to define __dirname

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Set the views directory and view engine
app.set("views", path.resolve(__dirname, "../views")); // Correct path to the views folder
app.set("view engine", "ejs"); // Use EJS as the templating engine

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../public"))); // Serve static files from the public folder

const filePath = path.resolve(__dirname, "../blogs.json"); // Correct path to the blogs.json file

// Utility Functions
const readBlogsFromFile = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const writeBlogsToFile = (blogs) => {
  fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2), "utf8");
};

// Routes
app.get("/", (req, res) => {
  const blogs = readBlogsFromFile();
  res.render("index", { blogs: blogs }); // Render the index view
});

app.get("/add-blog", (req, res) => {
  res.render("form"); // Render the form view
});

app.post("/add", (req, res) => {
  const title_text = req.body.title;
  const description_text = req.body.description;

  const newBlog = {
    title: title_text,
    description: description_text,
  };

  let blogs = readBlogsFromFile();

  if (!Array.isArray(blogs)) {
    blogs = [];
  }

  blogs.push(newBlog);

  writeBlogsToFile(blogs);

  res.redirect("/");
});

app.get("/del-blog", (req, res) => {
  const { index } = req.query;

  fs.readFile(filePath, "utf8", (err, jsonString) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    try {
      let data = JSON.parse(jsonString);

      if (Array.isArray(data) && index >= 0 && index < data.length) {
        data.splice(index, 1);

        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
          if (err) {
            console.error("Error writing file:", err);
            res.status(500).json({ error: "Internal Server Error" });
          } else {
            console.log("File successfully updated");
            res.json({ success: true, message: "Blog deleted successfully" });
          }
        });
      } else {
        res.status(400).json({ error: "Invalid index" });
      }
    } catch (err) {
      console.error("Error parsing JSON string:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


export default app;