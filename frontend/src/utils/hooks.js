// customized hooks
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { getUserLastTime, getUserProfile, clearUserProfile, setUserProfile } from './utils';

// use sessionStorage to cache state
export function useSessionState(cache_key, default_val) {
  return useCacheState(cache_key, default_val, sessionStorage);
}

// use localStorage to cache state
export function useLocalState(cache_key, default_val) {
  return useCacheState(cache_key, default_val, localStorage);
}

// useState with cache in storage
// cache has higher priority than val
function useCacheState(key, val, storage) {
  if (storage !== sessionStorage && storage !== localStorage) {
    throw new Error('Storage must be either sessionStorage or localStorage');
  }

  const cache_val = storage.getItem(key);
  const [state, setState] = useState(cache_val ? JSON.parse(cache_val) : val);
  return [
    state,
    new_val => {
      setState(new_val);
      storage.setItem(key, JSON.stringify(new_val));
    },
  ];
}

// resource components state
export function useResourceState(fetchData) {
  // rows contains the table data
  const [rows, setRows] = useState(null);
  // onRefresh used when page refresh or refresh button is clicked
  const onRefresh = useCallback(() => fetchData().then(res => setRows(res)), [fetchData]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return [rows, onRefresh];
}

// display information passed by router from last page
export function useLocationMsg() {
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.msg) {
      message[location.state.type](location.state.msg, location.state.duration);
      location.state = {}; // clear msg after displaying
    }
  }, [location]);

  return location;
}

// it's a higher-level API to manage user state and user cache (in localStorage & sessionStorage)
let firstNotice = true; // enable notification prompt
export function useUserProfile() {
  const [user, setUser] = useState(getUserProfile());

  useEffect(() => {
    // if no account has been logged in, return
    if (user === null) {
      return;
    }

    const lastTime = getUserLastTime(user.status.effectiveTime);
    // if account has expired
    if (lastTime <= 0) {
      // show expire tips
      message.error(
        '对不起，您的试用账号已满7天，平台将清空账号下资源。您可以选择重新注册一个账号，继续体验OpenYurt的能力。',
        5
      );
      // clear the expired user data
      clearUserProfile();
      // clear the user state
      setUser(null);
    }
    // if the account is about to expire
    else if (lastTime <= 3 && firstNotice) {
      firstNotice = false; // only display this msg once
      message.warn(`您的账户将在${lastTime}日后过期`, 5);
    }
  }, [user]);

  return [
    user,
    user => {
      if (user) {
        setUserProfile(user);
      } else clearUserProfile();
      setUser(user);
    },
  ];
}
