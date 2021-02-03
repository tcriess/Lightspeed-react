import React from "react";

const Messages = (props) => props.data.map((m) => m[0] !== '' ?
(<li key={m[0]}><strong>{m[1]}</strong> : <div className="innermsg">{m[2]}</div></li>)
: (<li key={m[0]} className="update">{m[2]}</li>) );

export default Messages;