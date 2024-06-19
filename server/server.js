const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const admin = require("firebase-admin");
const serviceAccount = require(path.join(__dirname, "./fullstack.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Body parser middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the index.html as the default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html")); // Adjusted path
});

// Route for signup (registration)
app.post("/signup", async (req, res) => {
  try {
    const { FullName, Email, Password } = req.body;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const userDoc = await db.collection("RegisteredDB").doc(Email).get();

    if (userDoc.exists) {
      res.send(`
        <script>
          alert('User with this email already exists');
          window.location.href = '/signup.html'; // Redirect to signup page
        </script>
      `);
    } else {
      const newUser = {
        FullName,
        Email,
        Password: hashedPassword,
      };

      await db.collection("RegisteredDB").doc(Email).set(newUser);
      res.redirect("/login.html"); // Redirect to login page
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Registration failed");
  }
});

// Route for login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Route for login
app.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const userDoc = await db.collection("RegisteredDB").doc(Email).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const passwordMatch = await bcrypt.compare(Password, userData.Password);

      if (passwordMatch) {
        res.redirect("/dashboard.html"); // Redirect to dashboard
      } else {
        res.send(`
          <script>
            alert('INVALID PASSWORD. Please Enter Correct Password');
            window.location.href = '/login.html'; // Redirect to login page
          </script>
        `);
      }
    } else {
      res.send(`
        <script>
          alert('Login failed. User does not exist');
          window.location.href = '/login.html'; // Redirect to login page
        </script>
      `);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.redirect("/login.html?error=Login failed"); // Redirect to login page with error query parameter
  }
});

// Route for dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
