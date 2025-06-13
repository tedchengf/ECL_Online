require('dotenv').config();
const express = require('express');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Set up the main route
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/ECL_History.html');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Server is running on port ' + PORT);
}); 