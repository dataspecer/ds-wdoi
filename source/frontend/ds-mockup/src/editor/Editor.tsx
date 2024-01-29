import { Container, Divider } from '@mui/material';
import { MainSurface } from './MainSurface';

export function Editor() {
  return (
    <Container maxWidth='lg'>
      <h2>Data structure editor</h2>
      <Divider orientation='horizontal' />
      <MainSurface />
    </Container>
  );
}
