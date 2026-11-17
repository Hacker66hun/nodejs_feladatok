import pool from "../Data/db.js";
import { Router } from "express";
const jaratokRoutes = Router();

jaratokRoutes.get("/", async (req,res) => {
    let params = [];
    let szurok = [];
    const {honnan,hova,legitarsasag} = req.query;
    if(honnan) {
        if(honnan.length !== 3) return res.status(400).json({hiba:"Hibás repülőtérkód!"});
        szurok.push("h.kod = ?");
        params.push(honnan.toUpperCase());
    }
    if(hova) {
        if(hova.length !== 3) return res.status(400).json({hiba:"Hibás repülőtérkód!"});
        szurok.push("c.kod = ?");
        params.push(hova.toUpperCase());
    }
    if(legitarsasag) {
        if(legitarsasag.length !== 2) return res.status(400).json({hiba:"Hibás légitársaságkód!"});
        szurok.push("l.kod = ?");
        params.push(legitarsasag.toUpperCase());
    }
    let sql = `SELECT j.jaratszam,l.nev AS legitarsasag,h.kod AS honnan,h.varos AS honnanVaros,c.kod AS hova,c.varos AS hovaVaros,TIME_FORMAT(j.indulas,"%H:%i") AS indulas,TIME_FORMAT(ADDTIME(j.indulas,SEC_TO_TIME(j.idotartam*60)),"%H:%i") AS erkezes,j.idotartam,j.ar FROM jaratok j JOIN legitarsasagok l ON l.id=j.legitarsasag_id JOIN repuloterek h ON h.id=j.honnan_id JOIN repuloterek c ON c.id=j.hova_id`;
    if(szurok.length > 0) sql += " WHERE " + szurok.join(" AND ");
    sql += " ORDER BY j.indulas ASC";
    let [eredmeny] = await pool.query(sql,params);
    res.json(eredmeny);
});

jaratokRoutes.get("/:jaratszam", async (req,res) => {
    let sql = `SELECT j.jaratszam,l.nev AS legitarsasag,h.kod AS honnan,h.varos AS honnanVaros,c.kod AS hova,c.varos AS hovaVaros,TIME_FORMAT(j.indulas,"%H:%i") AS indulas,TIME_FORMAT(ADDTIME(j.indulas,SEC_TO_TIME(j.idotartam*60)),"%H:%i") AS erkezes,j.idotartam,j.ar FROM jaratok j JOIN legitarsasagok l ON l.id=j.legitarsasag_id JOIN repuloterek h ON h.id=j.honnan_id JOIN repuloterek c ON c.id=j.hova_id WHERE j.jaratszam = ?`;
    let [eredmeny] = await pool.query(sql,[req.params.jaratszam]);
    if(eredmeny.length === 0) return res.status(404).json({hiba:"A járat nem található!"});
    res.json(eredmeny[0]);
});

export default jaratokRoutes;