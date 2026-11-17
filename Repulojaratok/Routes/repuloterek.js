import pool from "../Data/db.js";
import { Router } from "express";
const repuloterekRoutes = Router();

repuloterekRoutes.get("/", async (req,res) => {
    let sql = `SELECT r.kod,r.nev,r.varos,r.orszag,COUNT(DISTINCT j1.id) AS indulo,COUNT(DISTINCT j2.id) AS erkezo FROM repuloterek r LEFT JOIN jaratok j1 ON j1.honnan_id=r.id LEFT JOIN jaratok j2 ON j2.hova_id=r.id GROUP BY r.id,r.kod,r.nev,r.varos,r.orszag ORDER BY r.kod ASC`;
    let [eredmeny] = await pool.query(sql);
    res.json(eredmeny);
});

repuloterekRoutes.get("/:kod/indulasok", async (req,res) => {
    let sql = `SELECT TIME_FORMAT(j.indulas,"%H:%i") AS indulas,j.jaratszam,l.nev AS legitarsasag,CONCAT(c.varos," (",c.kod,")") AS celallomas,TIME_FORMAT(ADDTIME(j.indulas,SEC_TO_TIME(j.idotartam*60)),"%H:%i") AS erkezes FROM jaratok j JOIN legitarsasagok l ON l.id=j.legitarsasag_id JOIN repuloterek h ON h.id=j.honnan_id JOIN repuloterek c ON c.id=j.hova_id WHERE h.kod=? ORDER BY j.indulas ASC`;
    let [eredmeny] = await pool.query(sql,[req.params.kod.toUpperCase()]);
    let [repuloter] = await pool.query(`SELECT id FROM repuloterek WHERE kod=?`,[req.params.kod.toUpperCase()]);
    if(repuloter.length === 0) return res.status(404).json({hiba:"A repülőtér nem található!"});
    res.json(eredmeny);
});

repuloterekRoutes.get("/:kod", async (req,res) => {
    let sql = `SELECT r.kod,r.nev,r.varos,r.orszag,COUNT(DISTINCT j1.id) AS indulo,COUNT(DISTINCT j2.id) AS erkezo FROM repuloterek r LEFT JOIN jaratok j1 ON j1.honnan_id=r.id LEFT JOIN jaratok j2 ON j2.hova_id=r.id WHERE r.kod=? GROUP BY r.id,r.kod,r.nev,r.varos,r.orszag`;
    let [eredmeny] = await pool.query(sql,[req.params.kod.toUpperCase()]);
    if(eredmeny.length === 0) return res.status(404).json({hiba:"A repülőtér nem található!"});
    res.json(eredmeny[0]);
});

export default repuloterekRoutes;