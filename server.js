const express = require('express')
const app = express()
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser')

const port = '3000'
// criando db
const db = new sqlite3.Database('ebooks.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

const server = require('http').createServer(app)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

//rotas get
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/view/index.html')
})
app.get('/add/book',(req,res)=>{
    res.sendFile(__dirname+'/public/view/admin.html')
})



//rotas para adicionar dados no banco de dados
app.post('/add/new/book', (req, res) => {
    const { bookName, author ,price, description } = req.body;
  
    // Verifique se os dados do formulário estão presentes
    if (!bookName || !author || !price || !description) {
      return res.status(400).send('Todos os campos são obrigatórios');
    }
  
    // Insira os dados no banco de dados SQLite
    
      db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        bookName TEXT,
        author TEXT,
        price INTEGER,
        description TEXT
      )
    `);
  
      const sql = 'INSERT INTO books (bookName, author, price, description) VALUES (?, ?, ? , ?)';
      db.run(sql, [bookName, author, price, description], function (err) {
        if (err) {
          console.error('Erro ao inserir dados:', err.message);
          return res.status(500).send('Erro interno do servidor');
        }
        console.log(`Livro inserido com sucesso, ID: ${this.lastID}`);
        res.redirect('/add/book'); // Redirecione para a página inicial ou outra página apropriada
      });
  
      
    
  });
  app.post('/update/book', (req, res) => {
    const { bookname, nomeUpdate, authorUpdate, priceUpdate, descriptionUpdate } = req.body;
  
    db.run(
      'UPDATE books SET bookName = ?, author = ?, price = ?, description = ? WHERE bookname = ?',
      [nomeUpdate, authorUpdate, priceUpdate, descriptionUpdate, bookname],
      (err) => {
        if (err) {
          console.error('Erro ao atualizar dados:', err.message);
          return res.status(500).json({ error: 'Erro ao atualizar dados.' });
        }
  
       console.log('dados atualizados com sucesso')
       res.redirect('/add/book')
      }
    );
  });
  app.post('/delete/book', (req, res) => {
    const { bookname } = req.body;
  
    db.run(
      'DELETE FROM books WHERE bookName = ?',
      [bookname],
      (err) => {
        if (err) {
          console.error('Erro ao deletar dados:', err.message);
          return res.status(500).json({ error: 'Erro ao deletar dados.' });
        }
  
        console.log('dados deletados com sucesso');
        res.redirect('/add/book');
      }
    );
  });
  
  
  

  app.get('/get/books', (req, res) => {
    // Consulta SQL para obter todos os livros da tabela 'books'.
    const sql = 'SELECT * FROM books';
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Erro ao obter os dados:', err.message);
        return res.status(500).json({ error: 'Erro ao obter os dados.' });
      }
  
      // Retorna os dados como um array JSON.
      return res.status(200).json(rows);
    });
  });
  

server.listen(port ,()=>{
    console.log('servidor rodando na porta '+port)
})