import React, {useState, useEffect} from "react";
import {
    ChatContainer,
    ChatMain,
    ChatHeading,
    ChatBody,
} from "../styles/liveChatStyles";
import {useSocket} from "../context/SocketContext";

const LiveChat = (props) => {

    const {socket} = useSocket();
    const [line, setLine] = useState("");
    const [history, setHistory] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react/prop-types
        setHistory(props.chathistory)
        // eslint-disable-next-line react/prop-types
    }, [props.chathistory]);

    const handleKeyDown = (event) => {
        if(event.key === 'Enter') {
            if(line) {
                if(socket) {
                    socket.send(JSON.stringify({
                        event: "chat",
                        data: {message: line},
                    }));
                    setLine('');
                } else {
                    console.log('no ws connection');
                }
            }
        }
    }

    return (
        <ChatContainer>
            <ChatMain>
                <ChatHeading>
                    <h6>Live Chat Room</h6>
                    <i className="fas fa-long-arrow-up arrow"></i>
                </ChatHeading>

                <ChatBody>
                    <textarea style={{width: '100%', height: '100%', textAlign: 'left', overflow: 'auto'}} contentEditable={false} value={history}></textarea>
                    <div style={{clear: 'both'}}><input style={{width: '100%', textAlign: 'left'}} type="text" value={line} onChange={e => setLine(e.target.value)}
                                                        onKeyPress={handleKeyDown}></input></div>
                </ChatBody>
            </ChatMain>
        </ChatContainer>
    );
};

export default LiveChat;
