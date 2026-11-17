import pool from "../data/db.js";
import { Router } from "express";
const filmekRoutes = Router();

filmekRoutes.get("/",async(req,res)=>{
    let sql='SELECT f.id,f.cim,f.hossz,f.korhatar,COUNT(v.id) AS vetitesDb,COALESCE(SUM((SELECT COUNT(*) FROM foglalasok fo WHERE fo.vetites_id=v.id)),0) AS eladottJegy FROM filmek f LEFT JOIN vetitesek v ON v.film_id=f.id GROUP BY f.id,f.cim,f.hossz,f.korhatar ORDER BY f.cim';
    let [eredmeny]=await pool.query(sql);
    res.json(eredmeny);
});

filmekRoutes.get("/:id",async(req,res)=>{
    if(!/^\d+$/.test(req.params.id)) return res.status(400).json({hiba:"Hibás azonosító!"});
    let sql='SELECT id,cim,hossz,korhatar FROM filmek WHERE id=?';
    let [film]=await pool.query(sql,[req.params.id]);
    if(film.length===0) return res.status(404).json({hiba:"A film nem található!"});
    sql='SELECT v.id,t.nev AS terem,DATE_FORMAT(v.kezdes,"%Y-%m-%d %H:%i") AS kezdes,v.jegyar,t.sorok*t.szekek-(SELECT COUNT(*) FROM foglalasok f WHERE f.vetites_id=v.id) AS szabadHely FROM vetitesek v JOIN termek t ON t.id=v.terem_id WHERE v.film_id=? ORDER BY v.kezdes';
    let [vetitesek]=await pool.query(sql,[req.params.id]);
    res.json({id:film[0].id,cim:film[0].cim,hossz:film[0].hossz,korhatar:film[0].korhatar,vetitesek});
});

export default filmekRoutes;