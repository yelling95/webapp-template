import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {storage} from '../helpers'

const initialState = {
  userInfo: null,
}

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState(state, {payload}) {
      storage.clear()
      state.userInfo = null
    },
  },
  extraReducers: (builder) => {},
})

export const authActions = {
  ...auth.actions,
}
export default auth.reducer
