import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DownloadIcon from '@mui/icons-material/Download';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

// --- Template circle geometry (fractions of template image dimensions) ---
// Adjust these constants if the photo placement drifts on a different template
const CIRCLE_CX = 0.535;  // centre X as fraction of image width
const CIRCLE_CY = 0.245;  // centre Y as fraction of image height
const CIRCLE_R  = 0.163;  // radius  as fraction of image width

// -------------------------------------------------------------------------

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedBlob(imageSrc, cropPixels) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width  = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, 0, 0, cropPixels.width, cropPixels.height);
  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
  );
}

async function buildFinalCanvas(templateSrc, userPhotoBlobUrl, text) {
  const [template, photo] = await Promise.all([loadImage(templateSrc), loadImage(userPhotoBlobUrl)]);

  const W  = template.naturalWidth;
  const H  = template.naturalHeight;
  const cx = W * CIRCLE_CX;
  const cy = H * CIRCLE_CY;
  const r  = W * CIRCLE_R;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Draw user photo clipped to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(photo, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // 2. Draw template with inner circle erased so photo shows through
  const tmp    = document.createElement('canvas');
  tmp.width    = W;
  tmp.height   = H;
  const tCtx   = tmp.getContext('2d');
  tCtx.drawImage(template, 0, 0);
  tCtx.globalCompositeOperation = 'destination-out';
  tCtx.beginPath();
  tCtx.arc(cx, cy, r, 0, Math.PI * 2);
  tCtx.fill();
  ctx.drawImage(tmp, 0, 0);

  // 3. Text below circle
  if (text.trim()) {
    const fontSize = Math.round(W * 0.048);
    ctx.font         = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur   = 10;
    ctx.fillStyle    = '#FFD700';
    ctx.fillText(text, W / 2, cy + r + H * 0.075);
    ctx.shadowBlur   = 0;
  }

  return canvas;
}

// -------------------------------------------------------------------------
// Crop dialog
// -------------------------------------------------------------------------
function CropDialog({ open, imageSrc, onClose, onDone }) {
  const [crop, setCrop]       = useState({ x: 0, y: 0 });
  const [zoom, setZoom]       = useState(1);
  const [croppedPx, setCroppedPx] = useState(null);
  const [saving, setSaving]   = useState(false);

  const onCropComplete = useCallback((_, pixels) => setCroppedPx(pixels), []);

  const handleDone = useCallback(async () => {
    if (!imageSrc || !croppedPx) return;
    setSaving(true);
    try {
      const blob    = await getCroppedBlob(imageSrc, croppedPx);
      const blobUrl = URL.createObjectURL(blob);
      onDone(blobUrl);
    } finally {
      setSaving(false);
    }
  }, [imageSrc, croppedPx, onDone]);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adjust your photo</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, sm: 380 }, bgcolor: '#111', borderRadius: 2, overflow: 'hidden' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <ZoomInIcon fontSize="small" color="action" />
            <Slider value={zoom} min={1} max={3} step={0.05} onChange={(_, v) => setZoom(v)} />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleDone} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Use photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// -------------------------------------------------------------------------
// Main page
// -------------------------------------------------------------------------
export default function PublicPhotoTemplatePage() {
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  // imgRatio = naturalWidth / naturalHeight of the template; used for CSS positioning
  const [imgRatio,     setImgRatio]     = useState(null);
  const [rawSrc,       setRawSrc]       = useState(null);
  const [photoBlobUrl, setPhotoBlobUrl] = useState(null);
  const [cropOpen,     setCropOpen]     = useState(false);
  const [text,         setText]         = useState('');
  const [showText,     setShowText]     = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const handleTemplateLoad = (e) => {
    const { naturalWidth: nw, naturalHeight: nh } = e.target;
    if (nh > 0) setImgRatio(nw / nh);
  };

  const openCrop = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setRawSrc(reader.result); setCropOpen(true); };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) openCrop(file);
    e.target.value = '';
  };

  const handleCropDone = (blobUrl) => {
    if (photoBlobUrl) URL.revokeObjectURL(photoBlobUrl);
    setPhotoBlobUrl(blobUrl);
    setCropOpen(false);
    setRawSrc(null);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await buildFinalCanvas('/photo-template.jpg', photoBlobUrl, text);
      const url    = canvas.toDataURL('image/jpeg', 0.95);
      const a      = document.createElement('a');
      a.href       = url;
      a.download   = 'my-photo.jpg';
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  // CSS overlay geometry ------------------------------------------------
  // All positions are percentages:
  //   left/width  → % of container width  (same as image width fraction)
  //   top         → % of container height (needs W/H conversion)
  //
  // top% = (cy_frac - r_frac * W/H) * 100   for the box top-left corner
  // -----------------------------------------------------------------------
  const ratio = imgRatio ?? 0.82; // fallback until image loads
  const boxLeft  = (CIRCLE_CX - CIRCLE_R) * 100;
  const boxTop   = (CIRCLE_CY - CIRCLE_R * ratio) * 100;
  const boxWidth = CIRCLE_R * 2 * 100;
  const textTop  = (CIRCLE_CY + CIRCLE_R * ratio + 0.04 * ratio) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a2e', py: 3 }}>
      <Container maxWidth="sm">
        <Typography
          variant="h5"
          align="center"
          sx={{ color: '#FFD700', fontWeight: 700, mb: 2, letterSpacing: 1 }}
        >
          Create Your Photo
        </Typography>

        {/* Template preview with overlaid photo */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <img
            src="/photo-template.jpg"
            alt="template"
            onLoad={handleTemplateLoad}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />

          {/* User photo — clipped circle, sits below the template's ring overlay */}
          {photoBlobUrl ? (
            <Box
              sx={{
                position: 'absolute',
                left:   `${boxLeft}%`,
                top:    `${boxTop}%`,
                width:  `${boxWidth}%`,
                aspectRatio: '1',
                borderRadius: '50%',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <img
                src={photoBlobUrl}
                alt="your photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ) : (
            /* Tap-to-add placeholder */
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                left:   `${boxLeft}%`,
                top:    `${boxTop}%`,
                width:  `${boxWidth}%`,
                aspectRatio: '1',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: 'rgba(0,0,0,0.38)',
                color: '#fff',
                gap: 0.5,
                transition: 'background 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.55)' },
              }}
            >
              <AddPhotoAlternateIcon sx={{ fontSize: '2rem', opacity: 0.9 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: '0.55rem', textAlign: 'center', px: 0.5, lineHeight: 1.2 }}
              >
                Tap to add photo
              </Typography>
            </Box>
          )}

          {/* Text overlay below circle */}
          {text.trim() && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${textTop}%`,
                textAlign: 'center',
                pointerEvents: 'none',
                px: 2,
              }}
            >
              <Typography
                sx={{
                  color: '#FFD700',
                  fontWeight: 700,
                  fontSize: { xs: '3.2vw', sm: '1rem' },
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  letterSpacing: 0.5,
                  wordBreak: 'break-word',
                }}
              >
                {text}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Text input */}
        {showText && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Add text below photo"
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ maxLength: 60 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#FFD700' },
                  '&:hover fieldset': { borderColor: '#FFC300' },
                },
                '& .MuiInputLabel-root': { color: '#FFD700' },
              }}
            />
          </Box>
        )}

        {/* Action buttons */}
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFC300', bgcolor: 'rgba(255,215,0,0.08)' } }}
            >
              Gallery
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CameraAltIcon />}
              onClick={() => cameraInputRef.current?.click()}
              sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFC300', bgcolor: 'rgba(255,215,0,0.08)' } }}
            >
              Camera
            </Button>
          </Stack>

          <Button
            variant={showText ? 'contained' : 'outlined'}
            fullWidth
            startIcon={<TextFieldsIcon />}
            onClick={() => setShowText(v => !v)}
            sx={showText
              ? { bgcolor: '#FFD700', color: '#000', '&:hover': { bgcolor: '#FFC300' } }
              : { borderColor: '#888', color: '#aaa', '&:hover': { borderColor: '#FFD700', color: '#FFD700', bgcolor: 'rgba(255,215,0,0.06)' } }
            }
          >
            {showText ? 'Hide text' : 'Add text'}
          </Button>

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            disabled={!photoBlobUrl || downloading}
            onClick={handleDownload}
            sx={{
              bgcolor: '#FFD700', color: '#000', fontWeight: 700,
              '&:hover': { bgcolor: '#FFC300' },
              '&:disabled': { bgcolor: '#444', color: '#777' },
            }}
          >
            {downloading ? 'Preparing…' : 'Download Image'}
          </Button>
        </Stack>

        <Typography variant="caption" align="center" display="block" sx={{ mt: 2, color: '#555' }}>
          Your photo is never uploaded — everything happens in your browser.
        </Typography>
      </Container>

      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*"                style={{ display: 'none' }} onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleFileChange} />

      <CropDialog
        open={cropOpen}
        imageSrc={rawSrc}
        onClose={() => { setCropOpen(false); setRawSrc(null); }}
        onDone={handleCropDone}
      />
    </Box>
  );
}
