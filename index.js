const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const db=require('./config/connectDb');
const userRoute=require('./Routes/UserRoute');
app.use(express.urlencoded({ extended: true })); //form data
//cors and db
app.use(cors());
db();

//middleware
app.use(express.json()); //json data
app.use(cookieParser());
//load routes
app.use('/api/user',userRoute);


app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});