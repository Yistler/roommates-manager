const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
require('dotenv').config();

const getRoommates = async () => {
    const res = await axios.get('https://randomuser.me/api/');
    const user = res.data.results[0];
    console.log(user);
    return {
        id: uuidv4(),
        nombre: `${user.name.first} ${user.name.last}`,
        debe: 0,
        recibe: '0',
        imagen: `${user.picture.thumbnail}`
    };
};
const recalculateDebe = () => {
    const roommates = JSON.parse(fs.readFileSync('data/roommates.json', 'utf8'));
    const gastos = JSON.parse(fs.readFileSync('data/gastos.json', 'utf8'));

    // Resetear 'debe' a 0 para todos los roommates
    roommates.roommates.forEach(r => r.debe = 0);

    // Sumarizar el 'debe' de cada roommate basándose en los gastos
    gastos.gastos.forEach(g => {
        const roommate = roommates.roommates.find(r => r.nombre === g.roommate);
        if (roommate) {
            roommate.debe += g.monto;
        }
    });

    // Guardar los cambios en el archivo
    fs.writeFileSync('data/roommates.json', JSON.stringify(roommates));
};

module.exports = {
    getRoommates, recalculateDebe

};