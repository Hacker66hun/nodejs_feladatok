import pool from "../Data/db.js";
import { Router } from "express";
const utvonalRoutes = Router();

utvonalRoutes.get("/", async (req,res) => {
    const {honnan,hova} = req.query;
    if(!honnan || !hova || honnan.length !== 3 || hova.length !== 3 || honnan.toUpperCase() === hova.toUpperCase()) return res.status(400).json({hiba:"Hibás útvonal!"});
    let [honnanRep] = await pool.query(`SELECT id,kod FROM repuloterek WHERE kod=?`,[honnan.toUpperCase()]);
    let [hovaRep] = await pool.query(`SELECT id,kod FROM repuloterek WHERE kod=?`,[hova.toUpperCase()]);
    if(honnanRep.length === 0 || hovaRep.length === 0) return res.status(404).json({hiba:"A repülőtér nem található!"});
    let sql = `SELECT j.jaratszam,l.nev AS legitarsasag,h.kod AS honnan,h.varos AS honnanVaros,c.kod AS hova,c.varos AS hovaVaros,TIME_FORMAT(j.indulas,"%H:%i") AS indulas,TIME_FORMAT(ADDTIME(j.indulas,SEC_TO_TIME(j.idotartam*60)),"%H:%i") AS erkezes,j.idotartam,j.ar FROM jaratok j JOIN legitarsasagok l ON l.id=j.legitarsasag_id JOIN repuloterek h ON h.id=j.honnan_id JOIN repuloterek c ON c.id=j.hova_id WHERE h.id=? AND c.id=? ORDER BY j.ar ASC`;
    let [kozvetlen] = await pool.query(sql,[honnanRep[0].id,hovaRep[0].id]);
    let sql2 = `SELECT j1.jaratszam AS elso,j2.jaratszam AS masodik,koz.kod AS atszallas,TIME_FORMAT(j1.indulas,"%H:%i") AS indulas,TIME_FORMAT(ADDTIME(j2.indulas,SEC_TO_TIME(j2.idotartam*60)),"%H:%i") AS erkezes,TIMESTAMPDIFF(MINUTE,ADDTIME(j1.indulas,SEC_TO_TIME(j1.idotartam*60)),j2.indulas) AS varakozas,j1.ar+j2.ar AS osszAr FROM jaratok j1 JOIN jaratok j2 ON j2.honnan_id=j1.hova_id JOIN repuloterek koz ON koz.id=j1.hova_id WHERE j1.honnan_id=? AND j2.hova_id=? AND TIMESTAMPDIFF(MINUTE,ADDTIME(j1.indulas,SEC_TO_TIME(j1.idotartam*60)),j2.indulas) BETWEEN 60 AND 300 ORDER BY osszAr ASC`;
    let [atszallassal] = await pool.query(sql2,[honnanRep[0].id,hovaRep[0].id]);
    res.json({honnan:honnan.toUpperCase(),hova:hova.toUpperCase(),kozvetlen,atszallassal});
});

export default utvonalRoutes;