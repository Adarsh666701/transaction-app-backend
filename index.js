const express = require('express');
const app = express();
const MainRouter = require('./routes/MainRouter');
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use('api/v1/', MainRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log('Server is running on port'+ PORT)
});