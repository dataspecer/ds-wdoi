import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createTheme as createThemeMUI,
  StyledEngineProvider as StyledEngineProviderMUI,
  ThemeProvider as ThemeProviderMUI,
} from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './index.css';
import App from './App';

const rootElement: HTMLElement | null = document.getElementById('root');
const root: ReactDOM.Root = ReactDOM.createRoot(rootElement!);

// All `Portal`-related components need to have the the main app wrapper element as a container
// so that the are in the subtree under the element used in the `important` option of the Tailwind's config.
const theme = createThemeMUI({
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

root.render(
  <React.StrictMode>
    <StyledEngineProviderMUI injectFirst>
      <ThemeProviderMUI theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProviderMUI>
    </StyledEngineProviderMUI>
  </React.StrictMode>,
);
