import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/blogImages");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
var blogDataBase = [];

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function generateUniqueId(n) {
  let id = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < n; i++) {
    id += characters[Math.floor(Math.random() * characters.length)];
  }
  return id;
}

class Blog {
  constructor(image, title, para) {
    this.id = generateUniqueId(12);
    this.date = new Date().toLocaleString("en-GB", {
      hour12:true,
    });
    this.image = image;
    this.title = title;
    this.para = para;
  }
}

app.get("/", (_, res) => {
  if (blogDataBase.length === 0) {
    blogDataBase.push(new Blog("blog.png", "Test", "hi how are you?"));
  }

  res.render("home.ejs", { blogs: blogDataBase });
});

app.get("/show/blog/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).redirect("/");
    }

    const blog = blogDataBase.find((b) => b.id === id);

    if (!blog) {
      return res.status(404).redirect("/");
    }

    return res.status(200).render("blog.ejs", { blog });
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/");
  }
});

app.get("/write", (_, res) => {
  res.render("write.ejs", { blogs: blogDataBase });
});

app.post("/write/blog", upload.single("image"), (req, res) => {
  try {
    const { title, para } = req.body;
    const { filename } = req.file;

    if (!filename || !title || !para) {
      return res.status(400).send({ message: "Fill all the fields." });
    }

    let newBlog = new Blog(filename, title, para);
    blogDataBase.push(newBlog);

    return res.status(200).redirect("/write");
  } catch (error) {
    console.error(error);
  }
});

app.get("/edit/blog/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).redirect("/write");
    }

    const blog = blogDataBase.find((b) => b.id === id);

    if (!blog) {
      return res.status(404).redirect("/write");
    }

    return res.status(200).render("edit.ejs", { blog });
  } catch (error) {
    console.error(error);
    return res.status(500).redirect("/write");
  }
});

app.post("/edit/blog", upload.single("image"), (req, res) => {
  try {
    const { id, title, para } = req.body;

    if (!id || !title || !para) {
      return res.status(400).render("partials/alert.ejs", {
        message: "400 Please fill all the fields",
      });
    }

    const blogIndex = blogDataBase.findIndex((b) => b.id === id);

    if (blogIndex === -1) {
      return res.status(404).render("partials/alert.ejs", {
        message: "404 Blog Not Found",
      });
    }

    if (req.file) {
      const { filename } = req.file;
      if (blogDataBase[blogIndex].image !== "blog.png") {
        fs.unlink(
          `./public/blogImages/${blogDataBase[blogIndex].image}`,
          (err) => {
            if (err) {
              console.error(err);
              throw new Error("File deletion Error");
            }
          }
        );
      }
      blogDataBase[blogIndex].image = filename;
    }

    blogDataBase[blogIndex].title = title;
    blogDataBase[blogIndex].para = para;

    return res.status(200).redirect("/write");
  } catch (error) {
    console.error(error);
    return res.status(500).render("partials/alert.ejs", {
      message: "500 " + error.message,
    });
  }
});

app.delete("/delete/blog", (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Blog id is missing." });
    }

    const blogId = blogDataBase.findIndex((blog) => blog.id === id);
    if (blogId === -1) {
      return res.status(404).send({ message: "Blog post not Found" });
    }
    if (blogDataBase[blogId].image !== "blog.png") {
      fs.unlink(`./public/blogImages/${blogDataBase[blogId].image}`, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    blogDataBase.splice(blogId, 1);

    res.status(200).send({ message: "Blog Deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

function cleanupStorage() {
  try {
    console.log("Cleaning up the blogImage folder");

    const files = fs.readdirSync("./public/blogImages");

    for (const file of files) {
      if (file !== "blog.png") {
        fs.unlinkSync(`./public/blogImages/${file}`, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  cleanupStorage();
});
