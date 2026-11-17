import express from "express";
import filmekRoutes from "./routes/filmek.js";
import vetitesekRoutes from "./routes/vetitesek.js";
import foglalasokRoutes from "./routes/foglalasok.js";
import statisztikaRoutes from "./routes/statisztika.js";

const app=express();
const PORT=process.env.PORT||3000;

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello, World!");
});

app.use("/filmek",filmekRoutes);
app.use("/vetitesek",vetitesekRoutes);
app.use("/foglalasok",foglalasokRoutes);
app.use("/statisztika",statisztikaRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});