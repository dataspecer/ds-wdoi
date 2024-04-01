import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ApplicationBar } from './app-bar/ApplicationBar';
import { Editor } from './editor/Editor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * (60 * 1000), // 10 mins
      cacheTime: 10 * (60 * 1000),
    },
  },
});

function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ApplicationBar />
        <Editor />
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
