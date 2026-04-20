import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Slider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add,
  CheckCircle,
  DriveFolderUpload,
  Insights,
  Delete,
  EmojiEvents
} from '@mui/icons-material';
import {
  emptySubject,
  isOtherCategory,
  getSelectedCategory,
  isCbseCategory,
  calculateBest5Preview
} from './studentFormConfig';
import { uploadPublicFile } from '../../services/uploadService';

const steps = ['Personal', 'Academic', 'Uploads', 'Review'];

const requiredByStep = {
  0: ['fullName', 'gender', 'address', 'mobile', 'parentMobile'],
  1: ['categoryId', 'schoolName', 'className'],
  2: ['marksheetFileUrl', 'studentPhotoUrl']
};

const isPresent = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const fieldLabels = {
  fullName: 'Full Name',
  gender: 'Gender',
  address: 'Address',
  mobile: 'Mobile Number',
  parentMobile: 'Parent Mobile Number',
  categoryId: 'Category',
  categoryOther: 'Other Category',
  schoolName: 'School or College Name',
  className: 'Class',
  percentage: 'Percentage',
  marksheetFileUrl: 'Marksheet Upload',
  studentPhotoUrl: 'Student Photo Upload'
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: '#fff'
  }
};

const sectionPaperSx = {
  p: { xs: 1.5, sm: 2 },
  borderRadius: 3,
  border: '1px solid #e5e7eb',
  bgcolor: '#fff'
};

const DetailLine = ({ label, value }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    spacing={2}
    sx={{
      py: 0.7,
      borderBottom: '1px dashed #eef2f7',
      '&:last-child': { borderBottom: 'none', pb: 0 }
    }}
  >
    <Typography color="text.secondary" sx={{ fontSize: 14 }}>
      {label}
    </Typography>
    <Typography fontWeight={600} textAlign="right" sx={{ fontSize: 14 }}>
      {value || '-'}
    </Typography>
  </Stack>
);

export function StudentWizardStepPersonal({ form, setForm, errors }) {
  return (
    <Stack spacing={1.5}>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Full Name"
            value={form.fullName}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            select
            label="Gender"
            value={form.gender}
            error={Boolean(errors.gender)}
            helperText={errors.gender}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
          >
            <MenuItem value="Any">Any</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            label="Address"
            value={form.address}
            error={Boolean(errors.address)}
            helperText={errors.address}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Mobile Number"
            value={form.mobile}
            error={Boolean(errors.mobile)}
            helperText={errors.mobile}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Parent Mobile Number"
            value={form.parentMobile}
            error={Boolean(errors.parentMobile)}
            helperText={errors.parentMobile}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, parentMobile: e.target.value }))}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export function StudentWizardStepAcademic({
  form,
  setForm,
  errors,
  categories = []
}) {
  const selectedCategory = getSelectedCategory(categories, form.categoryId);
  const isCbse = isCbseCategory(selectedCategory, form);
  const best5Preview = calculateBest5Preview(form.subjects || []);

  const updateSubject = (idx, key, value) => {
    const subjects = [...(form.subjects || [])];
    subjects[idx] = { ...subjects[idx], [key]: value };
    setForm((prev) => ({ ...prev, subjects }));
  };

  const removeSubject = (idx) => {
    const subjects = (form.subjects || []).filter((_, index) => index !== idx);
    setForm((prev) => ({
      ...prev,
      subjects: subjects.length ? subjects : [{ ...emptySubject }]
    }));
  };

  const handleCategoryChange = (value) => {
    setForm((prev) => ({
      ...prev,
      categoryId: value,
      categoryOther: value === 'OTHER' ? prev.categoryOther || '' : '',
      percentage: prev.percentage,
      subjects: prev.subjects?.length ? prev.subjects : [{ ...emptySubject }]
    }));
  };

  return (
    <Stack spacing={1.75}>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            select
            label="Category"
            value={form.categoryId || ''}
            error={Boolean(errors.categoryId)}
            helperText={errors.categoryId}
            sx={inputSx}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.title}
              </MenuItem>
            ))}
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>
        </Grid>

        {isOtherCategory(form.categoryId) ? (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Other Category"
              value={form.categoryOther || ''}
              error={Boolean(errors.categoryOther)}
              helperText={errors.categoryOther}
              sx={inputSx}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryOther: e.target.value }))}
            />
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="School or College Name"
            value={form.schoolName}
            error={Boolean(errors.schoolName)}
            helperText={errors.schoolName}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Class"
            value={form.className}
            error={Boolean(errors.className)}
            helperText={errors.className}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, className: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={isCbse ? 'Percentage (optional)' : 'Percentage'}
            value={form.percentage}
            error={Boolean(errors.percentage)}
            helperText={errors.percentage}
            sx={inputSx}
            onChange={(e) => setForm((prev) => ({ ...prev, percentage: e.target.value }))}
          />
        </Grid>
      </Grid>

      {isCbse ? (
        <>
          <Divider />
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Subject-wise Marks
              </Typography>

              <Button
                size="small"
                startIcon={<Add />}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    subjects: [...(prev.subjects || []), { ...emptySubject }]
                  }))
                }
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Add Subject
              </Button>
            </Stack>

            {(form.subjects || []).map((subject, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  borderColor: '#e5e7eb',
                  bgcolor: '#fafafa'
                }}
              >
                <Grid container spacing={1.25} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Subject"
                      value={subject.subject}
                      sx={inputSx}
                      onChange={(e) => updateSubject(idx, 'subject', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Marks"
                      value={subject.marksObtained}
                      sx={inputSx}
                      onChange={(e) => updateSubject(idx, 'marksObtained', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Max Marks"
                      value={subject.maxMarks}
                      sx={inputSx}
                      onChange={(e) => updateSubject(idx, 'maxMarks', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={2} sm={1}>
                    <Button
                      color="error"
                      onClick={() => removeSubject(idx)}
                      sx={{
                        minWidth: 0,
                        p: 0.8,
                        borderRadius: 2,
                        width: '100%'
                      }}
                    >
                      <Delete fontSize="small" />
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Alert severity="info" icon={<Insights />} sx={{ borderRadius: 2.5 }}>
              <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                CBSE Best 5 preview: {best5Preview.percentage.toFixed(2)}%
              </Typography>
              <Typography variant="body2">
                Top 5 subjects are calculated automatically.
              </Typography>
            </Alert>
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}

export function StudentWizardStepUploads({ form, setForm, errors }) {
  const [uploadingField, setUploadingField] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadingField(field);

    try {
      const uploaded = await uploadPublicFile(
        file,
        field === 'marksheetFileUrl' ? 'bk_awards/marksheets' : 'bk_awards/student_photos'
      );

      const url = uploaded?.url || '';

      if (field === 'marksheetFileUrl') {
        setForm((prev) => ({ ...prev, marksheetFileUrl: url, resultImageUrl: url }));
      } else {
        setForm((prev) => ({
          ...prev,
          studentPhotoUrl: url,
          certificatePhotoUrl: url
        }));
      }
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'File upload failed. Please try a smaller file.');
    } finally {
      setUploadingField('');
      event.target.value = '';
    }
  };

  return (
    <Stack spacing={1.75}>
      {uploadingField ? <LinearProgress sx={{ borderRadius: 999, height: 6 }} /> : null}

      {uploadError ? (
        <Alert severity="error" sx={{ borderRadius: 2.5 }}>
          {uploadError}
        </Alert>
      ) : null}

      <Paper sx={sectionPaperSx}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle2" fontWeight={700}>
            Upload Documents
          </Typography>

          <Button
            component="label"
            fullWidth
            variant="outlined"
            startIcon={<DriveFolderUpload />}
            sx={{
              py: 1.4,
              borderStyle: 'dashed',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600
            }}
            color={errors.marksheetFileUrl ? 'error' : 'primary'}
            disabled={Boolean(uploadingField)}
          >
            {uploadingField === 'marksheetFileUrl'
              ? 'Uploading marksheet...'
              : form.marksheetFileUrl || form.resultImageUrl
                ? 'Marksheet Uploaded'
                : 'Upload Marksheet *'}
            <input hidden type="file" accept="image/*,.pdf" onChange={(e) => handleFile(e, 'marksheetFileUrl')} />
          </Button>

          <Button
            component="label"
            fullWidth
            variant="outlined"
            startIcon={<DriveFolderUpload />}
            sx={{
              py: 1.4,
              borderStyle: 'dashed',
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600
            }}
            color={errors.studentPhotoUrl ? 'error' : 'primary'}
            disabled={Boolean(uploadingField)}
          >
            {uploadingField === 'studentPhotoUrl'
              ? 'Uploading student photo...'
              : form.studentPhotoUrl || form.certificatePhotoUrl
                ? 'Student Photo Uploaded'
                : 'Upload Student Photo *'}
            <input hidden type="file" accept="image/*" onChange={(e) => handleFile(e, 'studentPhotoUrl')} />
          </Button>
        </Stack>
      </Paper>

      {form.studentPhotoUrl ? (
        <Paper sx={sectionPaperSx}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Photo Preview
          </Typography>
          <Box
            component="img"
            src={form.studentPhotoUrl}
            alt="Student preview"
            sx={{
              width: 84,
              height: 100,
              borderRadius: 2,
              display: 'block',
              objectFit: 'cover',
              border: '1px solid #e5e7eb'
            }}
          />
        </Paper>
      ) : null}

      <TextField
        fullWidth
        size="small"
        multiline
        minRows={3}
        label="Remarks (Optional)"
        value={form.remarks}
        sx={inputSx}
        onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
      />
    </Stack>
  );
}

export function StudentWizardStepReview({ form, categories = [] }) {
  const selectedCategory = getSelectedCategory(categories, form.categoryId);
  const isCbse = isCbseCategory(selectedCategory, form);
  const best5Preview = calculateBest5Preview(form.subjects || []);

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={sectionPaperSx}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Personal Details
        </Typography>
        <DetailLine label="Full Name" value={form.fullName} />
        <DetailLine label="Gender" value={form.gender} />
        <DetailLine label="Address" value={form.address} />
        <DetailLine label="Mobile Number" value={form.mobile} />
        <DetailLine label="Parent Mobile Number" value={form.parentMobile} />
      </Paper>

      <Paper variant="outlined" sx={sectionPaperSx}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Academic Details
        </Typography>
        <DetailLine
          label="Category"
          value={isOtherCategory(form.categoryId) ? form.categoryOther : selectedCategory?.title}
        />
        <DetailLine label="School or College Name" value={form.schoolName} />
        <DetailLine label="Class" value={form.className} />
        <DetailLine label="Percentage" value={form.percentage || 'Will use subject marks'} />
        {isCbse ? (
          <DetailLine
            label="Subject Rows"
            value={String(form.subjects?.filter((s) => s.subject?.trim()).length || 0)}
          />
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={sectionPaperSx}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Uploads
        </Typography>
        <DetailLine label="Marksheet" value={form.marksheetFileUrl || form.resultImageUrl ? 'Uploaded' : 'Missing'} />
        <DetailLine label="Photo" value={form.studentPhotoUrl || form.certificatePhotoUrl ? 'Uploaded' : 'Missing'} />
        <DetailLine label="Remarks" value={form.remarks || '-'} />
      </Paper>

      {isCbse ? (
        <Alert severity="info" icon={<Insights />} sx={{ borderRadius: 2.5 }}>
          Best 5 calculated preview is <strong>{best5Preview.percentage.toFixed(2)}%</strong>.
        </Alert>
      ) : null}
    </Stack>
  );
}

export function StudentCertificatePreviewSection({ form, editable = false, onAdjustmentsChange }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: 'none'
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
          Certificate Preview
        </Typography>

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: '#fff7e6',
            minHeight: 260,
            p: 2,
            position: 'relative',
            border: '1px dashed #e2b866'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <EmojiEvents fontSize="small" color="warning" />
            <Typography variant="caption" color="text.secondary">
              Award certificate preview
            </Typography>
          </Stack>

          <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>
            {form.fullName || 'Student Name'}
          </Typography>
          <Typography color="text.secondary">
            {form.className || 'Class'} · {form.percentage || 0}%
          </Typography>

          <Box
            sx={{
              width: 100,
              height: 120,
              bgcolor: 'rgba(21,94,239,0.12)',
              borderRadius: 2,
              position: 'absolute',
              right: 24 + (form.certificateAdjustments?.photoX || 0) / 5,
              top: 48 + (form.certificateAdjustments?.photoY || 0) / 5,
              transform: `scale(${form.certificateAdjustments?.photoScale || 1}) rotate(${form.certificateAdjustments?.photoRotation || 0}deg)`,
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              fontWeight: 700
            }}
          >
            {form.studentPhotoUrl ? (
              <img src={form.studentPhotoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'PHOTO'
            )}
          </Box>
        </Box>

        {editable ? (
          <Stack spacing={1.1} sx={{ mt: 2.25 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Certificate Photo Alignment
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Scale
            </Typography>
            <Slider
              min={0.6}
              max={2}
              step={0.1}
              value={form.certificateAdjustments?.photoScale || 1}
              onChange={(_, v) => onAdjustmentsChange({ photoScale: Number(v) })}
            />

            <Typography variant="caption" color="text.secondary">
              Rotation
            </Typography>
            <Slider
              min={-20}
              max={20}
              step={1}
              value={form.certificateAdjustments?.photoRotation || 0}
              onChange={(_, v) => onAdjustmentsChange({ photoRotation: Number(v) })}
            />

            <Typography variant="caption" color="text.secondary">
              Move X
            </Typography>
            <Slider
              min={-100}
              max={100}
              step={1}
              value={form.certificateAdjustments?.photoX || 0}
              onChange={(_, v) => onAdjustmentsChange({ photoX: Number(v) })}
            />

            <Typography variant="caption" color="text.secondary">
              Move Y
            </Typography>
            <Slider
              min={-100}
              max={100}
              step={1}
              value={form.certificateAdjustments?.photoY || 0}
              onChange={(_, v) => onAdjustmentsChange({ photoY: Number(v) })}
            />
          </Stack>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function StudentFormWizard({
  mode,
  form,
  setForm,
  categories = [],
  onSubmit,
  saving,
  successMessage,
  topInfo,
  showCertificatePreview = false
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});

  const selectedCategory = getSelectedCategory(categories, form.categoryId);
  const isCbse = isCbseCategory(selectedCategory, form);
  const best5Preview = useMemo(() => calculateBest5Preview(form.subjects || []), [form.subjects]);

  const validateStep = (step) => {
    const requiredFields = step === 2 && mode === 'admin' ? [] : requiredByStep[step] || [];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      const value =
        field === 'marksheetFileUrl'
          ? form.marksheetFileUrl || form.resultImageUrl
          : field === 'studentPhotoUrl'
            ? form.studentPhotoUrl || form.certificatePhotoUrl
            : form[field];

      if (!isPresent(value)) {
        nextErrors[field] = `${fieldLabels[field]} is required`;
      }
    });

    if (step === 1) {
      if (isOtherCategory(form.categoryId) && !isPresent(form.categoryOther)) {
        nextErrors.categoryOther = 'Other Category is required';
      }

      const hasMarks = (form.subjects || []).some(
        (s) => s.subject?.trim() && isPresent(s.marksObtained)
      );

      if (isCbse) {
        if (!isPresent(form.percentage) && !hasMarks) {
          nextErrors.percentage = 'Enter percentage or at least one subject mark for CBSE';
        }
      } else {
        if (!isPresent(form.percentage)) {
          nextErrors.percentage = 'Percentage is required';
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const submit = async () => {
    if (!validateStep(2)) return;
    await onSubmit();
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f8ff 55%, #fff8ec 100%)',
          border: '1px solid #dce7ff'
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={800}>
            {topInfo.title}
          </Typography>

          <Typography color="text.secondary" variant="body2">
            {topInfo.description}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              color="primary"
              label={`Step ${activeStep + 1} of ${steps.length}`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={mode === 'public' ? 'Public registration' : 'Admin-assisted'}
            />
            {isCbse ? <Chip size="small" color="info" variant="outlined" label="CBSE Best 5" /> : null}
            {activeStep === 1 && isCbse ? (
              <Chip
                size="small"
                variant="outlined"
                color="success"
                label={`Best 5: ${best5Preview.percentage.toFixed(2)}%`}
              />
            ) : null}
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 999 }}
          />
        </Stack>
      </Paper>

      {successMessage ? (
        <Alert icon={<CheckCircle />} severity="success" sx={{ borderRadius: 2.5 }}>
          {successMessage}
        </Alert>
      ) : null}

      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          {steps.map((label, index) => (
            <Chip
              key={label}
              size="small"
              label={label}
              color={index === activeStep ? 'primary' : 'default'}
              variant={index === activeStep ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          boxShadow: 'none'
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {activeStep === 0 ? (
            <StudentWizardStepPersonal form={form} setForm={setForm} errors={errors} />
          ) : null}

          {activeStep === 1 ? (
            <StudentWizardStepAcademic
              form={form}
              setForm={setForm}
              errors={errors}
              categories={categories}
            />
          ) : null}

          {activeStep === 2 ? (
            <StudentWizardStepUploads form={form} setForm={setForm} errors={errors} />
          ) : null}

          {activeStep === 3 ? (
            <StudentWizardStepReview form={form} categories={categories} />
          ) : null}
        </CardContent>
      </Card>

      {showCertificatePreview ? <StudentCertificatePreviewSection form={form} /> : null}

      <Paper
        sx={{
          p: 1.5,
          position: { xs: 'sticky', md: 'static' },
          bottom: { xs: 8, md: 'auto' },
          zIndex: 5,
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          boxShadow: { xs: '0 8px 24px rgba(15,23,42,0.08)', md: 'none' },
          bgcolor: '#fff'
        }}
      >
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1.25}>
          <Button
            fullWidth
            variant="outlined"
            disabled={activeStep === 0 || saving}
            onClick={onBack}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              py: 1.1
            }}
          >
            Back
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              fullWidth
              variant="contained"
              onClick={onNext}
              disabled={saving}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.1
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={submit}
              disabled={saving}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.1
              }}
            >
              {saving ? 'Processing...' : mode === 'public' ? 'Submit Registration' : 'Save Student'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}