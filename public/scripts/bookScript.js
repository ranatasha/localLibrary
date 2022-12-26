document.addEventListener('DOMContentLoaded', function() {
    const idElem = document.getElementById('elemBookID')
    idElem.style.display='none'
    loadReaders()
    const handOutModal = document.getElementById('handout-modal')
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Escape") {
            handOutModal.style.display = "none";
            const readerSelect = document.getElementById('reader-select')
            readerSelect.value = ''
            const handOutReturnDate = document.getElementById('handOutReturnDate')
            handOutReturnDate.value= ''
            const validationError = document.getElementById('validation-error')
            validationError.style.display = 'none'
        }
    })
}, false)
const returnToCatalog = () => {
    window.location.href = 'http://localhost:8080/catalog';
}
const openReaderInfo = (id) => {
    const readerModal = document.getElementById('reader-modal');

    fetch(`/readers/${id}`)
        .then((res) => res.json())
        .then(({ reader }) => {
            document.getElementById('readerName').innerHTML = reader.name;
            document.getElementById('readerSurname').innerHTML = reader.surname;
            document.getElementById('returnDate').innerHTML = document.getElementById('bookReturnDate').innerHTML;
        })
    readerModal.showModal();
    readerModal.style.display = "block";
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === "Escape") {
            readerModal.style.display = "none";
        }
    });
}

const returnBook = () => {
    const bookID = document.getElementById('id').innerHTML
    fetch(`/catalog/return/${bookID}`, {
        method: 'PUT'
    })
        .then(()=> {
            window.location.reload()
            console.log(`Книга с id:${bookID} возвращена с рук в библиотеку`)
        })
}

const openHandOutModal = () => {
    const handOutModal = document.getElementById('handout-modal')
    handOutModal.showModal()
    handOutModal.style.display = 'block'
    const bookID = document.getElementById('id').innerHTML
}

const getModalData = () => {
    const readerSelect = document.getElementById('reader-select').value
    const handOutReturnDate = document.getElementById('handOutReturnDate').value
    const validationError = document.getElementById('validation-error')
    if (!(readerSelect && handOutReturnDate)) {
        validationError.style.display = 'block'
        validationError.style.textAlign ='center'
        validationError.innerHTML='Please, enter the Reader AND Return Date. '
        validationError.style.color = 'red'
    } else {
        validationError.style.display = 'none'
        let newData = {
            readerID: readerSelect,
            returnDate: handOutReturnDate
        }
        handOutBook(newData)
    }
}

const handOutBook = (newData) => {
    const bookID = document.getElementById('id').innerHTML
    fetch(`/catalog/handout/${bookID}`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(newData)
    })
        .then((res)=>{
            if (res.ok) {
                window.location.href = `http://localhost:8080/catalog/${bookID}`
            }
        })
}

const loadReaders = () => {
    fetch('/readers')
        .then((res)=>res.json())
        .then(({readers})=>{
            const readerSelect = document.getElementById('reader-select');
            const opt = document.createElement('option')
            opt.value = ''
            opt.innerHTML='--Choose a reader--'
            readerSelect.appendChild(opt)
            readers.forEach((reader) => {
                let opt2 = document.createElement('option')
                opt2.value=`${reader.id}`
                opt2.innerHTML=`${reader.name} ${reader.surname}`
                readerSelect.appendChild(opt2)
            })
        })
}

const closeModal = (el) => {
    el.closest('dialog').close();
    const readerModal = document.getElementById('reader-modal');
    readerModal.style.display = "none";
}

const closeHandOutModal = (el) => {
    el.closest('dialog').close();
    const handOutModal = document.getElementById('handout-modal');
    handOutModal.style.display = "none";
    const readerSelect = document.getElementById('reader-select')
    readerSelect.value = ''
    const handOutReturnDate = document.getElementById('handOutReturnDate')
    handOutReturnDate.value= ''
    const validationError = document.getElementById('validation-error')
    validationError.style.display = 'none'
}