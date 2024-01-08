const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const uri = "mongodb+srv://nitish:nitish9966@cluster0.tsuqmmv.mongodb.net/"; // Replace with your MongoDB connection string
const dbName = "Country_DB"; // Replace with your MongoDB database name

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

async function connectToDatabase() {
  const maxRetries = 5;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const client = new MongoClient(uri, { useNewUrlParser: true });
      await client.connect();
      return client.db(dbName);
    } catch (error) {
      console.error(
        `Failed to connect to MongoDB. Retrying... (${
          currentRetry + 1
        }/${maxRetries})`
      );
      currentRetry++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
    }
  }

  throw new Error(`Failed to connect to MongoDB after ${maxRetries} retries.`);
}

app.post("/signup", async (req, res) => {
  try {
    const { FullName, Email, Password } = req.body;
    const db = await connectToDatabase();

    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const user = await db.collection("users").findOne({ Email });

    if (user) {
      res.send(`
        <script>
          alert('User with this email already exists');
          window.location.href = '/signup';
        </script>
      `);
    } else {
      const newUser = {
        FullName,
        Email,
        Password: hashedPassword,
      };

      await db.collection("users").insertOne(newUser);

      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Registration failed");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const db = await connectToDatabase();

    const user = await db.collection("users").findOne({ Email });

    if (user) {
      const passwordMatch = await bcrypt.compare(Password, user.Password);

      if (passwordMatch) {
        res.redirect("/dashboard");
      } else {
        res.send(`
          <script>
            alert('INVALID PASSWORD. Please Enter Correct Password');
            window.location.href = '/login';
          </script>
        `);
      }
    } else {
      res.send(`
        <script>
          alert('Login failed. User does not exist');
          window.location.href = '/login';
        </script>
      `);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.redirect("/login?error=Login failed");
  }
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
