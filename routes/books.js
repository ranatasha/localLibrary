import express from 'express';
import fs from 'fs';
const booksFile = './db/books.json';
const readersFile = './db/readers.json';

let books = JSON.parse(fs.readFileSync(booksFile));
let readers = JSON.parse(fs.readFileSync(readersFile));
let router = express.Router();

const app = express()


router.get('/catalog', (req, res) => {
    console.log('Загружаю каталог...')
    res.render('catalog', { books });
});
router.get('/book/:id', function (req, res) {
    const book = books.find((book) => book.id === req.params.id);
    if(!book)
        res.status(404).send("Not Found. A book with this ID doesn't exist")
    res.json({book})
    console.log(`Получаю инфо о книге с id:${req.params.id}...`);
});
router.delete('/catalog/:id', function (req, res) {
    const book = books.find((book) => book.id === req.params.id);
    if(!book)
       res.status(404).send("Not Found. A book with this ID doesn't exist")
    let indexOfDeleted, ind;
    books.forEach((book, index)=> {
        if(parseInt(book.id) === parseInt(req.params.id)) {
            indexOfDeleted = index
        }
    })
    books.splice(indexOfDeleted, 1)
    //console.log(books)
    res.json({books, indexOfDeleted})
    console.log(`Удалил книгу с id:${req.params.id} из каталога...`)
})
router.get('/readers', function (req, res) {
    res.json({
        readers: readers
    })
    console.log('Получаю список читателей...')
})
router.get('/readers/:id', function (req, res) {
    let reader = readers.find((reader)=> parseInt(reader.id) === parseInt(req.params.id))
    res.json({
        reader: reader
    })
    console.log(`Получаю инфо о читателе с id:${req.params.id}...`)
});

router.post('/catalog/addBook', function (req, res) {
    let { id, title, author, releaseDate, readerID, returnDate } = req.body
    res.sendStatus(200)
    console.log('Добавляю новую книгу:', id, title, author, releaseDate, readerID, returnDate + '...')
    books.push({id: String(id), title: title, author:author, releaseDate:releaseDate, readerID: readerID, returnDate: returnDate})
})

router.put('/catalog/:id', function (req, res) {
    let { id, title, author, releaseDate, readerID, returnDate } = req.body
    res.sendStatus(200)
    let book = books.find((book)=>book.id === id)
    book.id = id
    book.title = title
    book.author = author
    book.releaseDate = releaseDate
    book.readerID = readerID
    book.returnDate = returnDate
    console.log(`Редактирую книгу с id: ${id}...`)
})

router.get(`/catalog/size`, function (req, res) {
    let maxID = 0;
    books.forEach(book => {
        if(parseInt(book.id) > maxID)
            maxID = parseInt(book.id)
    })
    res.json({
        size: maxID
    })
})
router.get('/catalog/overdue', function (req, res) {
    let notOverdueBookIndexes = []
    let curDate = new Date()
    for(let i=0; i<books.length; i++) {
        if (books[i].readerID) {
            var retDate = new Date(books[i].returnDate) //унарный '+' для приведения к числу
            if ((retDate - curDate) > 0)
                notOverdueBookIndexes.push(i)
        }
        else {
            notOverdueBookIndexes.push(i)
        }
    }
    res.json({notOverdueBookIndexes})
})
router.get('/catalog/stock', function (req, res) {
    let notStockBookIndexes = []
    for (let i = 0; i < books.length; i++) {
        if (books[i].readerID)
            notStockBookIndexes.push(i)
    }
    res.json({notStockBookIndexes})
})

router.put('/catalog/return/:id', function(req, res){
    let book = books.find((book)=> parseInt(book.id) === parseInt(req.params.id))
    book.readerID = ''
    book.returnDate = ''
    res.sendStatus(200)
    console.log(`Возвращаю с рук книгу с id: ${req.params.id} в библиотеку...`)
})

router.put('/catalog/handout/:id', function(req, res){
    let { readerID, returnDate } = req.body
    res.sendStatus(200)
    const book = books.find((book) => book.id === req.params.id);
    book.readerID = readerID
    book.returnDate = returnDate
    console.log(`Выдаю книгу с id: ${req.params.id} читателю...`)
})

router.get('/catalog/:id', function (req, res) {
    const book = books.find((book) => book.id === req.params.id);
    if(!book)
        res.status(404).send("Not Found. A book with this ID doesn't exist")
    if (book.readerID && parseInt(book.readerID) <= readers.length){
        var reader = readers.find((reader)=> parseInt(reader.id) === parseInt(book.readerID))
    }
    else
        reader = null;
    res.render('book', {book, reader})
    console.log(`Открываю страницу книги с id:${req.params.id}...`)
});

export default router;