const express = require("express");
const cors = require("cors");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const fs = require("fs");
let count = parseInt(fs.readFileSync("count.txt", "utf8")) || 0;

const dbd = new sqlite3.Database("./database.sqlite");
const db = new sqlite3.Database("islamdatabase.db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`
    <html>
  <head>
    <title>Hello Button</title>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      h1 {
        font-size: 36px;
        margin-bottom: 20px;
      }
      button {
        font-size: 24px;
        padding: 10px 20px;
        background-color: green;
        color: white;
        border: none;
        border-radius: 5px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 green;
        }
        70% {
          box-shadow: 0 0 0 20px rgba(0, 128, 0, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 128, 0, 0);
        }
      }
        h2 {
    font-size: 36px;
    color: green;
  }
    </style>
  </head>
  <body>
      <h2>As-salamu alaykum from our developer team</h2>
    <button onclick="increment()">Wa alaykumu s-salam</button>

    <script>
      function increment() {
        fetch('/increment')
          .then(response => response.text())
          .then(newCount => {
            document.querySelector('h2').textContent = 'Thanks for your salam, The number of times people said Wa alaykumu s-salam: ' + newCount;
          });
      }
    </script>
    
     <meta http-equiv="refresh" content="10;url=https://vagabond-calico-passive.glitch.me/profile">
    <script>
      var count = 10;
      setInterval(function() {
        count--;
        document.getElementById("countdown").innerHTML = count;
        if (count == 0) {
          clearInterval();
          document.getElementById("redirectButton").click();
        }
      }, 1000);
    </script>
    <style>
      body {
        background-color: white;
        text-align: center;
        font-size: 2rem;
        margin-top: 10%;
      }
      button {
        font-size: 1rem;
        padding: 1rem 2rem;
        margin-top: 2rem;
        background-color: green;
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      button:hover {
        background-color: darkgreen;
      }
    </style>
    <h1>Redirecting to profile page in <span id="countdown">5</span> seconds...</h1>
    <button id="redirectButton" onclick="window.location.href='https://vagabond-calico-passive.glitch.me/profile'">Redirect Now</button>
  
  </body>
</html>
  `);
});

app.get("/increment", (req, res) => {
  count++;
  fs.writeFileSync("count.txt", count.toString());
  res.send(count.toString());
});

app.get("/download-prayers", (req, res) => {
  console.log("/download-prayers");
  const { username } = req.query;
  if (!username) {
    res.status(400).send("Missing username query parameter");
    return;
  }
  db.all("SELECT * FROM prayers WHERE username = ?", username, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving prayer data from database");
    } else {
      const filename = `prayers-${username}-${new Date().toISOString()}.json`;
      const data = JSON.stringify(rows);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", "application/json");
      res.send(data);
    }
  });
});

//new
app.get("/prayers", (req, res) => {
  console.log("/prayers (retrieve)");
  const { username, date } = req.query;
  console.log(date);
  if (!username) {
    res.status(400).send("Missing username query parameter");
    return;
  }
  let query = "SELECT * FROM prayers WHERE username = ?";
  let params = [username];
  if (date) {
    query += " AND date = ?";
    params.push(date);
  }
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving prayer data from database");
    } else {
      res.send(rows);
    }
  });
});

app.post("/prayers", express.json(), (req, res) => {
  console.log("/prayers (create)");
  //console.log(date)
  const { name, status, username } = req.body;
  if (!name || !status || !username) {
    res.status(400).send("Missing required fields in request body");
    return;
  }
  // const date = new Date().toISOString();
  const date = req.body.date;
  db.run(
    "INSERT INTO prayers (name, status, username, date) VALUES (?, ?, ?, ?)",
    [name, status, username, date],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error saving prayer data to database");
      } else {
        res.send("Prayer saved successfully");
      }
    }
  );
});
/*
app.post("/submit-prayer", express.json(), (req, res) => {
  const { name, status, username } = req.body;
  console.log("/submit-prayer");
  db.run(
    "INSERT INTO prayers (name, status, username) VALUES (?, ?, ?)",
    [name, status, username],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error saving prayer data to database");
      } else {
        res.send("Prayer data saved successfully");
      }
    }
  );
});

*/

app.get("/download", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM prayers", (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving prayer data from database");
      } else {
        const data = JSON.stringify(rows);
        const filename = "prayers.json";
        res.setHeader(
          "Content-disposition",
          `attachment; filename=${filename}`
        );
        res.setHeader("Content-type", "application/json");
        res.send(data);
      }
    });
  });
});

////////////////////////////////////////////////////
app.get("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  res.send(`
  
  
<!DOCTYPE html>
<html>
  <head>
    <title>OpenIslam Register Page</title>
    <style>
      body {
        background-color: #d9eedb; /* light green background color */
        font-family: "Open Sans", sans-serif;
      }

      h1 {
        text-align: center;
        color: #2c3e50;
        margin-top: 50px;
      }

      form {
        width: 400px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        background-color: #fff;
      }

      input[type="text"],
      input[type="password"] {
        display: block;
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: none;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        font-size: 16px;
      }

      input[type="text"]:focus,
      input[type="password"]:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      }

      button[type="submit"] {
        display: block;
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 5px;
        background-color: #27ae60;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
      }

      button[type="submit"]:hover {
        background-color: #219653;
      }

      /* Custom styles for the register page */
      .register-label {
        color: #2c3e50;
        font-size: 18px;
        font-weight: bold;
      }

      .register-icon {
        color: #2c3e50;
        font-size: 24px;
        margin-right: 10px;
      }

      .register-message {
        margin-top: 20px;
        color: #27ae60;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to OpenIslam Register Page</h1>
    <form method="POST" action="/register">
      <label class="register-label" for="username">
        <i class="fas fa-user register-icon"></i>Username
      </label>
      <input type="text" name="username" id="username" placeholder="Enter your username" required>
      <label class="register-label" for="password">
        <i class="fas fa-lock register-icon"></i>Password
      </label>
      <input type="password" name="password" id="password" placeholder="Enter your password" required>
      <button type="submit">Register</button>
      <div class="register-message">Already have an account? <a href="/login">Login here</a></div>
    </form>
  </body>
</html>

    
    
    
  `);

  res.status(200).json({
    message: "User registered successfully",
  });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;

    dbd.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hash],
      (err) => {
        if (err) throw err;

        res.cookie("username", username);
        res.redirect("/profile");
      }
    );
  });
});

app.get("/login", (req, res) => {
  res.send(`
  
  
<!DOCTYPE html>
<html>
  <head>
    <title>OpenIslam Login Page</title>
    <style>
      body {
        background-color: #d9eedb;
        font-family: "Open Sans", sans-serif;
      }

      h1 {
        text-align: center;
        color: #2c3e50;
        margin-top: 50px;
      }

      form {
        width: 400px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        background-color: #fff;
      }

      input[type="text"],
      input[type="password"] {
        display: block;
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        border: none;
        border-radius: 5px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        font-size: 16px;
      }

      input[type="text"]:focus,
      input[type="password"]:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      }

      button[type="submit"] {
        display: block;
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 5px;
        background-color: #27ae60;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
      }

      button[type="submit"]:hover {
        background-color: #219653;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to OpenIslam Login Page</h1>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
      <div class="register-message">Dont have an account? <a href="/register">Register here</a></div>
    
    </form>
  </body>
</html>

    
    
    
    
  `);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  dbd.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) throw err;

    if (!row) {
      res.send("Invalid username or password");
    } else {
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) throw err;

        if (result) {
          res.cookie("username", username);
          res.redirect("/profile");
        } else {
          res.send("Invalid username or password");
        }
      });
    }
  });
});

app.get("/profile", (req, res) => {
  //${username}
  const username = req.cookies.username;

  if (!username) {
    res.redirect("/login");
  } else {
    res.send(`



<!DOCTYPE html>
<html>
  <head>

<style>
  body {
    font-family: Arial, sans-serif;
  }
  h1 {
    font-size: 36px;
    margin-bottom: 20px;
  }
  
  
  .my-button {
    font-size: 24px;
    padding: 10px 20px;
    background-color: green;
    color: white;
    border: none;
    border-radius: 5px;
    animation: my-pulse 2s infinite;
  }
  
  @keyframes my-pulse {
    0% {
      box-shadow: 0 0 0 0 skyblue;
    }
    70% {
      box-shadow: 0 0 0 7px rgba(0, 128, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 128, 0, 0);
    }
  }
  
    h3 {
font-size: 36px;
color: green;
}
</style>

      <h3>As-salamu alaykum, ${username} from our developer team</h3>
<button class="my-button" onclick="increment()">Wa alaykumu s-salam</button>


    <script>
      function increment() {
        fetch('/increment')
          .then(response => response.text())
          .then(newCount => {
            document.querySelector('h3').textContent = 'Thanks for your salam, The number of times people said salam we got : ' + newCount;
          });
      }
      
    </script>

    <meta charset="utf-8">
    <title>Prayer Tracker</title>
    
    
    
    <style>
      		.widget {
			display: none;
			position: absolute;
			background-color: #fff;
			border: 1px solid #ccc;
			padding: 10px;
			z-index: 999;
		}

		.option {
			margin-bottom: 5px;
		}

      body {
        font-family: sans-serif;
      }
      form {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
      }
      label, input {
        margin-bottom: 10px;
      }
      input[type="submit"] {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-bottom: 10px;
        cursor: pointer;
      }
      input[type="submit"]:hover {
        background-color: #3e8e41;
      }
      button {
        background-color: #008CBA;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
      }
      button:hover {
        background-color: #007A99;
      }
      #retrieve-prayers-button {
        display: none;
}
      
    </style>
  </head>
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  <body>
    <h1>Prayer Tracker</h1>
    
    
      <div id="ip"></div>
  <div id="ip_date"></div>
  <div id="ip_time"></div>
  <div id="ip_timezone"></div>
  <div id="clock"></div>


  <div>
    <button id="fajr-button" onclick="toggleWidget('fajr')">Fajr</button>
    <div id="fajr-widget" class="widget">
      <div class="option">
        <button onclick="selectOption('fajr', 'ON time')">ON time</button>
      </div>
      <div class="option">
        <button onclick="selectOption('fajr', 'Late')">Late</button>
      </div>
      <div class="option">
        <button onclick="selectOption('fajr', 'Missed')">Missed</button>
      </div>
    </div>
  </div>

  <div>
    <button id="dhuhr-button" onclick="toggleWidget('dhuhr')">Dhuhr</button>
    <div id="dhuhr-widget" class="widget">
      <div class="option">
        <button onclick="selectOption('dhuhr', 'ON time')">ON time</button>
      </div>
      <div class="option">
        <button onclick="selectOption('dhuhr', 'Late')">Late</button>
      </div>
      <div class="option">
        <button onclick="selectOption('dhuhr', 'Missed')">Missed</button>
      </div>
    </div>
  </div>
  <div>
    <button id="asr-button" onclick="toggleWidget('asr')">Asr</button>
    <div id="asr-widget" class="widget">
      <div class="option">
        <button onclick="selectOption('asr', 'ON time')">ON time</button>
      </div>
      <div class="option">
        <button onclick="selectOption('asr', 'Late')">Late</button>
      </div>
      <div class="option">
        <button onclick="selectOption('asr', 'Missed')">Missed</button>
      </div>
    </div>
  </div>
  
  <div>
    <button id="maghrib-button" onclick="toggleWidget('maghrib')">Maghrib</button>
    <div id="maghrib-widget" class="widget">
      <div class="option">
        <button onclick="selectOption('maghrib', 'ON time')">ON time</button>
      </div>
      <div class="option">
        <button onclick="selectOption('maghrib', 'Late')">Late</button>
      </div>
      <div class="option">
        <button onclick="selectOption('maghrib', 'Missed')">Missed</button>
      </div>
    </div>
  </div>
  
  <div>
    <button id="isha-button" onclick="toggleWidget('isha')">Isha</button>
    <div id="isha-widget" class="widget">
      <div class="option">
        <button onclick="selectOption('isha', 'ON time')">ON time</button>
      </div>
      <div class="option">
        <button onclick="selectOption('isha', 'Late')">Late</button>
      </div>
      <div class="option">
        <button onclick="selectOption('isha', 'Missed')">Missed</button>
      </div>
    </div>
  </div>
  

      
  <form id="prayer-form">

    <label for="name-input">How was your day any special memory ?</label>
    <input type="text" id="name-input"required value="nothing special" name="name">
    <label for="status-input">Antyhing else ? </label>
    <input type="text" id="status-input" required value="nothing special" name="status">
    <label for="username-input" hidden>Username:</label>
    <input type="text" id="username-input" required value="${username}" name="username" hidden>
    <label for="date-input">Date:</label>
    <input type="date" id="date-input" name="date">
    <button type="submit">Add Prayer</button>
    <script>
      document.getElementById("name-input").value = "nothing special";
      document.getElementById("status-input").value = "nothing special";
      document.getElementById("username-input").value = "${username}";

  let currentDate = new Date().toISOString().slice(0, 10);
  
  document.getElementById('date-input').value = currentDate;

    </script>
  </form>
    
    <form id="get-prayers-form">
    <label for="username-query" hidden>Username:</label>
    <input type="text" id="username-query" name="username" required value="${username}"  hidden>
    <label for="date-query">Date:</label>
    <input type="date" id="date-query" name="date">
    <button type="submit">Get Prayers</button>
  </form>
    
    
  <table id="prayers-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Username</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
    
    

<script>// must need to set username
  
  document.getElementById("username-query").value = "${username}";
  const form = document.getElementById('username-form');
  /*
  form.addEventListener('submit', (event) => {
    event.preventDefault()/
    const username = form.elements.username.value;
    const url = '/download-prayers?username=${encodeURIComponent(username)}';
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'prayers-${username}-${new Date().toISOString()}.json';
    anchor.click();
  }); */
</script>

<script>

// not for auto button
  const getPrayersForm = document.getElementById("get-prayers-form");
  const addPrayerForm = document.getElementById("prayer-form");
  const prayersTable = document.getElementById("prayers-table");
  
  getPrayersForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username-query").value;
    const date = document.getElementById("date-query").value;
    const url = new URL("https://vagabond-calico-passive.glitch.me/prayers");
    url.searchParams.append("username", username);
    if (date) {
      url.searchParams.append("date", date);
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
      throw new Error("HTTP error! status: " + response.status);
      }

      const data = await response.json();
      prayersTable.innerHTML = "";
      data.forEach(prayer => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.textContent = prayer.name;
        row.appendChild(nameCell);
        const statusCell = document.createElement("td");
        statusCell.textContent = prayer.status;
        row.appendChild(statusCell);
        const usernameCell = document.createElement("td");
        usernameCell.textContent = prayer.username;
        row.appendChild(usernameCell);
        const dateCell = document.createElement("td");
        dateCell.textContent = prayer.date;
        row.appendChild(dateCell);
        prayersTable.appendChild(row);
        data.forEach(prayer => {
          const button = document.getElementById(prayer.name.toLowerCase() + '-button');
          switch (prayer.status) {
            case 'green':
              button.style.backgroundColor = 'green';
              break;
            case 'yellow':
              button.style.backgroundColor = 'yellow';
              break;
            case 'red':
              button.style.backgroundColor = 'red';
              break;
            default:
              break;
          }
        });
      });
    }  catch (error) {
      console.error("Error retrieving prayer data from server:", error);
      alert("Error retrieving prayer data from server");
    }
  });

addPrayerForm.addEventListener("submit", async (event) => { // for text form
    event.preventDefault();
    const name = document.getElementById("name-input").value;
    const status = document.getElementById("status-input").value;
    const username = document.getElementById("username-input").value;
    const date = document.getElementById("date-input").value;
    const data = { name, status, username, date };
    console.log(data)
    try {
      const response = await fetch("https://vagabond-calico-passive.glitch.me/prayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
     if (!response.ok) {
  throw new Error("HTTP error! status: " + response.status);
}
      alert("Prayer saved successfully");
      //addPrayerForm.reset();
    } catch (error) {
      console.error("Error saving prayer data to server:", error);
      alert("Error saving prayer data to server");
    }
  });


  const submitForm = document.getElementById("prayer-form");
    const nameInput = document.getElementById("name-input");
    const statusInput = document.getElementById("status-input");
    const usernameInput = document.getElementById("username-input");
    const dateInput = document.getElementById("date-input");
    const prayerTableBody = document.querySelector("#prayer-table tbody");
  
    function submitPrayer(name, status, username, date) {
      //const addPrayerForm = document.getElementById("add-prayer-form");
    
      console.log(name, status, username, date)
    fetch("https://vagabond-calico-passive.glitch.me/prayers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, status, username, date }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error saving prayer data");
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);
        nameInput.value = "";
        statusInput.value = "";
        usernameInput.value = "";
        dateInput.value = "";
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const username = usernameInput.value;
    const date = dateInput.value;

    const fajrStatus = document.getElementById('fajr-button').style.backgroundColor;
    const dhuhrStatus = document.getElementById('dhuhr-button').style.backgroundColor;
    const asrStatus = document.getElementById('asr-button').style.backgroundColor;
    const maghribStatus = document.getElementById('maghrib-button').style.backgroundColor;
    const ishaStatus = document.getElementById('isha-button').style.backgroundColor;


    if (fajrStatus) {
    submitPrayer('Fajr', fajrStatus, username , date);
  }
  if (dhuhrStatus) {
    submitPrayer('Dhuhr', dhuhrStatus, username, date);
  }
  if (asrStatus) {
    submitPrayer('Asr', asrStatus, username, date);
  }
  if (maghribStatus) {
    submitPrayer('Maghrib', maghribStatus, username, date);
  }
  if (ishaStatus) {
    submitPrayer('Isha', ishaStatus, username, date);
  }

 
  });
  

  function toggleWidget(prayer) {
        var widget = document.getElementById(prayer + '-widget');
        widget.style.display = (widget.style.display === 'none') ? 'block' : 'none';
      }
      function selectOption(prayer, option) {
        console.log(prayer + ': ' + option);
  
        var button = document.getElementById(prayer + '-button');
  
        switch (option) {
          case 'ON time':
            button.style.backgroundColor = 'green';
            break;
          case 'Late':
            button.style.backgroundColor = 'yellow';
            break;
          case 'Missed':
            button.style.backgroundColor = 'red';
            break;
          default:
            break;
        }
        toggleWidget(prayer);
      }

      
  /*
    function restorePrayers() { // auto button
    const username = usernameInput.value;
   
    fetch('https://vagabond-calico-passive.glitch.me/prayers?username=' + username)
  
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error retrieving prayer data");
        }
        return response.json();
      })
      .then((data) => {
        data.forEach(prayer => {
          const button = document.getElementById(prayer.name.toLowerCase() + '-button');
          switch (prayer.status) {
            case 'green':
              button.style.backgroundColor = 'green';
              break;
            case 'yellow':
              button.style.backgroundColor = 'yellow';
              break;
            case 'red':
              button.style.backgroundColor = 'red';
              break;
            default:
              break;
          }
        });
        console.log(data);

      })
      .catch((error) => {
        console.error(error);
      });
  }

  

    document.getElementById("restore-prayers-button").addEventListener("click", () => {
      prayerTableBody.innerHTML = "";
    });
  
  */
  
  
  window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date-query');
    const dateValue = dateInput.value.trim();
    const isInteracted = dateInput.hasAttribute('data-interacted');
    if (!dateValue && !isInteracted) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
    dateInput.addEventListener('change', () => {
      dateInput.setAttribute('data-interacted', 'true');
    });
  });
  const button = document.querySelector('#get-prayers-form button');
  button.click();
  //restorePrayers();// only for button
  window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('date-query');
  dateInput.value = '';
});

</script>




<style>
    #ip {
    font-size: 16px;
  }

  #ip_date {
    font-size: 24px;
    font-weight: bold;
  }

  #ip_time {
    font-size: 24px;
    font-weight: bold;
  }

  #ip_timezone {
    font-size: 16px;
  }
  .option {
			margin-bottom: 5px;
		}
    body {
        font-family: sans-serif;
      }
      label, input {
        margin-bottom: 10px;
      }
      input[type="submit"] {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-bottom: 10px;
        cursor: pointer;
      }
      input[type="submit"]:hover {
        background-color: #3e8e41;
      }
      button {
        background-color: #008CBA;
        color: white;
        border: none;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
      }

      button:hover {
        background-color: #007A99;
      }
      #retrieve-prayers-button {
        display: none;
}
      
  .widget {
			display: none;
			position: absolute;
			background-color: #fff;
			border: 1px solid #ccc;
			padding: 10px;
			z-index: 999;
		}

h1 {
  font-size: 2em;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  margin: 1em;
}

label {
  margin: 0.5em 0;
}

input[type="text"], input[type="date"] {
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button[type="submit"] {
  margin: 1em 0;
  padding: 0.5em;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

table {
  border-collapse: collapse;
  margin: 1em;
  width: 100%;
}

th, td {
  padding: 0.5em;
  border: 1px solid #ccc;
  text-align: center;
}

</style>


<script>
  function getDateTime() {
   let date = new Date();
   let day = date.getDate().toString().padStart(2, '0');
   let month = (date.getMonth() + 1).toString().padStart(2, '0');
   let year = date.getFullYear();
   let dateString = month + '/' + day + '/' + year;
  //let dateString = month + '/' + day + '/' + year;
   let timeString = date.toLocaleTimeString();
   let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
   let ipAddress = null;
const ipUrl = 'https://api.ipify.org/?format=json';
   const timeApiUrl = 'https://worldtimeapi.org/api/ip/';
 
 
 
 
 
 
 
 
 
 
 
 
   async function getIpAddress() {
     const response = await fetch(ipUrl);
     const data = await response.json();
     ipAddress = data.ip;
     document.getElementById('ip').textContent = ipAddress;
     return ipAddress;
   }
 
   async function showDateTime() {
     ipAddress = await getIpAddress();
     const response = await fetch(timeApiUrl + ipAddress);
     const data = await response.json();
     const dateTime = new Date(data.datetime);
     const ip_dateString = dateTime.toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'});
     const ip_timeString = dateTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true});
     const ip_timeValue = dateTime.getTime();
     //const system_timeValue = date.getTime();
     const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
     const time_diff = Math.abs(ip_timeValue - currentTime);
     if (dateString !== ip_dateString) {
       document.getElementById("ip_date").innerHTML ="Current date based on IP: " + ip_dateString + " (System date: " + dateString + ")";
     } else {
       document.getElementById("ip_date").innerHTML = "Current date based on IP and system: " + ip_dateString;
     }
     if (time_diff > 20000) {
       //const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
       document.getElementById("ip_time").innerHTML ="Current time based on IP: " + ip_timeString + " (System time: " + currentTime + ")";
     } else {
       document.getElementById("ip_time").innerHTML ="Current time based on IP and system: " + ip_timeString;
     }
     if (timezone === Intl.DateTimeFormat().resolvedOptions().timeZone) {
       document.getElementById("ip_timezone").innerHTML = "Time zone based on IP and system: " + timezone;
     } else {
       document.getElementById("ip_timezone").innerHTML = "Time zone based on IP: " + timezone + " (System time zone: " + Intl.DateTimeFormat().resolvedOptions().timeZone + ")";
     }
   }
 
   setInterval(showDateTime, 10000);
 }
 getDateTime();
 

 </script>



`); //usernameInput.addEventListener("input", restorePrayers);
  }
});

dbd.serialize(() => {
  dbd.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS prayers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, status TEXT, username TEXT, date TEXT)"
  );
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
