import express from 'express';
import bodyParser from 'bpdy-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.listen (
    PORT,
    () => {
        console.log('Listen on port: ' + PORT)
    }
);