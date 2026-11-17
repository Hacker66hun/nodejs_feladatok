import pool from "../data/db.js";
import { Router } from "express";
const statisztikaRoutes=Router();

statisztikaRoutes.get("/kategoriak",async(req,res)=>{
    try{
        let sql='SELECT r.kategoria,COUNT(r.id) AS receptDb,ROUND(AVG(r.ido)) AS atlagIdo,ROUND(AVG(COALESCE(k.koltseg,0))) AS atlagKoltseg FROM receptek r LEFT JOIN (SELECT rh.recept_id,SUM(rh.mennyiseg*h.egysegar) AS koltseg FROM recept_hozzavalok rh JOIN hozzavalok h ON h.id=rh.hozzavalo_id GROUP BY rh.recept_id) k ON k.recept_id=r.id GROUP BY r.kategoria ORDER BY FIELD(r.kategoria,"reggeli","leves","főétel","desszert")';
        let [eredmeny]=await pool.query(sql);
        eredmeny=eredmeny.map(x=>({...x,receptDb:Number(x.receptDb),atlagIdo:Number(x.atlagIdo),atlagKoltseg:Number(x.atlagKoltseg)}));
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

export default statisztikaRoutes;