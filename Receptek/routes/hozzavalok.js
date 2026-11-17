import pool from "../data/db.js";
import { Router } from "express";
const hozzavalokRoutes=Router();

hozzavalokRoutes.get("/nem-hasznalt",async(req,res)=>{
    try{
        let sql='SELECT h.id,h.nev FROM hozzavalok h WHERE NOT EXISTS (SELECT 1 FROM recept_hozzavalok rh WHERE rh.hozzavalo_id=h.id) ORDER BY h.nev';
        let [eredmeny]=await pool.query(sql);
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

hozzavalokRoutes.get("/",async(req,res)=>{
    try{
        let sql='SELECT h.id,h.nev,h.mertekegyseg,h.egysegar,COUNT(rh.recept_id) AS receptDb FROM hozzavalok h LEFT JOIN recept_hozzavalok rh ON rh.hozzavalo_id=h.id GROUP BY h.id,h.nev,h.mertekegyseg,h.egysegar ORDER BY receptDb DESC,h.nev';
        let [eredmeny]=await pool.query(sql);
        eredmeny=eredmeny.map(x=>({...x,egysegar:Number(x.egysegar),receptDb:Number(x.receptDb)}));
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

export default hozzavalokRoutes;