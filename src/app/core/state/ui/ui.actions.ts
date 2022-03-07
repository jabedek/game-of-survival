import { createAction } from '@ngrx/store';

export const toggleUIPanelShowing = createAction(
  '[App Component] Toggle Panel'
);

export const toggleUIDecorShowing = createAction(
  '[App Component] Toggle Decor'
);
