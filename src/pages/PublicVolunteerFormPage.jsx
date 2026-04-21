import { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { CheckCircle, EmojiPeople, Groups } from '@mui/icons-material';
import api from '../api';
import ImageCropDialog from '../components/common/ImageCropDialog';
import { uploadPublicFile } from '../services/uploadService';

const inputSx = {
  '& .MuiFilledInput-root': {
    borderRadius: '10px'
  }
};

function buildFullName(form) {
  return [form.firstName, form.lastName].filter(Boolean).join(' ').trim();
}

export default function PublicVolunteerFormPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    gender: '',
    address: '',
    mobile: '',
    teamId: '',
    teamOther: '',
    photoUrl: '',
    photoPreviewUrl: '',
    photoFile: null,
    remarks: ''
  });
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');

  useEffect(() => {
    api.get('/volunteers/public-teams')
      .then((response) => setTeams(response.data || []))
      .catch(() => setTeams([]));
  }, []);

  const previewSrc = useMemo(() => form.photoPreviewUrl || form.photoUrl || '', [form.photoPreviewUrl, form.photoUrl]);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      next.fullName = buildFullName(next);
      return next;
    });
  };

  const handlePhotoPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage('');

    try {
      let photoUrl = form.photoUrl;

      if (form.photoFile) {
        const uploaded = await uploadPublicFile(form.photoFile, 'bk_awards/volunteers', {
          forcePng: true,
          removeBackground: true
        });
        photoUrl = uploaded?.url || '';
      }

      await api.post('/volunteers/public-register', {
        firstName: form.firstName,
        lastName: form.lastName,
        fullName: buildFullName(form),
        gender: form.gender,
        address: form.address,
        mobile: form.mobile,
        teamId: form.teamId === 'OTHER' ? '' : form.teamId,
        teamOther: form.teamId === 'OTHER' ? form.teamOther : '',
        photoUrl,
        remarks: form.remarks
      });

      setSubmitted(true);
      setMessage('Volunteer / team member registration submitted successfully.');
      setForm({
        firstName: '',
        lastName: '',
        fullName: '',
        gender: '',
        address: '',
        mobile: '',
        teamId: '',
        teamOther: '',
        photoUrl: '',
        photoPreviewUrl: '',
        photoFile: null,
        remarks: ''
      });
    } catch (error) {
      setSubmitted(false);
      setMessage(error?.response?.data?.message || 'Failed to submit volunteer registration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f0f7fc', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          bgcolor: '#2497d3',
          color: '#fff',
          pt: { xs: 4, sm: 5 },
          pb: { xs: 5, sm: 6 },
          px: 2,
          textAlign: 'center',
          borderRadius: '0 0 28px 28px'
        }}
      >
        <Groups sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h5" fontWeight={800}>VOLUNTEER / TEAM MEMBER</Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>Badte Kadam Awards 2026</Typography>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -3 }}>
        <Card sx={{ borderRadius: 3, border: '1px solid #d9d9d9', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Stack spacing={2}>
              {message ? (
                <Fade in>
                  <Alert severity={submitted ? 'success' : 'error'} icon={submitted ? <CheckCircle /> : undefined} sx={{ borderRadius: 2 }}>
                    {message}
                  </Alert>
                </Fade>
              ) : null}

              <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #d9d9d9', boxShadow: 'none' }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={800} color="#2497d3">Volunteer Registration Form</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your photo, choose volunteer team category, and submit your details.
                  </Typography>
                </Stack>
              </Paper>

              <TextField fullWidth size="small" label="First Name" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} sx={inputSx} />
              <TextField fullWidth size="small" label="Last Name" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} sx={inputSx} />
              <TextField fullWidth size="small" label="Mobile Number" value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)} sx={inputSx} />

              <TextField select fullWidth size="small" label="Gender" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} sx={inputSx}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                label="Volunteer Team Category"
                value={form.teamId}
                onChange={(e) => updateField('teamId', e.target.value)}
                sx={inputSx}
              >
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
                ))}
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>

              {form.teamId === 'OTHER' ? (
                <TextField fullWidth size="small" label="Other Team Category" value={form.teamOther} onChange={(e) => updateField('teamOther', e.target.value)} sx={inputSx} />
              ) : null}

              <TextField fullWidth size="small" label="Address" value={form.address} onChange={(e) => updateField('address', e.target.value)} multiline minRows={3} sx={inputSx} />
              <TextField fullWidth size="small" label="Remarks" value={form.remarks} onChange={(e) => updateField('remarks', e.target.value)} multiline minRows={2} sx={inputSx} />

              <Button component="label" variant="outlined" startIcon={<EmojiPeople />} sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 700 }}>
                {previewSrc ? 'Change Photo' : 'Upload Photo'}
                <input hidden type="file" accept="image/*" onChange={handlePhotoPick} />
              </Button>

              {previewSrc ? (
                <Box
                  component="img"
                  src={previewSrc}
                  alt="Volunteer preview"
                  sx={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '1px solid #d9d9d9' }}
                />
              ) : null}

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || !form.firstName || !form.lastName || !form.mobile || !form.teamId || !previewSrc}
                sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 700, bgcolor: '#2497d3', '&:hover': { bgcolor: '#1e88c0' } }}
              >
                {saving ? 'Submitting...' : 'Submit Volunteer Registration'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <ImageCropDialog
        open={cropOpen}
        imageSrc={rawImageSrc}
        title="Crop volunteer photo"
        cropShape="round"
        aspect={1}
        onClose={() => setCropOpen(false)}
        onDone={({ file, previewUrl }) => {
          setForm((prev) => ({ ...prev, photoFile: file, photoPreviewUrl: previewUrl, photoUrl: '' }));
          setCropOpen(false);
        }}
      />
    </Box>
  );
}
