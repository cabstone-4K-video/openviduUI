import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Session, SignalOptions } from 'openvidu-browser';
import { OpenViduVideoComponent, TokenModel } from 'openvidu-react'; // openvidu-react 모듈을 사용한다고 가정
import { environment } from './environments/environment';

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = "chat-panel-directive-example";
  const [tokens, setTokens] = useState<TokenModel | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const webcamToken = await getToken();
      const screenToken = await getToken();
      setTokens({ webcam: webcamToken, screen: screenToken });
    };

    fetchTokens();
  }, []);

  const getToken = async (): Promise<string> => {
    const sessionId = await createSession(sessionId);
    return await createToken(sessionId);
  };

  const createSession = (sessionId: string): Promise<string> => {
    return axios.post(
      `${APPLICATION_SERVER_URL}api/sessions`,
      { customSessionId: sessionId },
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
    ).then(response => response.data);
  };

  const createToken = (sessionId: string): Promise<string> => {
    return axios.post(
      `${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`,
      {},
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
    ).then(response => response.data);
  };

  const onSessionCreated = (session: Session) => {
    setSession(session);
    session.on('signal:CHAT', (event: any) => {
      const msg = JSON.parse(event.data).message;
      setMessages(prevMessages => [...prevMessages, msg]);
    });
  };

  const send = (message: string): void => {
    if (!session) return;
    const signalOptions: SignalOptions = {
      data: JSON.stringify({ message }),
      type: 'CHAT',
      to: undefined,
    };
    session.signal(signalOptions);
  };

  return (
    <div>
      {tokens && (
        <OpenViduVideoComponent tokens={tokens} onSessionCreated={onSessionCreated} toolbarDisplaySessionName={false}>
          <div slot="chatPanel" id="my-panel">
            <h3>Chat</h3>
            <div>
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
            <input defaultValue="Hello" ref={inputRef} />
            <button onClick={() => send(inputRef.current?.value || '')}>Send</button>
          </div>
        </OpenViduVideoComponent>
      )}
    </div>
  );
};

export default AppComponent;
