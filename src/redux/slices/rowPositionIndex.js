import { createSlice } from "@reduxjs/toolkit";

const rowPositionIndexSlice = createSlice({
  name: "positionname",
  initialState: {
    rowPosition: null,
    rowIndex: null,
  },
  reducers: {
    setRowPosition: (state, action) => {
        
      state.rowPosition = action.payload.rowPosition;
      state.rowIndex = action.payload.rowIndex;
    },
    resetRowPosition: (state) => {
      state.rowPosition = null;
      state.rowIndex = null;
    },
  },
});

export const { setRowPosition,resetRowPosition } = rowPositionIndexSlice.actions;
export default rowPositionIndexSlice.reducer;
