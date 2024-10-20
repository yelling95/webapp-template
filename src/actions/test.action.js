import {createAsyncThunk, createSlice, isPending, isRejected} from '@reduxjs/toolkit'
import {map, range, random} from 'lodash-es'

// api
import * as TestAPI from '../services/test.service'

export const getTest = createAsyncThunk('device/GET_TEST', async () => {
  const response = await TestAPI.getTest()
  if (response.data.result) {
    return response.data.data
  }
})

const initialState = {
  isLoading: false,
  header: [
    {key: 'id', title: 'ID', isDisabled: true},
    {key: 'name', title: '이름'},
    {key: 'roleNm', title: '유형', filterType: 'select'},
    {key: 'phoneNum', title: '휴대폰번호', align: 'right', width: 200},
  ],
  testData: map(range(100, 0, -1), (id) => {
    return {
      id: id,
      name: `안녕${id}`,
      roleNm: ['관리자', '유저'][random(1)],
      phoneNum: `010-${id}`,
    }
  }),
}

const test = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTestInfo(state, {payload}) {
      console.log('@@@@@')
    },
  },
  extraReducers: (builder) => {
    // 통신 성공
    builder.addCase(getTest.fulfilled, (state, {payload}) => {
      state.isLoading = false
    })

    //  ---- pending, rejected 한번에 처리 -----
    builder.addMatcher(isPending, (state, {payload}) => {
      state.isLoading = true
    })
    // 통신 에러
    builder.addMatcher(isRejected, (state, {payload}) => {
      state.isLoading = false
      console.log('[Rejected]', payload)
    })
  },
})

export const testActions = {...test.actions, getTest}
export default test.reducer
