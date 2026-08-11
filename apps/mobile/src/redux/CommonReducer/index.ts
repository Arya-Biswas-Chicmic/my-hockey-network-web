import { THEME } from '@theme/constants';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  userToken: undefined,
  userData: undefined,
  theme: THEME.DEVICE,
};

const common = createSlice({
  name: 'common',
  initialState,
  reducers: {
    loginUser(state, action) {
      state.userData = action.payload;
      state.userToken = action.payload.token;
    },
    logoutUser(state) {
      state.userData = undefined;
      state.userToken = undefined;
    },
    setTheme(state, action: PayloadAction<THEME>) {
      state.theme = action.payload;
    },
  },
});

export const { loginUser, logoutUser, setTheme } = common.actions;

export default common.reducer;
