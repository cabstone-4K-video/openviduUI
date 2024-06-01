import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenViduVideoComponent, TokenModel, OpenViduService } from 'openvidu-react'; // openvidu-react 모듈을 사용한다고 가정
import { environment } from './environments/environment';

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = "participants-panel-directive-example";
  const [tokens, setTokens] = useState<TokenModel | null>(null);
  const [connected, setConnected] = useState(true);

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

  const leaveSession = () => {
    OpenViduService.disconnect();
    setConnected(false);
  };

  return (
    <div>
      {connected ? (
        tokens && (
          <OpenViduVideoComponent tokens={tokens} toolbarDisplaySessionName={false}>
            <div slot="participantPanelItemElements">
              <button onClick={leaveSession}>Leave</button>
            </div>
          </OpenViduVideoComponent>
        )
      ) : (
        <div style={{ textAlign: 'center' }}>Session disconnected</div>
      )}
    </div>
  );
};

export default AppComponent;
