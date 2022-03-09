export interface UIState {
  panelShowing: boolean;
  decorShowing: boolean;
  boardDimensions: number;
  fieldSizeComputed: number;
}

// *** Board stylings
export interface BoardDynamicCSS {
  sizings: BoardDynamicCSS_sizings;
  structurings: BoardDynamicCSS_structurings;
}

export interface BoardDynamicCSS_sizings {
  boardSize_px: string;
  fieldSize_px: string;
}

export interface BoardDynamicCSS_structurings {
  display: string;
  'grid-template-columns': string;
  'grid-template-rows': string;
  width: string;
  height: string;
}
