import styled from "styled-components";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  color: #fff;
  margin: 0 2.5em;
  min-width: 25em;

  @media only screen and (max-width: 1024px) {
    margin: 1em 0.3em;
    min-width: unset;
  }
`;

export const ChatMain = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #242731;
  border: 0.5px solid rgba(240, 243, 246, 0.2);
  border-radius: 32px;
`;

export const ChatHeading = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;

  h6 {
    margin: 1em 0;
  }

  .arrow {
    margin-top: auto;
    margin-bottom: auto;
    transform: rotate(45deg);
  }
`;

export const ChatFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0;
`;

export const ChatBody = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: center;
  border-top: 0.5px solid rgba(240, 243, 246, 0.1);
  border-radius: 32px;
  overflow-y: auto;
  
  i {
    font-weight: 900;
  }

  @media only screen and (max-width: 1024px) {
    min-height: 300px;
  }
`;

export const ChatMessages = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 95%;
  padding-left: 2%;
  padding-right: 2%;
  //height: 80vh;
  text-align: left;
  //overflow-y: scroll;
  border-top: 0.5px solid rgba(240, 243, 246, 0.1);
  border-radius: 32px;
`;

export const LoginLogout = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 5px;
`;