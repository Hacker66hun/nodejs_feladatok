import pool from "../data/db.js";
import { Router } from "express";
const receptekRoutes=Router();

async function receptLekerdezes(id,adag=null){
    let sql='SELECT r.id,r.nev,r.kategoria,r.adag,r.ido,h.id AS hozzavalo_id,h.nev AS hozzavalo,h.mertekegyseg,rh.mennyiseg,h.egysegar FROM receptek r LEFT JOIN recept_hozzavalok rh ON rh.recept_id=r.id LEFT JOIN hozzavalok h ON h.id=rh.hozzavalo_id WHERE r.id=? ORDER BY h.nev';
    let [rows]=await pool.query(sql,[id]);
    if(rows.length===0)return null;
    const alapAdag=rows[0].adag;
    const kertAdag=adag===null?alapAdag:adag;
    const szorzo=kertAdag/alapAdag;
    let koltseg=0;
    let hozzavalok=[];
    for(const row of rows){
        if(row.hozzavalo_id!==null){
            const mennyiseg=Number((row.mennyiseg*szorzo).toFixed(2));
            const egysegkoltseg=Number(row.egysegar);
            const hozzavaloKoltseg=Number((mennyiseg*egysegkoltseg).toFixed(2));
            koltseg+=hozzavaloKoltseg;
            hozzavalok.push({id:row.hozzavalo_id,nev:row.hozzavalo,mennyiseg,mertekegyseg:row.mertekegyseg,koltseg:Math.round(hozzavaloKoltseg)});
        }
    }
    koltseg=Math.round(koltseg);
    return {id:rows[0].id,nev:rows[0].nev,kategoria:rows[0].kategoria,adag:kertAdag,ido:rows[0].ido,hozzavalok,koltseg,adagonkent:Math.round(koltseg/kertAdag)};
}

receptekRoutes.get("/kereses",async(req,res)=>{
    try{
        const {van}=req.query;
        if(!van)return res.status(400).json({hibak:["A van paraméter kötelező!"]});
        const nevek=van.split(",").map(x=>x.trim()).filter(x=>x);
        if(nevek.length===0)return res.status(400).json({hibak:["Legalább egy hozzávalót meg kell adni!"]});
        let sql='SELECT r.id,r.nev,r.kategoria FROM receptek r JOIN recept_hozzavalok rh ON rh.recept_id=r.id JOIN hozzavalok h ON h.id=rh.hozzavalo_id WHERE h.nev IN (?) GROUP BY r.id,r.nev,r.kategoria HAVING COUNT(DISTINCT h.id)=? ORDER BY r.nev';
        let [eredmeny]=await pool.query(sql,[nevek,nevek.length]);
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

receptekRoutes.get("/",async(req,res)=>{
    try{
        const {kategoria,maxIdo}=req.query;
        const kategoriak=["reggeli","leves","főétel","desszert"];
        let params=[];
        let szurok=[];
        if(kategoria!==undefined){
            if(!kategoriak.includes(kategoria))return res.status(400).json({hiba:"Hibás kategória!"});
            szurok.push("r.kategoria=?");
            params.push(kategoria);
        }
        if(maxIdo!==undefined){
            const ido=Number(maxIdo);
            if(!Number.isInteger(ido)||ido<0)return res.status(400).json({hiba:"Hibás idő!"});
            szurok.push("r.ido<=?");
            params.push(ido);
        }
        let sql='SELECT r.id,r.nev,r.kategoria,r.adag,r.ido,COUNT(rh.hozzavalo_id) AS hozzavaloDb,ROUND(COALESCE(SUM(rh.mennyiseg*h.egysegar),0)) AS koltseg FROM receptek r LEFT JOIN recept_hozzavalok rh ON rh.recept_id=r.id LEFT JOIN hozzavalok h ON h.id=rh.hozzavalo_id';
        if(szurok.length>0)sql+=" WHERE "+szurok.join(" AND ");
        sql+=' GROUP BY r.id,r.nev,r.kategoria,r.adag,r.ido ORDER BY r.nev';
        let [eredmeny]=await pool.query(sql,params);
        eredmeny=eredmeny.map(x=>({...x,hozzavaloDb:Number(x.hozzavaloDb),koltseg:Number(x.koltseg)}));
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

receptekRoutes.get("/:id",async(req,res)=>{
    try{
        const id=Number(req.params.id);
        if(!Number.isInteger(id)||id<=0)return res.status(400).json({hiba:"Hibás azonosító!"});
        let adag=null;
        if(req.query.adag!==undefined){
            adag=Number(req.query.adag);
            if(!Number.isInteger(adag)||adag<=0)return res.status(400).json({hiba:"Hibás adag!"});
        }
        const eredmeny=await receptLekerdezes(id,adag);
        if(!eredmeny)return res.status(404).json({hiba:"A recept nem található!"});
        res.json(eredmeny);
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

receptekRoutes.post("/:id/hozzavalok",async(req,res)=>{
    const conn=await pool.getConnection();
    try{
        const receptId=Number(req.params.id);
        const hozzavaloId=Number(req.body.hozzavaloId);
        const mennyiseg=Number(req.body.mennyiseg);
        const hibak=[];
        if(!Number.isInteger(receptId)||receptId<=0)hibak.push("Hibás recept azonosító!");
        if(!Number.isInteger(hozzavaloId)||hozzavaloId<=0)hibak.push("A hozzavaloId kötelező és pozitív egész szám!");
        if(!Number.isInteger(mennyiseg)||mennyiseg<=0)hibak.push("A mennyiseg kötelező és pozitív egész szám!");
        if(hibak.length>0)return res.status(400).json({hibak});
        await conn.beginTransaction();
        const [recept]=await conn.query("SELECT id FROM receptek WHERE id=?",[receptId]);
        if(recept.length===0){
            await conn.rollback();
            return res.status(404).json({hiba:"A recept nem található!"});
        }
        const [hozzavalo]=await conn.query("SELECT id FROM hozzavalok WHERE id=?",[hozzavaloId]);
        if(hozzavalo.length===0){
            await conn.rollback();
            return res.status(404).json({hiba:"A hozzávaló nem található!"});
        }
        const [letezik]=await conn.query("SELECT 1 FROM recept_hozzavalok WHERE recept_id=? AND hozzavalo_id=?",[receptId,hozzavaloId]);
        if(letezik.length>0){
            await conn.rollback();
            return res.status(409).json({hiba:"A hozzávaló már szerepel a receptben!"});
        }
        await conn.query("INSERT INTO recept_hozzavalok (recept_id,hozzavalo_id,mennyiseg) VALUES (?,?,?)",[receptId,hozzavaloId,mennyiseg]);
        await conn.commit();
        const eredmeny=await receptLekerdezes(receptId);
        res.status(201).json(eredmeny);
    }catch(error){
        await conn.rollback();
        if(error.code==="ER_DUP_ENTRY")return res.status(409).json({hiba:"A hozzávaló már szerepel a receptben!"});
        res.status(500).json({hiba:error.message});
    }finally{
        conn.release();
    }
});

receptekRoutes.delete("/:id/hozzavalok/:hozzavaloId",async(req,res)=>{
    try{
        const receptId=Number(req.params.id);
        const hozzavaloId=Number(req.params.hozzavaloId);
        if(!Number.isInteger(receptId)||receptId<=0||!Number.isInteger(hozzavaloId)||hozzavaloId<=0)return res.status(400).json({hiba:"Hibás azonosító!"});
        const [eredmeny]=await pool.query("DELETE FROM recept_hozzavalok WHERE recept_id=? AND hozzavalo_id=?",[receptId,hozzavaloId]);
        if(eredmeny.affectedRows===0)return res.status(404).json({hiba:"A hozzávaló nem található a receptben!"});
        res.status(204).send();
    }catch(error){
        res.status(500).json({hiba:error.message});
    }
});

export default receptekRoutes;