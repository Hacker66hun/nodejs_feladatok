import pool from '../data/db.js'
import { Router } from 'express';
const gazdakrouter = Router();

gazdakrouter.get('/', (req, res)=>{
    res.send('gazdak')
});

export default gazdakrouter;