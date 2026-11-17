import pool from "../data/db.js";
import { Router } from "express";
const foglalasokRoutes = Router();

foglalasokRoutes.post("/",async(req,res)=>{
    const {vetitesId,nev,sor,szek}=req.body;
    const hibak=[];
    if(!vetitesId) hibak.push("A vetitesId kötelező!");
    if(typeof nev!=="string"||nev.trim()==="") hibak.push("A név kötelező!");
    if(!Number.isInteger(sor)||sor<=0) hibak.push("A sor hibás!");
    if(!Number.isInteger(szek)||szek<=0) hibak.push("A szék hibás!");
    if(hibak.length) return res.status(400).json({hibak});
    
    let sql='SELECT v.id,v.jegyar,v.kezdes,f.cim,t.nev AS terem,t.sorok,t.szekek FROM vetitesek v JOIN filmek f ON f.id=v.film_id JOIN termek t ON t.id=v.terem_id WHERE v.id=?';
    let [vetites]=await pool.query(sql,[vetitesId]);
    if(vetites.length===0) return res.status(404).json({hiba:"A vetítés nem található!"});
    
    const v=vetites[0];
    if(sor>v.sorok) return res.status(400).json({hibak:["A sor nem létezik!"]});
    if(szek>v.szekek) return res.status(400).json({hibak:["A szék nem létezik!"]});
    
    sql='SELECT COUNT(*) AS db FROM foglalasok WHERE vetites_id=?';
    let [db]=await pool.query(sql,[vetitesId]);
    if(Number(db[0].db)>=v.sorok*v.szekek) return res.status(409).json({hiba:"A vetítés telt házas!"});
    
    try{
        let [eredmeny]=await pool.query('INSERT INTO foglalasok (vetites_id,nev,sor,szek) VALUES (?,?,?,?)',[vetitesId,nev.trim(),sor,szek]);
        res.status(201).json({id:eredmeny.insertId,film:v.cim,terem:v.terem,kezdes:v.kezdes,nev:nev.trim(),sor,szek,jegyar:v.jegyar});
    }catch(error){
        if(error.code==="ER_DUP_ENTRY") return res.status(409).json({hiba:"A hely már foglalt!"});
        res.status(500).json({hiba:error.message});
    }
});

foglalasokRoutes.delete("/:id",async(req,res)=>{
    if(!/^\d+$/.test(req.params.id)) return res.status(400).json({hiba:"Hibás azonosító!"});
    let [eredmeny]=await pool.query("DELETE FROM foglalasok WHERE id=?",[req.params.id]);
    if(eredmeny.affectedRows===0) return res.status(404).json({hiba:"A foglalás nem található!"});
    res.status(204).send();
});

export default foglalasokRoutes;