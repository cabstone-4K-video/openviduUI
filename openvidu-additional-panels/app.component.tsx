import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenViduVideoComponent, PanelService, PanelType, TokenModel } from 'openvidu-react';
import { environment } from './environments/environment';

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = "toolbar-additionalbtn-directive-example";
  const [tokens, setTokens] = useState<TokenModel | null>(null);
  const [showExternalPanel, setShowExternalPanel] = useState<boolean>(false);
  const [showExternalPanel2, setShowExternalPanel2] = useState<boolean>(false);

  useEffect(() => {
    const fetchTokens = async () => {
      const webcamToken = await getToken();
      const screenToken = await getToken();
      setTokens({ webcam: webcamToken, screen: screenToken });
    };

    fetchTokens();
    subscribeToPanelToggling();
  }, []);

  const subscribeToPanelToggling = () => {
    PanelService.panelOpenedObs.subscribe(
      (ev: { opened: boolean; type?: PanelType | string }) => {
        setShowExternalPanel(ev.opened && ev.type === 'my-panel');
        setShowExternalPanel2(ev.opened && ev.type === 'my-panel2');
      }
    );
  };

  const toggleMyPanel = (type: string) => {
    PanelService.togglePanel(type);
  };

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

  return (
    <OpenViduVideoComponent tokens={tokens} toolbarDisplaySessionName={false}>
      <div slot="toolbarAdditionalPanelButtons" style={{ textAlign: 'center' }}>
        <button onClick={() => toggleMyPanel('my-panel')}>
          <i className="material-icons">360</i>
        </button>
        <button onClick={() => toggleMyPanel('my-panel2')}>
          <i className="material-icons">star</i>
        </button>
      </div>
      <div slot="additionalPanels" id="my-panels">
        {showExternalPanel && (
          <div id="my-panel1">
            <h2>NEW PANEL</h2>
            <p>This is my new additional panel</p>
          </div>
        )}
        {showExternalPanel2 && (
          <div id="my-panel2">
            <h2>NEW PANEL 2</h2>
            <p>This is other new panel</p>
          </div>
        )}
      </div>
    </OpenViduVideoComponent>
  );
};

export default AppComponent;
