const express = require('express'); // importar libreria
const cors = require('cors');
const juego = require('./juego');//importa el archivo 
const app = express(); // crea el server 

app.use(cors());
app.use(express.json());//para que el server sepa que se le envian JSon

app.get('/game', function (req, res) { // describe endpoint. GET, PATH=/, FUNCTION=El codigo

    let filter = req.query.filter;//el tipo de filtro
    let filterValue = req.query.filterValue;//el dato por el cual se va a filtrar

    res.status(200).send(juego.listGames(filter, filterValue));
})

app.post('/game/create', function (req, res) {
    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let nombre = req.body.name; //undefined recupera el nombre
    let pass = req.body.password;//recupera la contraseña

    if (!jugador || !nombre) {//para controlar el error si manda un dato nulo 
        res.status(406).send({
            "error": "Campos obligatorios faltantes"
        });
        return;
    }

    let juegoCreado = juego.create(jugador, nombre, pass);
    res.status(200).send(juegoCreado)
})

app.get('/game/:gameid', function (req, res) {
    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let pass = req.header('password')//para agarrar el header el nombre del jugador
    let id = req.params.gameid;

    let result = juego.extractGame(id, jugador, pass);

    if (result === "404") {
        res.status(404).send({
            "error": "No existe el juego"
        })
        return;
    } else if (result === "403") {
        res.status(403).send({
            "error": "Jugador no se encuentra en el juego"
        })
    } else {
        res.status(200).send(result)
    }
})

app.put('/game/:gameid/join', function (req, res) {

    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let pass = req.header('password')//para agarrar el header el nombre del jugador
    let id = req.params.gameid;

    let result = juego.joinGame(id, jugador, pass);
    //falta los demas errores
    if (result === "404") {
        res.status(404).send({ "error": "Juego no existe" })

    } else if (result === "406") {
        res.status(406).send({ "error": "Juego esta lleno" })

    } else if (result === "409") {
        res.status(409).send({ "error": "Ya estas en el juego" })

    } else {
        res.status(200).send({
            "message": "Operation successful"
        })
    }
})


app.head('/game/:gameid/start', function (req, res) {

    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let pass = req.header('password')//para agarrar el header el nombre del jugador
    let id = req.params.gameid;

    let result = juego.startGame(id, jugador, pass);

    if (result === "401") {
        res.status(401).send()
    } else if (result === "403") {
        res.status(403).send()
    } else if (result === "404") {
        res.status(404).send()
    } else {
        res.status(200).send()
    }

})

app.post('/game/:gameid/group', function (req, res) {

    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let pass = req.header('password')//para agarrar el header el nombre del jugador
    let id = req.params.gameid;
    let group = req.body.group;

    let result = juego.group(id, jugador, pass, group);

    if (result === "401") {
        res.status(401).send({ "error": "You are not the round leader" })
    } else if (result === "403") {
        res.status(403).send({ "error": "You are not part of the players list" })
    } else if (result === "404") {
        res.status(404).send({ "error": "Game Not Found" })
    }else if (result === "406") {
        res.status(406).send({ "error": "Invalid Game status or payload" })
    }else if (result === "409") {
        res.status(409).send({ "error": "There is already a group for this round" })
    } else {
        res.status(200).send({ "message": "Operation Successful" })
    }

})

app.post('/game/:gameid/go', function (req, res) {

    let jugador = req.header('name')//para agarrar el header el nombre del jugador
    let pass = req.header('password')//para agarrar el header el nombre del jugador
    let id = req.params.gameid;
    let psycho = req.body.psycho;

    let result = juego.go(id, jugador, pass, psycho);

    if (result === "401") {
        res.status(401).send({ "error": "You are not part of the round list" })
    } else if (result === "403") {
        res.status(403).send({ "error": "You are not part of the players list" })
    } else if (result === "404") {
        res.status(404).send({ "error": "Game Not Found" })
    }else if (result === "406") {
        res.status(406).send({ "error": "Invalid data provided" })
    }else if (result === "409") {
        res.status(409).send({ "error": "There is already an entry for you on this round" })
    } else {
        res.status(200).send({ "message": "Operation Successful" })
    }

})

console.log('Iniciando Server');
app.listen(80) // puerto del server
juego.loadGames();
console.log('Server Iniciado');