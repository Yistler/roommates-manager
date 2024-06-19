const express = require ("express");
const app = express();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getRoommates, recalculateDebe } = require('./helpers/roommates');
const host = process.env.HOST || "localhost";
const protocol = process.env.PROTOCOL || "http"; 
const port = process.env.PORT || 3000;
require('dotenv').config();

app.listen(port, () => {
    console.info (`Servidor disponible en ${protocol}://${host}:${port}`)
});

app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post('/roommate', async (req, res) => {
    try {
        const roommate = await getRoommates();
        let roommates = JSON.parse(fs.readFileSync('data/roommates.json', 'utf8'));
        roommates.roommates.push(roommate);
        fs.writeFileSync('data/roommates.json', JSON.stringify(roommates));
        res.status(201).send(roommate);
    } catch (error) {
        res.status(500).send({ error: 'Error adding roommate' });
    }
});
//obtiene la info de la api 
app.get('/roommates', (req, res) => {
    const roommates = JSON.parse(fs.readFileSync('data/roommates.json', 'utf8'));
    
    res.send(roommates);
});

app.get('/gastos', (req, res) => {
    const gastos = JSON.parse(fs.readFileSync('data/gastos.json', 'utf8'));
    
    res.send(gastos);
});

app.post('/gasto', (req, res) => {
    const { roommate, descripcion, monto } = req.body;
    let gastos = JSON.parse(fs.readFileSync('data/gastos.json', 'utf8'));
    
    const newGasto = {
        id: uuidv4(),
        roommate,
        descripcion,
        monto
    };
    gastos.gastos.push(newGasto);
   
    fs.writeFileSync('data/gastos.json', JSON.stringify(gastos));
    recalculateDebe();
    res.status(201).send(newGasto);
});

app.put('/gasto', (req, res) => {
    const id = req.query.id;    
    const { roommate, descripcion, monto } = req.body;
    let gastos = JSON.parse(fs.readFileSync('data/gastos.json', 'utf8'));
    const index = gastos.gastos.findIndex(g => g.id === id);
    if (index !== -1) {
        gastos.gastos[index] = { id, roommate, descripcion, monto };
        fs.writeFileSync('data/gastos.json', JSON.stringify(gastos));
        recalculateDebe();
        res.send(gastos.gastos[index]);
    } else {
        res.status(404).send({ error: 'Gasto not found' });
    }
});

app.delete('/gasto', (req, res) => {
    const { id } = req.query;
    let gastos = JSON.parse(fs.readFileSync('data/gastos.json', 'utf8'));
    gastos.gastos = gastos.gastos.filter(g => g.id !== id);
    fs.writeFileSync('data/gastos.json', JSON.stringify(gastos));
    recalculateDebe();
    res.send({ success: true });
});
app.delete('/roommate', (req, res) => {
    const { id } = req.query;
    let roommates = JSON.parse(fs.readFileSync('data/roommates.json', 'utf8'));
    roommates.roommates = roommates.roommates.filter(r => r.id !== id);
    fs.writeFileSync('data/roommates.json', JSON.stringify(roommates));
    res.send({ success: true });
});

