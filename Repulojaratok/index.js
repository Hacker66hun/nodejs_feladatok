import express from 'express';
import legitarsasagokRoutes from './Routes/legitarsasagok.js';
import utvonalRoutes from './Routes/utvonal.js';
import repuloterekRoutes from './Routes/repuloterek.js';
import jaratokRoutes from './Routes/jaratok.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/legitarsasagok', legitarsasagokRoutes);
app.use('/utvonal', utvonalRoutes);
app.use('/repuloterek', repuloterekRoutes);
app.use('/jaratok', jaratokRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
