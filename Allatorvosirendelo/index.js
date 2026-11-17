import express from 'express';
import allatokrouter from './routes/allatok.js';
import gazdakrouter from './routes/gazdak.js';
const app = express();
const port = 3000;

app.get('/', (req, res)=>{
    res.send('mukszik')
});

app.use('/allatok', allatokrouter);
app.use('/gazdak', gazdakrouter);
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
})