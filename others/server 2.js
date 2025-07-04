const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main experiment page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ECL_History.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 