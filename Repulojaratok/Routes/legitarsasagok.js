import pool from "../Data/db.js";
import { Router } from "express";
const legitarsasagokRoutes = Router();

legitarsasagokRoutes.get("/", async (req,res) => {
    let sql = `SELECT l.kod,l.nev,COUNT(j.id) AS jaratDb,COUNT(DISTINCT j.hova_id) AS celallomasDb,MIN(j.ar) AS legolcsobb,ROUND(AVG(j.ar)) AS atlagAr FROM legitarsasagok l LEFT JOIN jaratok j ON j.legitarsasag_id=l.id GROUP BY l.id,l.kod,l.nev ORDER BY l.nev DESC,l.kod DESC`;
    let [eredmeny] = await pool.query(sql);
    res.json(eredmeny);
});

export default legitarsasagokRoutes;