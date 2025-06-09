import express from 'express';
import npc from './routes/npc.js';
import shop from './routes/shop.js';
import tavern from './routes/tavern.js';
import feature from './routes/feature.js';
import leader from './routes/leader.js';
import description from './routes/description.js';

const app = express();
app.use(express.json());

app.use('/api/npc', npc);
app.use('/api/shop', shop);
app.use('/api/tavern', tavern);
app.use('/api/feature', feature);
app.use('/api/leader', leader);
app.use('/api/description', description);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
