import { useState, useRef } from "react";
import GameJoin from "../GameJoin/GameJoin";
import PlayGame from "../PlayGame/PlayGame";
import './Login.css';


function Login() {
    const SERVER_PROFE = "vacunados.meseguercr.com";
    const nameRef = useRef(null);
    const serverRef = useRef(null);
    const protocolRef = useRef(null);

    const [player, setPlayer] = useState({
        "name": "",
        "gameId": "",
        "password": "",
        "server": "",
        "protocol": "",
        "disableturn": [false, false, false, false, false],
    });



    

    const savePlayer = (player) => {
        let local = localStorage.getItem('players');
        if (!local) {
            local = {}
        } else {
            local = JSON.parse(local);
        };
        local[player.name] = player;
        localStorage.setItem('players', JSON.stringify(local));
        setPlayer(player);
    }

    const onLogin = (e) => {
        e.preventDefault();
        let local = localStorage.getItem('players');
        let playerCopy = {
            ...player
        }
        if (local) {
            local = JSON.parse(local);
            if (local[nameRef.current.value]) {
                playerCopy = local[nameRef.current.value];
                // si hubo cambio de server quite el juego actual
                if (playerCopy.server !== serverRef.current.value) {
                    playerCopy.gameId = "";
                    playerCopy.password = "";
                    playerCopy.disableturn = [false, false, false, false, false];
                } 
            }
        }
        savePlayer({
            ...playerCopy,
            "name": nameRef.current.value,
            "server": serverRef.current.value,
            "protocol": protocolRef.current.value,
        })
    }

    const onLogout = (e) => {
        e.preventDefault();
        setPlayer({
            "name": "",
            "gameId": "",
            "password": "",
            "server": "",
            "protocol": "",
            "disableturn": [false, false, false, false, false],
        });
    }

    const getUrl = () => player.protocol+'://'+player.server;

    return (
        <div>
            <h1>VacunaDOS</h1>

            {!player.name &&
                <div className="login-main">
                    <h3>Ingresar</h3>
                    <div className="field-group">
                        <label htmlFor="name">Usuario</label>
                        <input ref={nameRef} type="text" name="name" id="name"/>
                        <div className="spacer"></div>
                        <label htmlFor="protocolo">Protocolo</label>
                        <select ref={protocolRef} name="protocolo" id="protocolo">
                            <option value="http">HTTP</option>
                            <option value="https">HTTPS</option>
                        </select>
                        <div className="spacer"></div>
                        <label htmlFor="server">Server</label>
                        <input ref={serverRef} type="text" name="server" id="server" defaultValue={SERVER_PROFE}/>
                    </div>
                    <button className="main-btn" onClick={e => onLogin(e)}>Entrar</button>
                </div>}

            {player.name &&
                <div className="session">
                    <span className="session-lbl">Usted ha ingresado como, <b>{player.name}</b></span>
                    <button className="session-btn" onClick={e => onLogout(e)}>Salir</button>
                </div>
            }

            {(player.name && !player.gameId) &&
                <GameJoin player={player} setPlayer={savePlayer} getUrl={getUrl} />
            }

            {player.name && player.gameId &&
                <PlayGame player={player} setPlayer={savePlayer} getUrl={getUrl} />
            }

        </div>
    )
}

export default Login;