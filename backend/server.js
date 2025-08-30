const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');
const buyRequestsRoute = require('./routes/buyRequests');

app.use('/api/users', usersRoute);
app.use('/api/products', productsRoute);
app.use('/api/buy-requests', buyRequestsRoute);

app.listen(3001, () => console.log('Server running on port 3001'));