let books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKS_SELF';
const BOOK_ITEM = 'itemId';

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");
    submitForm.addEventListener("submit", function (e) {
        e.preventDefault();
        addBook();
        submitForm.reset();
    });
    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        searchBook();
    });

    if (checkStorage()) {
        loadDataFromStorage();
        console.log(books);
    }
});

function addBook() {
    const titleBook = document.getElementById("inputBookTitle").value;
    const authorBook = document.getElementById("inputBookAuthor").value;
    const yearBook = document.getElementById("inputBookYear").value;
    const isComplete = document.getElementById("inputBookIsComplete").checked;
    const generatedID = generateId();

    const bookObject = generateBookObject(
        generatedID,
        titleBook,
        authorBook,
        yearBook,
        isComplete
    );
    books.unshift(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function checkStorage() {
    return typeof Storage !== 'undefined';
}

function saveData() {
    const parse = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parse);
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem
        (STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompleted = document.getElementById(
        "incompleteBookshelfList"
    );
    const completed = document.getElementById
        ("completeBookshelfList");
    uncompleted.innerHTML = "";
    completed.innerHTML = "";

    for (const bookItem of books) {
        const bookElement = createBook(bookItem);
        bookElement[BOOK_ITEM] = bookItem.id;

        if (bookItem.isComplete) {
            completed.append(bookElement);
        } else {
            uncompleted.append(bookElement);
        }
    }
});

function createBook(book) {
    const bookTitle = document.createElement("h3");
    bookTitle.innerText = book.title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = book.author;

    const bookYear = document.createElement("p");
    bookYear.innerText = book.year;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");

    const bookContent = document.createElement("article");
    bookContent.setAttribute("id", book.id);
    bookContent.classList.add("book_item");
    bookContent.append(bookTitle, bookAuthor, bookYear, buttonContainer);

    if (book.isComplete) {
        buttonContainer.append(createUndoButton(), createDeleteButton());
    } else {
        buttonContainer.append(createCheckButton(), createDeleteButton());
    }

    return bookContent;
}

function searchBook() {
    const titleSearch = document.getElementById("searchBookTitle").value;
    const uncompleted = document.getElementById("incompleteBookshelfList");
    const completed = document.getElementById
        ("completeBookshelfList");
    uncompleted.innerHTML = "";
    completed.innerHTML = "";

    if (titleSearch === "") {
        uncompleted.innerHTML = "";
        completed.innerHTML = "";
        books = [];
        console.log(books);
        if (checkStorage()) {
            loadDataFromStorage();
        }
    } else {
        const filterBook = books.filter((book) => {
            return book.title.toLowerCase().includes(titleSearch.toLowerCase());
        });
        console.log(filterBook);
        for (const bookItem of filterBook) {
            const bookElement = createBook(bookItem);
            bookElement[BOOK_ITEM] = bookItem.id;
            if (bookItem.isComplete) {
                completed.append(bookElement);
            } else {
                uncompleted.append(bookElement);
            }
        }
    }
}


function createCheckButton() {
    return createButton(
        "green",
        function (e) {
            addBookToCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById("searchBook");
            searchForm.reset();
        },
        "Selesai dibaca"
    );
}

function createUndoButton() {
    return createButton(
        "green",
        function (e) {
            undoBookFromCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById("searchBook");
            searchForm.reset();
        },
        "Belum selesai dibaca"
    );
}

function createDeleteButton() {
    return createButton(
        "red",
        function (e) {
            removeBookFromCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById("searchBook");
            searchForm.reset();
        },
        "Hapus"
    );
}

function createButton(buttonTypeClass, eventListener, text) {
    const buttons = document.createElement("button");
    buttons.classList.add(buttonTypeClass);
    buttons.innerText = text;
    buttons.addEventListener("click", function (e) {
        eventListener(e);
        e.stopPropagation();
    });
    return buttons;
}

function addBookToCompleted(bookElement) {
    const book = findBook(bookElement[BOOK_ITEM]);
    book.isComplete = true;
    bookElement.remove();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookElement) {
    const book = findBook(bookElement[BOOK_ITEM]);
    book.isComplete = false;
    bookElement.remove();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookElement) {
    const bookIndex = findBookByIndex(bookElement);
    books.splice(bookIndex, 1);
    bookElement.remove();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookByIndex(bookId) {
    let index = 0;
    for (const book of books) {
        if (book.id === bookId) {
            return index;
        }
        index++;
    }
    return -1;
}
