import { createSlice } from '@reduxjs/toolkit';

const tableDataSlice = createSlice({
  name: 'tableData',  
  initialState: [],   
  reducers: {
    setTableData: (state, action) => {
      return action.payload; 
    },
    updateTableData: (state, action) => {
      const { wp, newData } = action.payload;
      const index = state.findIndex(item => item.wp === wp);
      if (index !== -1) {
        state[index] = { ...state[index], ...newData }; 
      }
    },
    addTableData: (state, action) => {
      state.push(action.payload);  
    },
    removeTableData: (state, action) => {
      return state.filter(item => item.wp !== action.payload);  
    }
    ,
    resetTableData:(state)=>{
        state.length=0
    }
  }
});

export const { setTableData, updateTableData,resetTableData, addTableData, removeTableData } = tableDataSlice.actions;

export default tableDataSlice.reducer;
