import { Card, CardContent, Typography } from '@mui/material';

export default function FormSectionCard({ title, subtitle, children, component = 'div', onSubmit }) {
  return (
    <Card component={component} onSubmit={onSubmit}>
      <CardContent>
        {title ? <Typography variant="h6" gutterBottom>{title}</Typography> : null}
        {subtitle ? <Typography variant="body2" sx={{ mb: 1.5 }}>{subtitle}</Typography> : null}
        {children}
      </CardContent>
    </Card>
  );
}
