import mysql from 'mysql2';
import 'dotenv/config';

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Falha ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco MySQL (buffet_tcc) estabelecida com sucesso!');
});

export default db;