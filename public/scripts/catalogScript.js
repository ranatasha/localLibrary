document.addEventListener('DOMContentLoaded', function() {
    let listBlock = document.querySelector('.listBlock')
    const filterButtons = document.getElementById('filter-buttons')
    let lastFilter = document.getElementById('defaultFilter')
    lastFilter.style.backgroundColor="#B0ADAD"
    lastFilter.style.boxShadow = "inset 0 0 2px rgb(0 0 0)"
    filterButtons.addEventListener('click', (event)=>{
        event.target.style.backgroundColor="#B0ADAD"
        event.target.style.boxShadow = "inset 0 0 2px rgb(0 0 0)"
        lastFilter.style.backgroundColor="#C2C2C2"
        lastFilter.style.boxShadow = 'none'
        if(event.target === document.getElementById('overdueFilter'))
            filterOverdue(listBlock)
        if(event.target === document.getElementById('inStockFilter'))
            filterInStock(listBlock)
        if(event.target === document.getElementById('defaultFilter'))
            filterNone(listBlock)
        lastFilter = event.target
    })

    loadReaders()

    const readerSelect = document.getElementById('reader-select')
    readerSelect.addEventListener('change', (event)=>{
        const returnDate = document.getElementById('returnDate')
        if(!event.target.value){
            returnDate.parentElement.style.display='none'
        }
        else{
            returnDate.parentElement.style.display='flex'
        }
    })

    const modalWindow = document.getElementById('modal-window')
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Escape") {
            modalWindow.style.display = "none";
            const title = document.getElementById('title')
            const author = document.getElementById('author')
            const releaseDate = document.getElementById('releaseDate')
            const readerEl = document.getElementById('reader-select')
            const returnDate = document.getElementById('returnDate')
            title.value = ''
            author.value = ''
            releaseDate.value = ''
            readerEl.value = ''
            returnDate.value=''
            const validationError = document.getElementById('validation-error')
            validationError.style.display = 'none';
            validationError.innerHTML='';
        }
    })
    const id = document.getElementById('id')
    id.parentElement.style.display = 'none'
    const returnDate = document.getElementById('returnDate')
    returnDate.parentElement.style.display='none'
}, false)

const openBookInfo = (id) => {
    window.location.href = `http://localhost:8080/catalog/${id}`
}

const removeBook = (id) => {
    const answer = confirm('Are you sure you want to permanently delete the book from the catalog? Data will be lost')
    if (answer) {
        fetch(`/catalog/${id}`, {
            method: 'DELETE'
        })
            .then((res)=>res.json())
            .then(({books, indexOfDeleted})=>{
                const bookItems = document.getElementsByClassName('book-item')
                bookItems[indexOfDeleted].style.display = 'none'

                if(books.length === 0) {
                    const listBlock = document.getElementsByClassName('listBlock')
                    const message = document.createElement('div')
                    message.classList = 'book-item'
                    message.innerHTML = 'There are no books in the HomeLibrary'
                    message.style.fontFamily = 'inherit'
                    message.style.fontFamily = "'Roboto', sans-serif"
                    message.style.fontWeight = "400"
                    message.style.fontSize = "28px"
                    listBlock[0].appendChild(message)
                }
            })
        console.log('Книга удалена')
    }
    else
        console.log('Удаление отменено')

}

const loadReaders = () => {
    fetch('/readers')
        .then((res)=>res.json())
        .then(({readers})=>{
            const readerSelect = document.getElementById('reader-select');
            const opt = document.createElement('option')
            opt.value = ''
            opt.innerHTML='Without reader / in stock'
            readerSelect.appendChild(opt)
            readers.forEach((reader) => {
                let opt2 = document.createElement('option')
                opt2.value=`${reader.id}`
                opt2.innerHTML=`${reader.name} ${reader.surname}`
                readerSelect.appendChild(opt2)
            })
        })
}

const getModalData = (mode) => {
    const newTitle = document.getElementById('title').value
    const newAuthor = document.getElementById('author').value
    const newReleaseDate = document.getElementById('releaseDate').value
    const newReader = document.getElementById('reader-select').value
    let newReturnDate = document.getElementById('returnDate').value
    if (!(newTitle&&newAuthor&&newReleaseDate)) {
        const validationError = document.getElementById('validation-error')
        validationError.style.display = 'block'
        validationError.style.textAlign ='center'
        validationError.innerHTML='Please, check if the fields are filled: <br>Title, Author and Release Date. '
        validationError.style.color = 'red'
    }
    else if(newReader&&!newReturnDate){
        const validationError = document.getElementById('validation-error')
        validationError.style.display = 'block'
        validationError.style.textAlign ='center'
        validationError.innerHTML='Please, enter the Return Date. '
        validationError.style.color = 'red'
    }
    else{
        const validationError = document.getElementById('validation-error')
        validationError.style.display = 'none'
        if(!newReader)
            newReturnDate = ''
        let newBook = {
            id: '',
            title: newTitle,
            author: newAuthor,
            releaseDate: newReleaseDate,
            readerID: newReader,
            returnDate: newReturnDate
        }
        switch (mode){
            case 'add-book':
                fetch('/catalog/size')
                    .then((res)=>res.json())
                    .then(({size})=>{
                        newBook.id = size+1
                        addBook(newBook)

                    })
                break
            case 'edit-book':
                const id = document.getElementById('id').value
                newBook.id = id
                editBook(newBook)
                break
        }
    }
}

const openAddModal = () => {
    const readerSelect = document.getElementById('reader-select');

    const addModal = document.getElementById('modal-window');
    addModal.showModal();
    addModal.style.display = "block";

    const returnDate = document.getElementById('returnDate')
    returnDate.parentElement.style.display = 'none'

    const modalHeader=document.getElementById('modalHeader')
    modalHeader.innerHTML = 'Add book'

    const buttonModals = document.getElementsByClassName('buttonModal')
    buttonModals[0].style.display='block'
    buttonModals[0].innerHTML = 'Add'
    buttonModals[1].style.display='none'


}


const addBook = (newBook) => {
    fetch('catalog/addBook', {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(newBook)
    })
        .then((res)=>{
            if (res.ok) {
                console.log('Отправка новой книги на сервер прошла')
                window.location.href = 'http://localhost:8080/catalog'
            }
        })
}

const openEditModal = (id) => {
    const readerSelect = document.getElementById('reader-select')
    fetch(`/book/${id}`)
        .then((res)=>res.json())
        .then((data)=>{
            let {book} = data
            const id = document.getElementById('id')
            const title = document.getElementById('title')
            const author = document.getElementById('author')
            const releaseDate = document.getElementById('releaseDate')
            id.value = book.id
            // id.parentElement.style.display = 'none'
            title.value = book.title
            author.value = book.author
            releaseDate.value = book.releaseDate
            readerSelect.value = book.readerID
            const returnDate = document.getElementById('returnDate')
            if(!book.readerID){
                returnDate.parentElement.style.display='none'
            }
            else{
                returnDate.value = book.returnDate
                returnDate.parentElement.style.display='flex'
            }
        })
    const modalHeader=document.getElementById('modalHeader')
    modalHeader.innerHTML = 'Edit book'

    const buttonModals = document.getElementsByClassName('buttonModal')
    buttonModals[0].style.display='none'
    buttonModals[1].style.display="block"
    buttonModals[1].innerHTML = 'Edit'

    const editModal = document.getElementById('modal-window');
    editModal.showModal();
    editModal.style.display = "block";
}

const editBook = (updatedBook) => {
    const selectedReaderID = document.getElementById('reader-select').value
    fetch(`/catalog/${updatedBook.id}`, {
                                                        // НАПИСАТЬ PUT-REQUEST НА ИЗМЕНЕНИЕ ДАННЫХ В БД
        method: 'PUT',
                                                        // + ОТРЕДАКТИРОВАТЬ POST ЗАПРОС НА ДОБАВЛЕНИЕ КНИГИ, ЧТОБЫ ОНА ПОЯВЛЯЛАСЬ В БД
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(updatedBook)
    })
        .then((res)=>{
            if (res.ok) {
                console.log(`Редактирование книги с id:${updatedBook.id} прошло успешно`)
                window.location.href = 'http://localhost:8080/catalog'
            }

        })

}
const closeModal = (el) => {
    el.closest('dialog').close();
    const modalWindow = document.getElementById('modal-window');
    modalWindow.style.display = "none";

    const title = document.getElementById('title')
    const author = document.getElementById('author')
    const releaseDate = document.getElementById('releaseDate')
    const readerEl = document.getElementById('reader-select')
    const returnDate = document.getElementById('returnDate')
    title.value = ''
    author.value = ''
    releaseDate.value = ''
    readerEl.value = ''
    returnDate.value=''

    const validationError = document.getElementById('validation-error')
    validationError.style.display = 'none';
    validationError.innerHTML='';
}

const filterNone = (listBlock) => {
    listBlock.childNodes.forEach(bookItem => {
        if(bookItem.classList.contains('filterHide'))
            bookItem.classList.remove('filterHide')
    })
}

function filterOverdue(listBlock) {
    filterNone(listBlock)
    fetch('/catalog/overdue')
        .then((res)=> res.json())
        .then(({notOverdueBookIndexes})=>{
            notOverdueBookIndexes.forEach(i => {
                listBlock.childNodes[i].classList.add('filterHide')
            })
        })
}

function filterInStock(listBlock) {
    filterNone(listBlock)
    fetch('/catalog/stock')
        .then((res)=> res.json())
        .then(({notStockBookIndexes})=>{
            notStockBookIndexes.forEach(i => {
                listBlock.childNodes[i].classList.add('filterHide')
            })
        })
}