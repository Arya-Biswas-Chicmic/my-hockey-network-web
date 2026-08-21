import { THEME } from '@theme/constants';
import type { AuthMeResponse } from '@my-hockey-network/contracts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CommonState {
  userData?: AuthMeResponse;
  isAuthenticated: boolean;
  hasBootstrapped: boolean;
  theme: THEME;
}

const initialState: CommonState = {
  userData: undefined,
  isAuthenticated: false,
  hasBootstrapped: false,
  theme: THEME.DEVICE,
};

const common = createSlice({
  name: 'common',
  initialState,
  reducers: {
    loginUser(state, action: PayloadAction<{ user: AuthMeResponse }>) {
      state.userData = action.payload.user;
      state.isAuthenticated = true;
      state.hasBootstrapped = true;
    },
    logoutUser(state) {
      state.userData = undefined;
      state.isAuthenticated = false;
      state.hasBootstrapped = true;
    },
    completeAuthBootstrap(state) {
      state.hasBootstrapped = true;
    },
    setTheme(state, action: PayloadAction<THEME>) {
      state.theme = action.payload;
    },
  },
});

export const { loginUser, logoutUser, completeAuthBootstrap, setTheme } =
  common.actions;
export default common.reducer;
