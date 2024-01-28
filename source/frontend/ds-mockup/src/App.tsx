import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <>
          <div className='bg-sky-700 text-white sm:px-9 sm:py-3'>
            <h1>Vite + React</h1>
          </div>
        </>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default App;
