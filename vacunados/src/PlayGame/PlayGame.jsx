import { useEffect } from "react";
import { useState } from "react";
import './PlayGame.css';

function PlayGame(props) {

    const [dataGame, setdataGame] = useState({
    });

    const [gameError, setGameError] = useState({
        "error": ""
    });

    const [dataGroup, setDataGroup] = useState([]);

    const [turngroupSize, setTurngroupSize] = useState([]);

    useEffect(() => {
        for (let i = 0; i < 10000; i++) clearInterval(i);
        setInterval(() => {
            let url = props.getUrl()+'/game/' + props.player.gameId

            const requestOptions = {
                method: 'GET',
                headers: { 'name': props.player.name, 'password': props.player.password, 'Content-Type': 'application/json' },
            };
            fetch(url, requestOptions)
                .then(async response => {
                    if (response.ok) {
                        return response.json();
                    }
                    const errorData = await response.json();
                    return Promise.reject(errorData);
                })
                .then(data => setdataGame(data))
                .catch(data =>
                    setGameError(
                        {
                            "error": data.error
                        })
                );
        }, 2000);
        return () => { for (let i = 0; i < 10000; i++) clearInterval(i) };
    }, [props]);

    useEffect(() => {
        if (dataGame.players) {
            if (dataGame.players.length === 5) {
                setTurngroupSize([2, 3, 2, 3, 3])
            } else if (dataGame.players.length === 6) {
                setTurngroupSize([2, 3, 4, 3, 4])
            } else if (dataGame.players.length === 7) {
                setTurngroupSize([2, 3, 3, 4, 4])
            } else if (dataGame.players.length === 8) {
                setTurngroupSize([3, 4, 4, 5, 5])
            } else if (dataGame.players.length === 9) {
                setTurngroupSize([3, 4, 4, 5, 5])
            } else {
                setTurngroupSize([3, 4, 4, 5, 5])
            }
        }
    }, [dataGame]);

    const startGame = (e) => {
        e.preventDefault();

        setGameError(
            {
                ...gameError,
                "error": ""
            });

        if (dataGame.players.length >= 5) {
            let url = props.getUrl()+'/game/' + props.player.gameId + '/start'
            const requestOptions = {
                method: 'HEAD',
                headers: { 'name': props.player.name, 'password': props.player.password, 'Content-Type': 'application/json' },
            };
            fetch(url, requestOptions)
                .then(async response => {
                    if (response.ok) {
                        return response.json();
                    }
                    const errorData = await response.json();
                    return Promise.reject(errorData);
                })
                .then(() => { })
                .catch(data => {
                    if (data.status === 401) {
                        setGameError(
                            {
                                ...gameError,
                                "error": "You are not the game's owner"
                            })
                    } else if (data.status === 403) {
                        setGameError(
                            {
                                ...gameError,
                                "error": "You are not part of the players list"
                            })
                    } else if (data.status === 404) {
                        setGameError(
                            {
                                ...gameError,
                                "error": "Invalid Game's id"
                            })
                    } else if (data.status === 406) {
                        setGameError(
                            {
                                ...gameError,
                                "error": "Missing player "
                            })
                    }
                });
        } else {
            setGameError(
                {
                    ...gameError,
                    "error": "Missing player"
                })
        }
    };


    const goGame = (e, psychos) => {
        e.preventDefault();

        setGameError({
            ...gameError,
            "error": ""
        });

        let tempDisableTurn = [...props.player.disableturn];
        tempDisableTurn[dataGame.rounds.length - 1] = true
        props.setPlayer({
            ...props.player,
            'disableturn': tempDisableTurn,
        });

        let url = props.getUrl()+'/game/' + props.player.gameId + '/go'
        const requestOptions = {
            method: 'POST',
            headers: { 'name': props.player.name, 'password': props.player.password, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "psycho": psychos
            })
        };
        fetch(url, requestOptions)
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }
                const errorData = await response.json();
                return Promise.reject(errorData);
            })
            .then(data => setdataGame(data))
            .catch(data =>
                setGameError(
                    {
                        ...gameError,
                        "error": data.error
                    })
            );

    };


    const sendGroup = (e) => {
        e.preventDefault();

        setGameError({
            ...gameError,
            "error": ""
        });

        if (turngroupSize[dataGame.rounds.length - 1] === dataGroup.length) {
            let url = props.getUrl()+'/game/' + props.player.gameId + '/group'
            const requestOptions = {
                method: 'POST',
                headers: { 'name': props.player.name, 'password': props.player.password, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "group": dataGroup
                })
            };
            fetch(url, requestOptions)
                .then(async response => {
                    if (response.ok) {
                        return response.json();
                    }
                    const errorData = await response.json();
                    return Promise.reject(errorData);
                })
                .then(data => {
                    setDataGroup([]);
                    setdataGame(data);
                })
                .catch(data =>
                    setGameError(
                        {
                            ...gameError,
                            "error": data.error
                        })
                );
        } else {
            setGameError({
                ...gameError,
                "error": "Faltan Jugadores"
            })
        }
    };

    const insertGroup = (e, name) => {
        e.preventDefault();
        if (turngroupSize[dataGame.rounds.length - 1] > dataGroup.length) {
            setDataGroup([
                ...dataGroup,
                name.player
            ])
        }
    }

    const closeGame = (e) => {
        e.preventDefault();
        props.setPlayer({
            ...props.player,
            "disableturn": [false, false, false, false, false],
            "gameId": "",
            "password": ""
        })
    }

    const isGameStatus = (status) => dataGame.status === status;

    return (
        <>
            <div className="game-main">
                {!isGameStatus("ended") && <>

                    {isGameStatus("lobby") &&
                        <div className="lobby-wait">
                            <h3>Esperando a que inicie el juego</h3>
                            <div className="spacer"></div>

                            <div className="lobby-info">
                                <div>
                                    <div><b>ID Game:</b> {dataGame.gameId}</div>
                                </div>

                                <div className="lobby-players">
                                    <div><b>Jugadores esperando en el lobby:</b></div>
                                    {dataGame.players.map(player => <p key={player}>{player}</p>)}
                                </div>
                            </div>

                            {props.player.name === dataGame.owner &&
                                <button className="main-btn" onClick={e => startGame(e)}>Iniciar Juego</button>
                            }
                        </div>}

                    {dataGame.rounds && !!dataGame.rounds.length &&
                        <div className="roundInfo">
                            <h3 className="roundNumber">
                                Ronda #{dataGame.rounds.length}
                            </h3>
                            {dataGame.psychoWin && !!dataGame.psychoWin.length &&
                                <div className="roundWinners">
                                    Informacion de Rondas:
                                    {dataGame.psychoWin.map((win, i) =>
                                        <div key={i} className="singleRound">
                                            <div className="singleRoundNumber"><b>Ronda #{i+1}</b></div>
                                            <div>Lider: {dataGame.rounds[i].leader}</div>
                                            <div>Grupo: {dataGame.rounds[i].group.map((member, j) =>
                                                j === 0 ? member.name : ", " + member.name
                                            )}</div>
                                            <div>Ganador: {win ? "Psicopatas" : "Ejemplares"}</div>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>}

                    {dataGame.rounds && !!dataGame.rounds.length &&
                        <div className="gameInfo">
                            {/* para que eliga las persona que van a ir  */}

                            {dataGame.psychos && dataGame.players &&
                                <div className="playerInfo">
                                    {dataGame.psychos.includes(props.player.name) &&
                                        <h3>Eres un Psicopata</h3>
                                    }
                                    {!dataGame.psychos.includes(props.player.name) &&
                                        <h3>Eres un Ejemplar</h3>
                                    }
                                    <h3>Jugadores</h3>
                                    {dataGame.players.map(player => {
                                        return <p key={player}>{player} {dataGame.psychos.includes(props.player.name) && dataGame.psychos.includes(player) ? "(Psicopata)" : ""}</p>
                                    })}
                                </div>}

                            {dataGame.rounds[dataGame.rounds.length - 1].group.length === 0 && dataGame.rounds[dataGame.rounds.length - 1].leader === props.player.name &&
                                <div className="choose-round">
                                    <div className="spacer"></div>
                                    <h3>Eres el Lider de la ronda</h3>
                                    <div className="spacer"></div>
                                    <p>Numero de jugadores a enviar: <b>{turngroupSize[dataGame.rounds.length - 1]}</b></p>
                                    <div className="spacer"></div>
                                    <p>Elige cuales jugadores quieres enviar:</p>
                                    <div className="choose-div">
                                        {dataGame.players.map(player =>
                                            <button key={player} disabled={dataGroup.includes(player)} onClick={e => insertGroup(e, { player })}>{player}</button>
                                        )}
                                    </div>
                                    <div className="send-div">
                                        <button className="main-btn" onClick={e => sendGroup(e)}>Enviar</button>
                                    </div>
                                </div>}

                            {dataGame.rounds[dataGame.rounds.length - 1].group.length === 0 && !(dataGame.rounds[dataGame.rounds.length - 1].leader === props.player.name) &&
                                <div>
                                    <div className="spacer"></div>
                                    <h3>Esperando que el lider escoja el grupo...</h3>
                                </div>}

                            {dataGame.rounds[dataGame.rounds.length - 1].group.length > 0 && !props.player.disableturn[dataGame.rounds.length - 1] && dataGame.rounds[dataGame.rounds.length - 1].group.filter(member => member.name === props.player.name).length > 0 &&
                                <div className="choose-protection">
                                    <h3>Escoje como quieres ir:</h3>
                                    {/*SI es u Psicopata pueda elegir como ir  */}
                                    {dataGame.psychos.includes(props.player.name) && <button onClick={e => goGame(e, true)}>Ir sin proteccion</button>}
                                    <button onClick={e => goGame(e, false)}>Ir con proteccion</button>
                                </div>}

                            {dataGame.rounds[dataGame.rounds.length - 1].group.length > 0 && dataGame.rounds[dataGame.rounds.length - 1].group.filter(member => member.name === props.player.name).length === 0 &&
                                <div>
                                    <h3>No fuiste escogido para esta ronda</h3>
                                    <p>Esperando a que termine la ronda...</p>
                                </div>}

                        </div>}

                </>}

                {isGameStatus("ended") &&
                    <div className="endGame">
                        <h3>Juego finalizado</h3>
                        <p>Ganaron los {dataGame.psychoWin.filter(win => win).length === 3 ? "Psicopatas" : "Ejemplares"}!</p>
                        <button className="main-btn" onClick={(e) => { closeGame(e) }}>Cerrar el juego</button>
                    </div>}
            </div>

            {gameError.error &&
                <div className="error-lbl">
                    ERROR: <b>{gameError.error}</b>
                </div>}

        </>
    )
}

export default PlayGame;