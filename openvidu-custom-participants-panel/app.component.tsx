import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenViduVideoComponent, TokenModel } from 'openvidu-react'; // openvidu-react 모듈을 사용한다고 가정
import { environment } from './environments/environment';

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = 'participants-panel-directive-example';
  const [tokens, setTokens] = useState<TokenModel | null>(null);
  const [localParticipant, setLocalParticipant] = useState<ParticipantAbstractModel | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<ParticipantAbstractModel[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const webcamToken = await getToken();
      const screenToken = await getToken();
      setTokens({ webcam: webcamToken, screen: screenToken });
    };

    fetchTokens();
    subscribeToParticipants();
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

  const subscribeToParticipants = () => {
    // Assuming participantService.localParticipantObs is an observable
    participantService.localParticipantObs.subscribe((p: ParticipantAbstractModel) => {
      setLocalParticipant(p);
    });

    // Assuming participantService.remoteParticipantsObs is an observable
    participantService.remoteParticipantsObs.subscribe((participants: ParticipantAbstractModel[]) => {
      setRemoteParticipants(participants);
    });
  };

  return (
    <div>
      {tokens && (
        <OpenViduVideoComponent tokens={tokens} toolbarDisplaySessionName={false} onSessionCreated={subscribeToParticipants}>
          <div id="my-panel">
            <ul id="local">
              {localParticipant && <li>{localParticipant.nickname}</li>}
            </ul>
            <ul id="remote">
              {remoteParticipants.map((participant, index) => (
                <li key={index}>{participant.nickname}</li>
              ))}
            </ul>
          </div>
        </OpenViduVideoComponent>
      )}
    </div>
  );
};

export default AppComponent;
