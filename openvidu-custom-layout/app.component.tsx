import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OpenViduVideoComponent, TokenModel } from 'openvidu-react'; // openvidu-react 모듈을 사용한다고 가정
import { ParticipantService, ParticipantAbstractModel } from 'openvidu-angular'; // openvidu-angular 모듈을 사용한다고 가정
import { environment } from './environments/environment';

const AppComponent: React.FC = () => {
  const APPLICATION_SERVER_URL = environment.applicationServerUrl;
  const sessionId = 'layout-directive-example';
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

  useEffect(() => {
    return () => {
      // Clean up subscriptions
      participantService.localParticipantObs.unsubscribe();
      participantService.remoteParticipantsObs.unsubscribe();
    };
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
    participantService.localParticipantObs.subscribe((p: ParticipantAbstractModel) => {
      setLocalParticipant(p);
    });

    participantService.remoteParticipantsObs.subscribe((participants: ParticipantAbstractModel[]) => {
      setRemoteParticipants(participants);
    });
  };

  return (
    <div>
      {tokens && (
        <OpenViduVideoComponent tokens={tokens} onSessionCreated={subscribeToParticipants}>
          <div className="container">
            {localParticipant?.streams.map((stream, index) => (
              <div className="item" key={index}>
                <OpenViduStreamComponent stream={stream} />
              </div>
            ))}
            {remoteParticipants.map((participant, index) =>
              participant.streams.map((stream, idx) => (
                <div className="item" key={`${index}-${idx}`}>
                  <OpenViduStreamComponent stream={stream} />
                </div>
              ))
            )}
          </div>
        </OpenViduVideoComponent>
      )}
    </div>
  );
};

export default AppComponent;
