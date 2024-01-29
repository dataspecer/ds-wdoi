import { AppBar, Box, Toolbar, Typography } from '@mui/material';

export function ApplicationBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar variant='dense'>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            not Dataspecer
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
