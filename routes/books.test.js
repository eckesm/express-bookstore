process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testBook;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`
	);
	testBook = result.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM books`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /books', () => {
	test('Get a list of all books', async () => {
		const res = await request(app).get(`/books`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ books: [ testBook ] });
	});
});

describe('GET /books/:isbn', () => {
	test('Get a single book', async () => {
		const res = await request(app).get(`/books/${testBook.isbn}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ book: testBook });
	});
	test('Respond with 404 for invalid isbn', async () => {
		const res = await request(app).get(`/books/999999999`);
		expect(res.statusCode).toBe(404);
	});
});

let newTestBook = {
	isbn       : '398457893475',
	amazon_url : 'http://a.co/harrypotter',
	author     : 'JK Rowling',
	language   : 'british english',
	pages      : 666,
	publisher  : '...Not Sure...',
	title      : 'Harry Potter 3',
	year       : 2008
};
describe('POST /books', () => {
	test('Creates a book', async () => {
		const res = await request(app).post(`/books`).send(newTestBook);
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			book : newTestBook
		});
	});
});

describe('PUT /books/:isbn', () => {
	test('Updates a book', async () => {
		testBook.pages = 715;
		const res = await request(app).put(`/books/${testBook.isbn}`).send(testBook);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			book : testBook
		});
	});
});

describe('DELETE /books/:id', () => {
	test('Delete a single book', async () => {
		const res = await request(app).delete(`/books/${testBook.isbn}`);
		expect(res.statusCode).toBe(200);
	});
});
