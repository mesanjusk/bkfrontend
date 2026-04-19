import { Grid, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ResponsiveOperationsList({ items, mobileRender, desktopRender }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  if (mobile) {
    return (
      <Stack spacing={1.25}>
        {items.map((item) => mobileRender(item))}
      </Stack>
    );
  }

  return <Grid container spacing={1.5} sx={{ minWidth: 0 }}>{desktopRender(items)}</Grid>;
}
