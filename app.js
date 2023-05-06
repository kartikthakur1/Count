const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'counter.txt');

// Create server
const server = http.createServer((req, res) => {
  // Log request
  console.log(`${req.method} ${req.url}`);

  // Serve static files
  if (req.url.match(/\.(html|css|js)$/)) {
    const filePath = path.join(__dirname, req.url);
    fs.access(filePath, (err) => {
      if (err) {
        // File not found, serve 404 page
        serve404Page(res);
      } else {
        // File found, serve it
        serveStaticFile(res, filePath);
      }
    });
  } else if (req.url === '/home') {
    servePage(res, 'home.html');
  } else if (req.url === '/aboutus') {
    servePage(res, 'aboutus.html');
  } else if (req.url === '/contactus') {
    servePage(res, 'contactus.html');
  } else if (req.url.startsWith('/users')) {
    handleUsersRequest(req, res);
  } else {
    // Unknown request, serve 404 page
    serve404Page(res);
  }
});

// Start server
server.listen(PORT, (err) => {
  if (err) {
    console.error('Unable to start server:', err);
  } else {
    console.log(`Server started on port ${PORT}`);
  }
});

// Serve static file
function serveStaticFile(res, filePath) {
  const contentType = getContentType(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

// Serve page
function servePage(res, fileName) {
  const filePath = path.join(__dirname, fileName);
  serveStaticFile(res, filePath);
}

// Serve 404 page
function serve404Page(res) {
  const filePath = path.join(__dirname, '404.html');
  serveStaticFile(res, filePath);
}

// Get content type
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    default:
      return 'text/plain';
  }
}

// Handle users request
function handleUsersRequest(req, res) {
  if (req.url === '/users') {
    // Serve count
    getCount((count) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Count: ${count}`);
    });
  } else {
    // Unknown users request, serve 404 page
    serve404Page(res);
  }
}

// Get count
function getCount(callback) {
  fs.readFile(FILE_PATH, (err, data) => {
    if (err) {
      // File not found, set count to 0
      const count = 0;
      setCount(count);
      callback(count);
    } else {
      // File found, parse count from data
      const count = parseInt(data.toString()) || 0;
      callback(count);
    }
  });
}

// Set count
function setCount(count) {
  fs.writeFile(FILE_PATH, count.toString(), (err) => {
    if (err) {
      console.error('Unable to write count:', err);
    }
  });
}
