import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import books from './routes/books.js'

const port = 8080;
const server = express();


//решаем отсутствие глобальных переменных __filename и __dirname решением из документации Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

server.use(express.json())

server.use('/public', express.static(path.join(__dirname, 'public')));
server.use('/', books);


server.get('/home', (req, res) => res.render('home') )
server.get('/', (req, res) => res.redirect(`http://localhost:${port}/home`));
server.get('*', (req, res) => res.status(404).end('Page not found'));


server.listen(port, () => {
    console.log(`Server has been started on port ${port}...`)
})

