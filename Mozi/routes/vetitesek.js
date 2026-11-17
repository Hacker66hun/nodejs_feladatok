import pool from "../data/db.js";
import { Router } from "express";
const vetitesekRoutes = Router();

vetitesekRoutes.get("/",async(req,res)=>{
    const {datum}=req.query;
    let params=[];
    let feltetelek=[];
    if(datum){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return res.status(400).json({hiba:"Hibás dátum!"});
        const [ev,ho,nap]=datum.split("-").map(Number);
        const d=new Date(ev,ho-1,nap);
        if(d.getFullYear()!==ev||d.getMonth()!==ho-1||d.getDate()!==nap) return res.status(400).json({hiba:"Hibás dátum!"});
        feltetelek.push("DATE(v.kezdes)=?");
        params.push(datum);
    }
    let sql='SELECT v.id,f.cim AS film,t.nev AS terem,DATE_FORMAT(v.kezdes,"%Y-%m-%d %H:%i") AS kezdes,DATE_FORMAT(v.kezdes+INTERVAL f.hossz MINUTE,"%H:%i") AS veg,v.jegyar,t.sorok*t.szekek-(SELECT COUNT(*) FROM foglalasok fo WHERE fo.vetites_id=v.id) AS szabadHely FROM vetitesek v JOIN filmek f ON f.id=v.film_id JOIN termek t ON t.id=v.terem_id';
    if(feltetelek.length) sql+=" WHERE "+feltetelek.join(" AND ");
    sql+=" ORDER BY v.kezdes";
    let [eredmeny]=await pool.query(sql,params);
    res.json(eredmeny);
});

vetitesekRoutes.get("/:id",async(req,res)=>{
    if(!/^\d+$/.test(req.params.id)) return res.status(400).json({hiba:"Hibás azonosító!"});
    let sql='SELECT v.id,f.cim AS film,t.nev AS terem,DATE_FORMAT(v.kezdes,"%Y-%m-%d %H:%i") AS kezdes,v.jegyar,t.sorok,t.szekek,COUNT(fo.id) AS foglaltDb,t.sorok*t.szekek-COUNT(fo.id) AS szabadHely FROM vetitesek v JOIN filmek f ON f.id=v.film_id JOIN termek t ON t.id=v.terem_id LEFT JOIN foglalasok fo ON fo.vetites_id=v.id WHERE v.id=? GROUP BY v.id,f.cim,t.nev,v.kezdes,v.jegyar,t.sorok,t.szekek';
    let [vetites]=await pool.query(sql,[req.params.id]);
    if(vetites.length===0) return res.status(404).json({hiba:"A vetítés nem található!"});
    sql='SELECT sor,szek FROM foglalasok WHERE vetites_id=? ORDER BY sor,szek';
    let [foglalt]=await pool.query(sql,[req.params.id]);
    res.json({...vetites[0],foglalt});
});

export default vetitesekRoutes;