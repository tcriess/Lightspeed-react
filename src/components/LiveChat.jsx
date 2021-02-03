import React from "react";
import {
  ChatContainer,
  ChatMain,
  ChatHeading,
  ChatBody,
} from "../styles/liveChatStyles";
import Chat from "./Chat";

const LiveChat = () => {
  return (
    <ChatContainer>
      <ChatMain>
        <ChatHeading>
          <h6>Live Chat Room</h6>
          <i className="fas fa-long-arrow-up arrow"></i>
        </ChatHeading>

        <ChatBody>
          <Chat></Chat>
        </ChatBody>
      </ChatMain>
    </ChatContainer>
  );
};

export default LiveChat;
