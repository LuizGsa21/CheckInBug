/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { FC, useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, Button, Text, View } from 'react-native';
import { UserInfo, UserService } from './user.service';

const HomeScreen: FC<{
  userInfo: UserInfo | null;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
}> = ({ userInfo, onCheckIn, onCheckOut }) => {
  const canCheckIn =
    userInfo?.lastCheckIn == null ||
    (userInfo.lastCheckIn.timeIn != null &&
      userInfo.lastCheckIn.timeOut != null);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: canCheckIn ? 'red' : 'green' }}>
        {canCheckIn ? 'User is checked-out' : 'User is checked-in'}
      </Text>
      <Text style={{ color: canCheckIn ? 'red' : 'green' }}>
        {JSON.stringify(userInfo || {}, null, 4)}
      </Text>
      {canCheckIn && (
        <Button onPress={onCheckIn} title={'Check-In'} />
      )}
      {!canCheckIn && (
        <Button onPress={onCheckOut} title={'CheckOut'} />
      )}
    </View>
  );
};

const App: FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleCheckIn = async () => {
    const response = await UserService.CheckIn();
    if (response.success) {
        setUserInfo(prevUserInfo => ({
            ...prevUserInfo,
            email: prevUserInfo?.email || "", // provide default value if undefined
            lastCheckIn: response.data
        }));
    } else {
      Alert.alert(response.data || 'Unknown error');
      if (response.data === 'You must be checked in to checkout') {
          const r = await UserService.UserInfo();
          if (r.success) {
              setUserInfo(prevUserInfo => ({
                  ...prevUserInfo,
                  email: prevUserInfo?.email || "",  // Ensure email field is always set
                  lastCheckIn: r.data.lastCheckIn
              }));
          }
      }
  }
  
};

const handleCheckOut = async () => {
  const response = await UserService.CheckOut();
  if (response.success) {
      setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          email: prevUserInfo?.email || "",  // Ensure email field is always set
          lastCheckIn: response.data
      }));
  } else {
      Alert.alert(response.data || 'Unknown error');
      if (response.data === 'You were forced checkout') {
          const r = await UserService.UserInfo();
          if (r.success) {
              setUserInfo(prevUserInfo => ({
                  ...prevUserInfo,
                  email: prevUserInfo?.email || "",  // Ensure email field is always set
                  lastCheckIn: r.data.lastCheckIn
              }));
          }
      }
  }
};


  useEffect(() => {
    const appStateChangedHandler = async (state: AppStateStatus) => {
      if (state === 'active') {
        const r = await UserService.UserInfo();
        if (r.success) {
          setUserInfo(r.data);
        } else {
          Alert.alert(r.data || 'Unknown error (UserInfo)');
        }
      }
    };
    const handler = AppState.addEventListener('change', appStateChangedHandler);
    appStateChangedHandler(AppState.currentState);
    return () => {
      handler.remove();
    };
  }, []);

  return <HomeScreen userInfo={userInfo} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />;
};

export default App;
