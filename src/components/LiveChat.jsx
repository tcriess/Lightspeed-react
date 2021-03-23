import React, {useEffect, useRef, useState} from "react";
import {
  ChatContainer,
  ChatMain,
  ChatHeading,
  ChatBody, ChatMessages, ChatFooter, LoginLogout,
} from "../styles/liveChatStyles";
import ReconnectingWebSocket from "reconnecting-websocket";
import {useImmer} from "use-immer";
import Moment from "react-moment";
import 'moment/locale/de';
import 'moment/locale/es';
import {emojify} from "react-emojione";
import {useKeycloak} from "@react-keycloak/web";

const URL = `${process.env.REACT_APP_WS_URL}` || (window.location.protocol === 'https:' ? "wss://" + window.location.host + "/chat/default" : "ws://" + window.location.host + "/chat/default");

const LiveChat = () => {
  const [url, setUrl] = useState(URL + "?language=" + (navigator.language?.toLowerCase().slice(0, 2) || 'en'));
  const [messages, setMessages] = useImmer({list: [], obj: {}});
  const [input, setInput] = useState('');
  const [translationsById, setTranslationsById] = useImmer({});
  const [idtoken, setIdtoken] = useState("");
  const messagesEndRef = useRef();
  const [ws, setWs] = useState(null);
  const {keycloak, initialized} = useKeycloak()

  useEffect(() => {
    keycloak.onAuthSuccess = () => {
      setIdtoken(keycloak.idToken);
    };
  }, []);

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
      const message = JSON.parse(e.data);
      switch(message.event) {
        case 'user':
          console.log('received user event:', message.data)
          if(!message.data.history) {
            if(message.data.tags.action === 'login') {
              console.log("logged in user");
            }
          }
          break;
        case 'chat':
          console.log('received chat event:', message.data)
          const msgId = message.data.id;
          const newMessage = [message.data.id, message.data.created, message.data.source.user.nick || message.data.source.plugin_name + ' (bot)', message.data.tags.message, ""]
          setMessages(draft => {
            if(draft.obj[msgId] === undefined) {
              draft.obj[msgId] = newMessage;
              draft.list = [...draft.list, newMessage].sort((a, b) => a[1] > b[1] ? 1 : -1);
            }
          });
          break;
        case 'chats':
          console.log('received chat events:', message.data)
          setMessages(draft => {
            message.data.map((d) => {
              if(draft.obj[d.data.id] === undefined) {
                draft.obj[d.data.id] = [d.data.id, d.data.created, d.data.source.user.nick || d.data.source.plugin_name + ' (bot)', d.data.tags.message, ""];
                draft.list = [...draft.list, [d.data.id, d.data.created, d.data.source.user.nick || d.data.source.plugin_name + ' (bot)', d.data.tags.message, ""]];
              }
            });
            draft.list = draft.list.sort((a, b) => a[1] > b[1] ? 1 : -1);
          });
          break;
        case 'translation':
          console.log('received translation event:', message.data)
          // the server is aware which language the client wants, no need to filter it here then
          const newTranslation = [message.data.tags.source_id, message.data.tags.message];
          setTranslationsById(draft => ({...draft, [newTranslation[0]]: "(" + newTranslation[1] + ")"}));
          break;
        case 'translations':
          console.log('received translations event:', message.data)
          // the server is aware which language the client wants, no need to filter it here then
          setTranslationsById(draft => {
            message.data.map((d) => {
              draft[d.data.tags.source_id] = '(' + d.data.tags.message + ')';
            });
          })
          break;
      }
    });
    setWs(w);
  }, [url]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.list, translationsById]);

  const [locale, setLocale] = useState(navigator.language.toLowerCase().slice(0, 2) || 'en');

  useEffect(() => {
    let lang = locale.toLowerCase().slice(0, 2);
    if(lang.match(/en|de|es/i)) {
      setLocale(lang);
    } else {
      setLocale('en')
    }
  }, []);

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

  const handleLocaleChange = (event) => {
    setLocale(event.target.value);
  }

  const handleInput = (e) => {
    const content = e.target.value;
    const transformed = emojify(content, {output: 'unicode'});
    setInput(transformed);
  };

  useEffect(() => {
    console.log("update url...")
    let u = URL + "?language=" + locale;
    if(idtoken !== "") {
      u = u + "&provider=keycloak&id_token=" + idtoken;
    }
    console.log("setting url: ", u);
    setUrl(u);
  }, [locale, idtoken]);

  const handleLogin = () => {
    keycloak.login({scope: "email profile roles offline_access"});
    console.log("login called.")
    if(keycloak.authenticated) {
      console.log("authenticated, token:", keycloak.idToken)
      setIdtoken(keycloak.idToken);
    } else {
      console.log("not yet authenticated")
    }
  };

  const handleLogout = () => {
    keycloak.logout();
    setIdtoken("");
  };

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
                </p>{m[3].split("\n").map((l,i) => (<p key={i} className="innermsg" style={{textAlign: 'left'}}>{l}</p>))}
                <p>
                  <em style={{fontStyle: 'italic'}}>{translationsById[m[0]]}</em></p><br/>
                  <div ref={messagesEndRef}/>
                </div>))
            }
          </ChatMessages>
        </ChatBody>
        <ChatFooter>
          <form onSubmit={e => handleSend(e)}
                style={{display: 'flex', clear: 'both', width: '100%', paddingBottom: '10px'}}>
            <input style={{width: '100%', textAlign: 'left', paddingLeft: '3px'}} onChange={handleInput} value={input}/>
            <button style={{width: '75px'}} type="submit">Send</button>
          </form>
          {initialized &&
          <LoginLogout>
            <div>{keycloak.authenticated && `Welcome, ${keycloak.idTokenParsed.preferred_username}!`}&nbsp;</div>
            {!keycloak.authenticated && <button onClick={handleLogin}>Login</button>}
            {keycloak.authenticated && <button onClick={handleLogout}>Logout</button>}
          </LoginLogout>
          }
        </ChatFooter>
      </ChatMain>
    </ChatContainer>
  );
};

export default LiveChat;
