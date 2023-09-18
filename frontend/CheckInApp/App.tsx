/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {FC, useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {UserInfo, UserService} from './user.service';
import {useCustomCommand} from "./util";

function forceRenderHook() {
  const [count, setCount] = useState(0);
  return () => setCount(count + 1);
}

const HomeScreen: FC<{userInfo: UserInfo}> = ({userInfo}) => {
  const forceRender = forceRenderHook();
  const canCheckIn =
    userInfo.lastCheckIn == null ||
    (userInfo.lastCheckIn.timeIn != null &&
      userInfo.lastCheckIn.timeOut != null);

  const checkInCommand = useCustomCommand(async () => {
    await UserService.CheckIn().then(response => {
      if (response.success) {
        userInfo!.lastCheckIn = response.data;
        forceRender();
      } else {
        Alert.alert(response.data || 'Unknown error');
        if (response.data === 'You must be checked in to checkout') {
          return UserService.UserInfo().then(r => {
            if (r.success) {
              userInfo!.lastCheckIn = r.data.lastCheckIn;
              forceRender();
            }
          });
        }
      }
    })
  });
  const checkOutCommand = useCustomCommand(async () => {
    await UserService.CheckOut().then(response => {
      if (response.success) {
        userInfo!.lastCheckIn = response.data;
        forceRender();
      } else {
        Alert.alert(response.data || 'Unknown error');
        if (response.data === 'You were forced checkout') {
          return UserService.UserInfo().then(r => {
            if (r.success) {
              userInfo!.lastCheckIn = r.data.lastCheckIn;
              forceRender();
            }
          });
        }
      }
    })
  });


  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{color: canCheckIn ? 'red' : 'green'}}>
        {canCheckIn ? 'User is checked-out' : 'User is checked-in'}
      </Text>
      <Text style={{color: canCheckIn ? 'red' : 'green'}}>
        {JSON.stringify(userInfo || {}, null, 4)}
      </Text>
      {canCheckIn && (
        <Button
          onPress={checkInCommand.execute}
          disabled={checkInCommand.isExecuting}
          title={'Check-In'}
        />
      )}

      {!canCheckIn && (
        <Button
          onPress={checkOutCommand.execute}
          disabled={checkOutCommand.isExecuting}
          title={'Checkout'}
        />
      )}
    </View>
  );
};

function App(): JSX.Element {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const appStateChangedHandler = async (state: AppStateStatus) => {
      console.log('AppStateStatus', state);
      if (state === 'active') {
        UserService.cancelPendingUserRefresh();
        const r = await UserService.UserInfo();
        if (r.success) {
          setUserInfo(r.data);
        } else {
          if (r.cancelled) {
            console.log('request cancelled');
          } else {
            Alert.alert(r.data || 'Unknown error (UserInfo)');
          }

        }
      }
    };
    const handler = AppState.addEventListener('change', appStateChangedHandler);
    // app launch
    appStateChangedHandler(AppState.currentState);
    return () => {
      handler.remove();
    };
  }, []);

  return <HomeScreen userInfo={userInfo} />;
}

export default App;
