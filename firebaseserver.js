const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const admin = require("firebase-admin");
const serviceAccount = require("./fullstack.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the index.html as the default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
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
                    window.location.href = '/signup';
                </script>
            `);
    } else {
      const newUser = {
        FullName,
        Email,
        Password: hashedPassword,
      };

      await db.collection("RegisteredDB").doc(Email).set(newUser);
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Registration failed");
  }
});

// Route for login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
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

// Route for dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
