import pool from '../data/db.js';
import { Router } from 'express';
const allatokrouter = Router();

allatokrouter.get('/', async (req, res) => {
    res.send('allatok')
});

export default allatokrouter;