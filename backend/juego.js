const uuid = require('uuid'); //libreria para generar los id
const fs = require('fs');

var games = {}

const saveGame = () => {
    let data = JSON.stringify(games);
    fs.writeFileSync('games.json', data);
}

const createNewRound = (game) => {
    game.status = "leader";
    game.rounds.push({ "id": game.rounds.length, "group": [], "leader": game.players[Math.floor(Math.random() * game.players.length)] })
}

const isGroupValid = (group, game) => {
    let validPlayers = group.filter(player => !game.players.includes(player)).length === 0;
    if (!validPlayers) {
        return false;
    }

    let validWeek = false;
    let week = game.rounds.length;
    let playerCount = game.players.length;
    switch (week) {
        case 1:
            switch (playerCount) {
                case 5:
                case 6:
                case 7:
                    validWeek = group.length === 2;
                    break;
                case 8:
                case 9:
                case 10:
                    validWeek = group.length === 3;
                    break;
            }
            break;
        case 2:
            switch (playerCount) {
                case 5:
                case 6:
                case 7:
                    validWeek = group.length === 3;
                    break;
                case 8:
                case 9:
                case 10:
                    validWeek = group.length === 4;
                    break;
            }
            break;
        case 3:
            switch (playerCount) {
                case 5:
                    validWeek = group.length === 2;
                    break;
                case 7:
                    validWeek = group.length === 3;
                    break;
                case 6:
                case 8:
                case 9:
                case 10:
                    validWeek = group.length === 4;
                    break;
            }
            break;
        case 4:
            switch (playerCount) {
                case 5:
                case 6:
                    validWeek = group.length === 3;
                    break;
                case 7:
                    validWeek = group.length === 4;
                    break;
                case 8:
                case 9:
                case 10:
                    validWeek = group.length === 5;
                    break;
            }
            break;
        case 5:
            switch (playerCount) {
                case 5:
                    validWeek = group.length === 3;
                    break;
                case 6:
                case 7:
                    validWeek = group.length === 4;
                    break;
                case 8:
                case 9:
                case 10:
                    validWeek = group.length === 5;
                    break;
            }
            break;
    }
    return validWeek;
}

const advanceRound = (game) => {
    const roundComplete = game.rounds[game.rounds.length - 1].group.filter(player => player.psycho === null).length === 0;
    if (roundComplete) {
        const psychoRound = game.rounds[game.rounds.length - 1].group.filter(player => player.psycho).length > 0;
        game.rounds[game.rounds.length - 1].winner = psychoRound ? "psychos" : "players";
        game.psychoWin.push(psychoRound);

        const psychoWon = game.psychoWin.filter(i => i).length === 3;
        const playerWon = game.psychoWin.filter(i => !i).length === 3;

        if (psychoWon || playerWon) {
            game.status = "ended";
        } else {
            createNewRound(game);
        }
    }
}

module.exports = {
    loadGames: function () {
        let rawdata = fs.readFileSync('games.json');
        games = JSON.parse(rawdata);
    },
    listGames: function (filter, filterValue) {
        let juegosFiltrados = [];

        for (id in games) {//para recorrer los juegos creados de la biblioteca por los id
            if (filter && filterValue) {// si viene con los filtros //sino devuelve todo los juegos

                if (games[id][filter] != filterValue) {//si el juego es igual al filtro 
                    continue //para que siga con el siguiente en el for sin pasar por el demas codigo
                }
            }
            juegosFiltrados.push({
                "gameId": id,
                "name": games[id].name
            });
        }
        return juegosFiltrados;
    },

    create: function (jugador, juego, pass) {
        let id = uuid.v4();
        games[id] = {
            "gameId": id,
            "name": juego,
            "owner": jugador,
            "password": pass,
            "players": [
                jugador
            ],
            "psychos": [],
            "psychoWin": [],
            "status": "lobby",
            "rounds": []
        }
        saveGame();
        return games[id];
    },

    joinGame: function (id, name, pass) {

        //si existe el juego y la pass hace match
        if (!(id in games) || (games[id].password && games[id].password !== pass)) {
            return "404";
        }


        if (games[id].status!=="lobby") {
            return "406";
        }

        let playersGame = games[id].players;
        //si ya esta lleno
        if (playersGame.length == 10) {
            return "406";
        }

        //recorre la lista de jugadores para ver si existe 
        for (let i = 0; i < playersGame.length; i++) {
            //si el jugaro existe
            if (playersGame[i] === name) {
                return "409";
            }
        }

        //agrega la lista de juegadores
        games[id].players.push(name);
        saveGame();
        return "agregado";
    },

    extractGame: function (id, name, pass) {

        //si existe el juego y la pass hace match
        if (!(id in games) || (games[id].password && games[id].password !== pass)) {
            return "404";
        }

        //saca la lista de jugadores
        let playersGame = games[id].players;
        //recorre la lista de jugadores para ver si existe 
        let i = 0;
        for (; i < playersGame.length; i++) {
            //si el jugador existe
            if (playersGame[i] === name) {
                break;
            }
        }

        //si no existe el jugador regresa este error
        if (!playersGame.includes(name)) {
            return "403";
        }

        //si existe regresa el juego
        return games[id];
    },

    startGame: function (id, name, pass) {
        //si existe el juego y la pass hace match
        if (!(id in games) || (games[id].password && games[id].password !== pass)) {
            return "404";
        }

        //saca la lista de jugadores
        let playersGame = games[id].players;
        //recorre la lista de jugadores para ver si existe 
        let i = 0;
        for (; i < playersGame.length; i++) {
            //si el jugador existe
            if (playersGame[i] === name) {
                break;
            }
        }

        //si no existe el jugador regresa este error
        if (i === playersGame.length) {
            return "403";
        }
        if (!(games[id].owner === name)) {
            return "401";
        }

        let psychoQty = 0;
        switch (games[id].players.length) {
            case 5:
            case 6:
                psychoQty = 2;
                break;
            case 7:
            case 8:
            case 9:
                psychoQty = 3;
                break;
            case 10:
                psychoQty = 4;
                break;
        }

        i = 0;
        const playerCopy = [...games[id].players];
        for (; i < psychoQty; i++) {
            let random = Math.floor(Math.random() * playerCopy.length);
            games[id].psychos.push(playerCopy[random]);
            playerCopy.splice(random, 1);
        }
        createNewRound(games[id]);
        saveGame();
        return "iniciado";
    },

    group: function (id, name, pass, group) {

        //si existe el juego y la pass hace match
        if (!(id in games) || (games[id].password && games[id].password !== pass)) {
            return "404";
        }

        //saca la lista de jugadores
        let playersGame = games[id].players;
        //recorre la lista de jugadores para ver si existe 
        let i = 0;
        for (; i < playersGame.length; i++) {
            //si el jugador existe
            if (playersGame[i] === name) {
                break;
            }
        }

        //si no existe el jugador regresa este error
        if (i === playersGame.length) {
            return "403";
        }

        if (games[id].rounds[games[id].rounds.length - 1].leader !== name) {
            return "401";
        }

        if (games[id].rounds[games[id].rounds.length - 1].group.length !== 0) {
            return "409";
        }

        if (games[id].status !== "leader" || !group.length || !isGroupValid(group, games[id])) {
            return "406";
        }

        games[id].status = 'rounds';
        games[id].rounds[games[id].rounds.length - 1].group = group.map(i => { return { "name": i, "psycho": null } })

        saveGame();
        return "grouped";
    },

    go: function (id, name, pass, psycho) {

        //si existe el juego y la pass hace match
        if (!(id in games) || (games[id].password && games[id].password !== pass)) {
            return "404";
        }

        //saca la lista de jugadores
        let playersGame = games[id].players;
        //recorre la lista de jugadores para ver si existe 
        let i = 0;
        for (; i < playersGame.length; i++) {
            //si el jugador existe
            if (playersGame[i] === name) {
                break;
            }
        }
        //si no existe el jugador regresa este error
        if (i === playersGame.length) {
            return "403";
        }

        //saca la lista de jugadores
        let playersRound = games[id].rounds[games[id].rounds.length - 1].group;
        let playerEntry = null;
        //recorre la lista de jugadores para ver si existe 
        i = 0;
        for (; i < playersRound.length; i++) {
            //si el jugador existe
            if (playersRound[i].name === name) {
                playerEntry = playersRound[i];
                break;
            }
        }
        if (i === playersRound.length) {
            return "401";
        }

        if (typeof psycho !== "boolean") {
            return "406";
        }

        if (playerEntry.psycho !== null) {
            return "409";
        }

        playerEntry.psycho = psycho;
        advanceRound(games[id]);
        saveGame();

        return "go";
    },


}