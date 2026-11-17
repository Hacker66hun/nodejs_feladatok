import express from "express";
import receptekRoutes from "./routes/receptek.js";
import hozzavalokRoutes from "./routes/hozzavalok.js";
import statisztikaRoutes from "./routes/statisztika.js";

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello, World!");
});

app.use("/receptek",receptekRoutes);
app.use("/hozzavalok",hozzavalokRoutes);
app.use("/statisztika",statisztikaRoutes);

app.use((req,res)=>{
    res.status(404).json({hiba:"Az oldal nem található!"});
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});