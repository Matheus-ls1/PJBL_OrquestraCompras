import 'dotenv/config';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3002);
createApp().listen(port, () => console.log(`Budget Service listening on port ${port}`));
