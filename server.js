const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const quoteRoutes = express.Router();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

// TODO: Refactor process.env.PORT to check for null value (https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port)
const PORT = process.env.PORT || 4000;

const authConfig = require("./auth_config.json");

let Quotes = require('./quotes.model');

// Set up Auth0 configuration
// const authConfig = {
//     domain: "dev-gviqn817.auth0.com",
//     audience: "YOUR_API_IDENTIFIER"
//   };

  // Define middleware that validates incoming bearer tokens
// using JWKS from dev-gviqn817.auth0.com
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
  
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    // issuer: 'https://dev-gviqn817.auth0.com/',
    algorithm: ["RS256"]
  });


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO: refactor to conditional select DB based on NODE_ENV
mongoose.connect(
    process.env.DB_URI_REMOTE || process.env.DB_URI_LOCAL || 'mongodb://127.0.0.1:27017/quotes',
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }
);

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

quoteRoutes.get('/', (req, res) => {
    Quotes.find((err, quotes) => {
        if (err) {
            console.log(err);
        } else {
            res.json(quotes);
            console.log('done GET root');
        }
    });
});

quoteRoutes.get('/random', (req,res)=> 
    {
        Quotes.aggregate(
            [ { $sample: { size: 1 } } ],
            (err, randomQuote) => {
                if (err) {
                    console.log('Error in Aggregate.');
                    console.log(err);
                } else {
                    res.json(randomQuote);
                    console.log('/random was accessed')
                }
            }
         );
    }
);

quoteRoutes.get('/:id', (req,res) => 
    {
        let id = req.params.id;
        Quotes.findById(id, (err, quote) => {
            res.json(quote);
        });
    }
);


    // TODO: Check if /add is working properl
quoteRoutes.post('/add', checkJwt, (req,res) => {
    let quote = new Quotes(req.body);
    quote.save()
         .then(quote => {
            res.status(200).json({'quote': 'quote added successfully'});
         })
         .catch(err => {
            res.status(400).send(err);
         });
});

app.use('/', quoteRoutes);

app.listen (
    PORT,
    () => {
        console.log('Listen on port: ' + PORT)
    }
);