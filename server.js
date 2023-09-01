require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const corsOptions = require('./config/corsOptions');
const { logEvents, logger } = require('./middleware/logEvents');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect to mongoDB
connectDB();

app.use(logger);

//cross origin resource sharing

app.use(credentials);

app.use(cors(corsOptions));

app.use(
  express.urlencoded({
    extended: false,
  })
);

//middleware for cookie
app.use(cookieParser());

app.use(express.json());

app.use('/', express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/api/register'));
app.use('/auth', require('./routes/api/auth'));
app.use('/refresh', require('./routes/api/refresh'));
app.use('/logout', require('./routes/api/logout'));

app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({
      error: '404 not found',
    });
  } else {
    res.type('txt').send('404 not found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('connected to MongoDB');
  app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
});
