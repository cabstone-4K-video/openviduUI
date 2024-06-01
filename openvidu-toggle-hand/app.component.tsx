import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenViduVideoComponent, OpenViduService, ParticipantService, TokenModel } from 'openvidu-react'; // openvidu-react 모듈을 사용한다고 가정
import { Session, SignalOptions } from 'openvidu-browser';
import { environment } from './environments/environment';

enum SignalApp {
  HAND_TOGGLE = 'handToggle'
}

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = 'openvidu-toggle-hand';
  const [tokens, setTokens] = useState<{ webcam: string; screen: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const webcamToken = await getToken();
      const screenToken = await getToken();
      setTokens({ webcam: webcamToken, screen: screenToken });
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    if (session) {
      handleRemoteHand();
    }
  }, [session]);

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

  const handleRemoteHand = () => {
    session?.on(`signal:${SignalApp.HAND_TOGGLE}`, (event: any) => {
      const connectionId = event.from.connectionId;
      const participant = ParticipantService.getRemoteParticipantByConnectionId(connectionId);
      if (participant) {
        participant.toggleHandRaised();
        ParticipantService.updateRemoteParticipants();
      }
    });
  };

  const handleLocalHand = () => {
    const participant = ParticipantService.getLocalParticipant();
    participant.toggleHandRaised();
    ParticipantService.updateLocalParticipant();

    const remoteConnections = OpenViduService.getRemoteConnections();
    if (remoteConnections.length > 0) {
      const signalOptions: SignalOptions = {
        type: SignalApp.HAND_TOGGLE,
        to: remoteConnections
      };
      session?.signal(signalOptions);
    }
  };

  return (
    <div>
      {tokens && (
        <OpenViduVideoComponent tokens={tokens} onSessionCreated={setSession}>
          <div>
            <button onClick={handleLocalHand}>Toggle Hand</button>
          </div>
        </OpenViduVideoComponent>
      )}
    </div>
  );
};

export default AppComponent;
