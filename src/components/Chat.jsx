import React, {useState, useEffect, useRef} from 'react';
import Messages from './Messages';
import {useImmer} from "use-immer";
import ReconnectingWebSocket from "reconnecting-websocket";
import GoogleLogin from "react-google-login";

const URL = `${process.env.REACT_APP_WS_URL}`;

const Chat = () => {
    const [messages, setMessages] = useImmer([]);
    //console.log(setMessages);
    const [input, setInput] = useState('');

    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = new ReconnectingWebSocket(URL);
        socketRef.current.addEventListener('open', () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
            socketRef.current?.send(JSON.stringify({event: "login", data: {}})); // empty token -> guest, expect to receive a guest nick
        });
        socketRef.current.addEventListener('error', (e) => {
            console.log('ws error:', e)
        });
        socketRef.current.addEventListener('message', (e) => {
            console.log('ws data:', e.data)
            const message = JSON.parse(e.data);
            switch (message.event) {
                case 'login':
                    console.log('received login event:', message.data)
                    break;
                case 'chat':
                    console.log('received chat event:', message.data)
                    // @ts-ignore
                    setMessages(oldArray => ([...oldArray, [message.data.id, message.data.nick, message.data.message]]));
                    break;
                case 'translation':
                    console.log('received translation event:', message.data)
                    break;
            }
        });
        return () => socketRef.current?.close();
    }, [setMessages]);

    const handleUserMessage = (msg) => {
        socketRef.current?.send(JSON.stringify({"event": "chat", data:{"message": msg}}));
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (input !== '') {
            handleUserMessage(input);
            setInput('');
        }
    };

    const responseGoogle = (response) => {
        console.log(response);
        socketRef.current?.send(JSON.stringify({event: "login", data: {"id_token": response.tokenId}}));
    }

    return (
        <div>
            <Messages data={messages}></Messages>
            <div id="sendform">
                <form onSubmit={e => handleSend(e)} style={{display: 'flex'}}>
                    <input id="m" onChange={e => {
                        setInput(e.target.value.trim());
                    }} value={input}/>
                    <button style={{width: '75px'}} type="submit">Send</button>
                </form>
            </div>
            <GoogleLogin
                clientId="860218079492-7i3e18uurk0s7fdaufeuaespi3j38hlp.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
            />
        </div>
    )
}

export default Chat;