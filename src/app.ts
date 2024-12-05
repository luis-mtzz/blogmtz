import express from 'express';
import cmsRoutes from './cms/router';

const app = express();
const port = 3000;

app.use(express.json());

app.use('/cms', cmsRoutes);

app.listen(port, () => {
    console.log(`Server listening @ http://localhost:${port}`);
});