import express from 'express';
import npc from './npc.js';
import shop from './shop.js';
import tavern from './tavern.js';
import feature from './feature.js';
import leader from './leader.js';
import description from './description.js';

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
