import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import './GameJoin.css';

function GameJoin(props) {
    const filterRef = useRef(null);
    const filterValueRef = useRef(null);
    const passGameJoin = useRef(null);
    const NameGameRef = useRef(null);
    const passGameRef = useRef(null);
    const idNameref = useRef(null);

    const [dataGame, setdataGame] = useState({
        "error": ""
    });

    const [games, setGames] = useState([]);

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
        };
        fetch(props.getUrl()+'/game', requestOptions)
            .then(response => response.json())
            .then(data => setGames(data));
    }, [props]);

    const onfilterGame = (e) => {
        e.preventDefault();
        let url;

        if (filterValueRef.current.value) {
            url = props.getUrl()+'/game?filter=' + filterRef.current.value + "&filterValue=" + filterValueRef.current.value
        } else {
            url = props.getUrl()+'/game'
        }
        const requestOptions = {
            method: 'GET',
        };
        fetch(url, requestOptions)
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }
                const errorData = await response.json();
                return Promise.reject(errorData);
            })
            .then(data => setGames(data))
            .catch(data => setdataGame(
                {
                    ...dataGame,
                    "error": data.error
                }
            ));

    }


    const onCreateGame = async (e) => {
        e.preventDefault();

        let url = props.getUrl()+'/game/create'

        const requestOptions = {
            method: 'POST',
            headers: { 'name': props.player.name, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'name': NameGameRef.current.value,
                'password': passGameRef.current.value
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
            .then(async data => {
                props.setPlayer({
                    ...props.player,
                    'gameId': data.gameId,
                    'password': passGameRef.current.value,
                    'disableturn': [false, false, false, false, false]
                })
            })
            .catch(data => setdataGame(
                {
                    ...dataGame,
                    "error": data.error
                }
            ));

    }


    const onJoinGame = async (e) => {
        e.preventDefault();

        let url = props.getUrl()+'/game/' + idNameref.current.value + '/join'

        const requestOptions = {
            method: 'PUT',
            headers: { 'name': props.player.name, 'password': passGameJoin.current.value, 'Content-Type': 'application/json' },
        };
        fetch(url, requestOptions)
            .then(async response => {
                if (response.ok) {
                    return response.json();
                }
                const errorData = await response.json();
                return Promise.reject(errorData);
            })
            .then(async data => props.setPlayer({
                ...props.player,
                'gameId': idNameref.current.value,
                'password': passGameJoin.current.value
            }))
            .catch(data =>
                setdataGame(
                    {
                        ...dataGame,
                        "error": data.error
                    })
            );

    }

    return (
        <>
            <div className="join-main">

                <div className="create-game">
                    <h3>Crear un Juego</h3>

                    {/* para crear un juego  */}
                    <div className="field-group">
                        <label htmlFor="NameGame">Nombre Juego:</label>
                        <input type="text" ref={NameGameRef} id="NameGame" />
                        <div className="spacer"></div>
                        <label htmlFor="passGame">Contraseña Juego:</label>
                        <input type="text" ref={passGameRef} id="passGame" />
                    </div>
                    <button className="main-btn" onClick={e => onCreateGame(e)}>Crear Juego</button>
                </div>

                <div className="join-game">
                    <h3>Unirse a un Juego</h3>


                    <div className="field-group">
                        <label htmlFor="filter">Filtro:</label>
                        <select ref={filterRef} name="filter" id="filter">
                            <option value="owner">Owner</option>
                            <option value="gameId">GameId</option>
                            <option value="status">Status</option>
                        </select>
                        <div className="spacer"></div>


                        <label htmlFor="filterValue">Buscar:</label>
                        <input type="text" ref={filterValueRef} id="filterValue" />
                        <button className="main-btn" onClick={e => onfilterGame(e)}>Buscar</button>
                        <div className="spacer"></div>

                        <label htmlFor="juegos">Lista de Juegos:</label>
                        <select name="juegos" id="juegos" ref={idNameref} onChange={(e) => {console.log(e.target.value)}}>
                            {games.map(game =>
                                <option key={game.gameId} value={game.gameId}>{game.name}</option>
                            )}
                        </select>
                        <div className="spacer"></div>

                        <label htmlFor="passGameJoin">Contraseña del Juego</label>
                        <input type="text" ref={passGameJoin} id="passGameJoin" />
                    </div>
                    <button className="main-btn" onClick={e => onJoinGame(e)}>Unirse</button>
                </div>

            </div >


            {dataGame.error &&
                <div className="error-lbl">
                    ERROR: <b>{dataGame.error}</b>
                </div>}
        </>
    )
}

export default GameJoin;