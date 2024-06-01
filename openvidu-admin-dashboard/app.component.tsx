import React, { useState } from 'react';
import { AdminLoginComponent, AdminDashboardComponent, RecordingInfo } from 'openvidu-react';

const AppComponent: React.FC = () => {
  const [logged, setLogged] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<RecordingInfo[]>([]);

  const onLoginClicked = (password: string) => {
    console.log(`Login button clicked ${password}`);
    /**
     * WARNING! This code is developed for didactic purposes only.
     * The authentication process should be done on the server side.
     **/
    setLogged(true);
  };

  const onLogoutClicked = () => {
    console.log('Logout button clicked');
    /**
     * WARNING! This code is developed for didactic purposes only.
     * The authentication process should be done on the server side.
     **/
    setLogged(false);
  };

  const onRefreshRecordingsClicked = () => {
    console.log('Refresh recording clicked');
  };

  const onDeleteRecordingClicked = (recordingId: string) => {
    console.log(`Delete recording clicked ${recordingId}`);
  };

  return (
    <div>
      {!logged ? (
        <AdminLoginComponent onLoginButtonClicked={onLoginClicked} />
      ) : (
        <AdminDashboardComponent
          recordingsList={recordings}
          onLogoutClicked={onLogoutClicked}
          onRefreshRecordingsClicked={onRefreshRecordingsClicked}
          onDeleteRecordingClicked={onDeleteRecordingClicked}
        />
      )}
    </div>
  );
};

export default AppComponent;
