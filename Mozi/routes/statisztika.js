import pool from "../data/db.js";
import { Router } from "express";
const statisztikaRoutes = Router();

statisztikaRoutes.get("/filmek",async(req,res)=>{
    let sql='SELECT f.cim AS film,COALESCE(SUM(x.eladottJegy),0) AS eladottJegy,COALESCE(SUM(x.bevetel),0) AS bevetel,CASE WHEN SUM(x.kapacitas)=0 THEN NULL ELSE ROUND(SUM(x.eladottJegy)/SUM(x.kapacitas)*100,1) END AS telitettseg FROM filmek f LEFT JOIN (SELECT v.id,v.film_id,t.sorok*t.szekek AS kapacitas,COUNT(fo.id) AS eladottJegy,COUNT(fo.id)*v.jegyar AS bevetel FROM vetitesek v JOIN termek t ON t.id=v.terem_id LEFT JOIN foglalasok fo ON fo.vetites_id=v.id GROUP BY v.id,v.film_id,t.sorok,t.szekek,v.jegyar) x ON x.film_id=f.id GROUP BY f.id,f.cim ORDER BY bevetel DESC,film';
    let [eredmeny]=await pool.query(sql);
    res.json(eredmeny);
});

export default statisztikaRoutes;