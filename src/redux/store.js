import { configureStore } from "@reduxjs/toolkit";
import rowPositionIndexReducer from "./slices/rowPositionIndex"; 
import tableDataReducer from "./slices/tableDataSlice"

const store = configureStore({
  reducer: {
    positionindex: rowPositionIndexReducer,
    tableData: tableDataReducer,
  },
});

export default store;
