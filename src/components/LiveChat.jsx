import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  ChatContainer,
  ChatMain,
  ChatHeading,
  ChatBody, ChatMessages, ChatFooter, LoginLogout,
} from "../styles/liveChatStyles";
import ReconnectingWebSocket from "reconnecting-websocket";
import GoogleLogin, {GoogleLogout} from "react-google-login";
import {useImmer} from "use-immer";
import Moment from "react-moment";
import 'moment/locale/de';
import 'moment/locale/es';
//import {Grid} from "@giphy/react-components";
//import {GiphyFetch} from "@giphy/js-fetch-api";

const URL = `${process.env.REACT_APP_WS_URL}`;
const CLIENTID = `${process.env.REACT_APP_CLIENT_ID}`;

const LiveChat = () => {
  const [url, setUrl] = useState(URL + "?language=" + (navigator.language?.toLowerCase() || 'en'));
  const [messages, setMessages] = useImmer({list: [], obj: {}});
  const [input, setInput] = useState('');
  const [translationsById, setTranslationsById] = useImmer({})
  const [idtoken, setIdtoken] = useState("");
  const messagesEndRef = useRef();
  const [ws, setWs] = useState(null);
  //const prevWs = useRef(null);

  //useEffect(() => {
  //  prevWs.current = ws;
  //});

  useEffect(() => {
    setTranslationsById(() => ({}));
    setMessages(() => ({list: [], obj: {}}));

    ws?.close();
    const w = new ReconnectingWebSocket(url);
    w.addEventListener('open', () => {
      w.send(JSON.stringify({event: "login", data: {}}));
    });
    w.addEventListener('error', (e) => {
      console.log('ws error:', e)
    });
    w.addEventListener('message', (e) => {
      console.log('ws data:', e.data)
      //console.log('messages:', messages);
      //console.log('messagesbyid:', messagesById)
      const message = JSON.parse(e.data);
      switch(message.event) {
        case 'login':
          console.log('received login event:', message.data)
          break;
        case 'chat':
          console.log('received chat event:', message.data)
          const msgId = message.data.id;
          const newMessage = [message.data.id, message.data.timestamp, message.data.nick, message.data.message, ""]
          setMessages(draft => {
            if(draft.obj[msgId] === undefined) {
              draft.obj[msgId] = newMessage;
              draft.list = [...draft.list, newMessage].sort((a, b) => a[1] > b[1] ? 1 : -1);
            }
          });
          break;
        case 'translation':
          console.log('received translation event:', message.data)
          // the server is aware which language the client wants, no need to filter it here then
          const newTranslation = [message.data.source_id, message.data.message];
          setTranslationsById(draft => ({...draft, [newTranslation[0]]: "(" + newTranslation[1] + ")"}));
          break;
      }
    });
    setWs(w);
  }, [url]);

  // use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
  //const gf = new GiphyFetch('TgMRPGpev8ywWOxgPIX7QIWLmu1ZeETx')
  // configure your fetch: fetch 10 gifs at a time as the user scrolls (offset is handled by the grid)
  //const fetchGifs = (offset) => gf.trending({offset, limit: 10})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.list, translationsById]);

  //const socketRef = useRef();
  const [locale, setLocale] = useState(navigator.language || 'en');

  useEffect(() => {
    let lang = locale[0] + locale[1];
    if(lang.match(/en|de|es/i)) {
      setLocale(lang.toLowerCase());
    } else {
      setLocale('en')
    }
  }, []);

  /*
  useEffect(() => {
    setTranslationsById(() => ({}));
    setMessages(() => ({list: [], obj: {}}));
  }, [url]);
  useEffect(() => {
    socketRef.current = new ReconnectingWebSocket(url);
    socketRef.current.addEventListener('open', () => {
      socketRef.current.send(JSON.stringify({event: "login", data: {}}));
    });
    socketRef.current.addEventListener('error', (e) => {
      console.log('ws error:', e)
    });
    socketRef.current.addEventListener('message', (e) => {
      console.log('ws data:', e.data)
      //console.log('messages:', messages);
      //console.log('messagesbyid:', messagesById)
      const message = JSON.parse(e.data);
      switch(message.event) {
        case 'login':
          console.log('received login event:', message.data)
          break;
        case 'chat':
          console.log('received chat event:', message.data)
          const msgId = message.data.id;
          const newMessage = [message.data.id, message.data.timestamp, message.data.nick, message.data.message, ""]
          setMessages(draft => {
            if(draft.obj[msgId] === undefined) {
              draft.obj[msgId] = newMessage;
              draft.list = [...draft.list, newMessage].sort((a, b) => a[1] > b[1] ? 1 : -1);
            }
          });
          break;
        case 'translation':
          console.log('received translation event:', message.data)
          // the server is aware which language the client wants, no need to filter it here then
          const newTranslation = [message.data.source_id, message.data.message];
          setTranslationsById(draft => ({...draft, [newTranslation[0]]: "(" + newTranslation[1] + ")"}));
          break;
      }
    });
    return () => socketRef.current.close();
  }, [url]);
  */

  const handleUserMessage = (msg) => {
    ws?.send(JSON.stringify({"event": "chat", data: {"message": msg}}));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if(input !== '') {
      handleUserMessage(input);
      setInput('');
    }
  };

  const responseGoogle = (response) => {
    console.log("login response:", response);
    //socketRef.current.send(JSON.stringify({event: "login", data: {"id_token": response.tokenId}}));
    if(response.tokenId !== undefined) {
      setIdtoken(response.tokenId);
    } else {
      setIdtoken("");
    }
  }

  const logoutGoogle = (response) => {
    console.log("logout: ", response);
    setIdtoken("");
  }

  const handleLocaleChange = (event) => {
    setLocale(event.target.value);
  }

  useEffect(() => {
    console.log("update url...")
    let u = URL + "?language=" + locale;
    if(idtoken !== "") {
      u = u + "&provider=google&id_token=" + idtoken;
    }
    console.log("setting url: ", u);
    setUrl(u);
  }, [locale, idtoken]);

  return (
    <ChatContainer>
      <ChatMain>
        <ChatHeading>
          <h6>Live Chat Room</h6>
          <i className="fas fa-long-arrow-up arrow"></i>
          <select style={{display: 'flex', clear: 'both', width: '20%', paddingBottom: '10px'}} value={locale}
                  onChange={handleLocaleChange}>
            <option value={'en'}>en</option>
            <option value={'de'}>de</option>
            <option value={'es'}>es</option>
          </select>
        </ChatHeading>
        <ChatBody>

          <ChatMessages>
            {
              messages.list.map((m) => (
                <div key={m[0]}><p style={{textAlign: 'left'}}><strong>{m[2]}</strong>: <small>(<Moment interval={5000}
                                                                                                        format="L LTS"
                                                                                                        trim
                                                                                                        fromNowDuring={20 * 60000}
                                                                                                        locale={locale}
                                                                                                        local>{m[1]}</Moment>)</small>
                </p> <p className="innermsg" style={{textAlign: 'left'}}>{m[3]} <em
                  style={{fontStyle: 'italic'}}>{translationsById[m[0]]}</em></p>
                  <div ref={messagesEndRef}/>
                </div>))
            }
          </ChatMessages>
        </ChatBody>
        <ChatFooter>
          <form onSubmit={e => handleSend(e)}
                style={{display: 'flex', clear: 'both', width: '100%', paddingBottom: '10px'}}>
            <input style={{width: '100%'}} onChange={e => {
              setInput(e.target.value);
            }} value={input}/>
            <button style={{width: '75px'}} type="submit">Send</button>
          </form>
          <LoginLogout>
            <GoogleLogin
              disabled={idtoken !== ''}
              clientId={CLIENTID}
              buttonText="Login"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={'single_host_origin'}
              isSignedIn={true}
            />
            <div style={{width: '10px'}}/>
            <GoogleLogout
              disabled={idtoken === ''}
              clientId={CLIENTID}
              buttonText="Logout"
              onLogoutSuccess={logoutGoogle}
            >
            </GoogleLogout>
          </LoginLogout>
        </ChatFooter>
      </ChatMain>
    </ChatContainer>
  );
};

export default LiveChat;
