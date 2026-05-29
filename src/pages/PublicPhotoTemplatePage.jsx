import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import {
  Box,
  Button,
  ButtonGroup,
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// --- Template circle geometry (fractions of template image dimensions) ---
const CIRCLE_CX = 0.50;   // centred horizontally
const CIRCLE_CY = 0.245;  // vertical centre
const CIRCLE_R  = 0.20;   // radius as fraction of image width (larger)

// Canvas font sizes as fraction of canvas width
const FONT_SIZE = { small: 0.033, medium: 0.048, large: 0.068 };

// -------------------------------------------------------------------------

function clamp(min, val, max) { return Math.min(max, Math.max(min, val)); }

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
  ctx.drawImage(image, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
                0, 0, cropPixels.width, cropPixels.height);
  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
  );
}

async function buildFinalCanvas(templateSrc, userPhotoBlobUrl, text, textPosPct, textSizeKey) {
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
  const tmp  = document.createElement('canvas');
  tmp.width  = W;
  tmp.height = H;
  const tCtx = tmp.getContext('2d');
  tCtx.drawImage(template, 0, 0);
  tCtx.globalCompositeOperation = 'destination-out';
  tCtx.beginPath();
  tCtx.arc(cx, cy, r, 0, Math.PI * 2);
  tCtx.fill();
  ctx.drawImage(tmp, 0, 0);

  // 3. Text at dragged position (pct of canvas dimensions)
  if (text.trim()) {
    const fontSize = Math.round(W * (FONT_SIZE[textSizeKey] ?? FONT_SIZE.medium));
    ctx.font         = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur   = 10;
    ctx.fillStyle    = '#FFD700';
    ctx.fillText(text, (textPosPct.x / 100) * W, (textPosPct.y / 100) * H);
    ctx.shadowBlur   = 0;
  }

  return canvas;
}

// -------------------------------------------------------------------------
// Crop dialog
// -------------------------------------------------------------------------
function CropDialog({ open, imageSrc, onClose, onDone }) {
  const [crop, setCrop]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(1);
  const [croppedPx, setCroppedPx] = useState(null);
  const [saving, setSaving] = useState(false);

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
          <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, sm: 400 }, bgcolor: '#111', borderRadius: 2, overflow: 'hidden' }}>
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
  const containerRef   = useRef(null);
  const dragRef        = useRef(null);   // { startX, startY, origX, origY }

  const [imgRatio,     setImgRatio]     = useState(0.82); // W/H, updated on img load
  const [rawSrc,       setRawSrc]       = useState(null);
  const [photoBlobUrl, setPhotoBlobUrl] = useState(null);
  const [cropOpen,     setCropOpen]     = useState(false);
  const [text,         setText]         = useState('');
  const [showText,     setShowText]     = useState(false);
  const [textSize,     setTextSize]     = useState('medium');
  const [textPos,      setTextPos]      = useState(null);  // null = auto-below-circle
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

  // --- CSS overlay geometry ----------------------------------------------
  const ratio    = imgRatio;
  const boxLeft  = (CIRCLE_CX - CIRCLE_R) * 100;
  const boxTop   = (CIRCLE_CY - CIRCLE_R * ratio) * 100;
  const boxWidth = CIRCLE_R * 2 * 100;
  // Default text position: just below the circle
  const defaultTextY = (CIRCLE_CY + CIRCLE_R * ratio + 0.05 * ratio) * 100;
  const textX = textPos?.x ?? 50;
  const textY = textPos?.y ?? defaultTextY;

  // --- Drag handlers for text label --------------------------------------
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: textX,
      origY: textY,
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.startX) / rect.width  * 100;
    const dy = (e.clientY - dragRef.current.startY) / rect.height * 100;
    setTextPos({
      x: clamp(8, dragRef.current.origX + dx, 92),
      y: clamp(5, dragRef.current.origY + dy, 95),
    });
  };

  const handlePointerUp = () => { dragRef.current = null; };

  // --- Download ----------------------------------------------------------
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const pos    = { x: textX, y: textY };
      const canvas = await buildFinalCanvas('/photo-template.jpg', photoBlobUrl, text, pos, textSize);
      const url    = canvas.toDataURL('image/jpeg', 0.95);
      const a      = document.createElement('a');
      a.href       = url;
      a.download   = 'my-photo.jpg';
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const cssFontSize = { small: { xs: '2.5vw', sm: '0.85rem' }, medium: { xs: '3.8vw', sm: '1.1rem' }, large: { xs: '5.5vw', sm: '1.6rem' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a2e', py: 3 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" align="center" sx={{ color: '#FFD700', fontWeight: 700, mb: 2, letterSpacing: 1 }}>
          Create Your Photo
        </Typography>

        {/* Template preview */}
        <Box
          ref={containerRef}
          sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', userSelect: 'none' }}
        >
          <img
            src="/photo-template.jpg"
            alt="template"
            onLoad={handleTemplateLoad}
            style={{ display: 'block', width: '100%', height: 'auto' }}
            draggable={false}
          />

          {/* Photo circle overlay */}
          {photoBlobUrl ? (
            <Box
              sx={{
                position: 'absolute',
                left: `${boxLeft}%`,
                top: `${boxTop}%`,
                width: `${boxWidth}%`,
                aspectRatio: '1',
                borderRadius: '50%',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <img src={photoBlobUrl} alt="your photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                left: `${boxLeft}%`,
                top: `${boxTop}%`,
                width: `${boxWidth}%`,
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
              <AddPhotoAlternateIcon sx={{ fontSize: '2.2rem', opacity: 0.9 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.55rem', textAlign: 'center', px: 0.5, lineHeight: 1.2 }}>
                Tap to add photo
              </Typography>
            </Box>
          )}

          {/* Draggable text overlay */}
          {showText && text.trim() && (
            <Box
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              sx={{
                position: 'absolute',
                left: `${textX}%`,
                top: `${textY}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.15)',
                border: '1px dashed rgba(255,215,0,0.4)',
                touchAction: 'none',
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: '0.85rem', color: 'rgba(255,215,0,0.6)', flexShrink: 0 }} />
              <Typography
                sx={{
                  color: '#FFD700',
                  fontWeight: 700,
                  fontSize: cssFontSize[textSize],
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  letterSpacing: 0.5,
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Text controls */}
        {showText && (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Your text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ maxLength: 60 }}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#FFC300' } },
                '& .MuiInputLabel-root': { color: '#FFD700' },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="caption" sx={{ color: '#aaa', whiteSpace: 'nowrap' }}>Text size:</Typography>
              <ButtonGroup size="small" sx={{ flex: 1 }}>
                {['small', 'medium', 'large'].map((sz) => (
                  <Button
                    key={sz}
                    onClick={() => setTextSize(sz)}
                    variant={textSize === sz ? 'contained' : 'outlined'}
                    sx={textSize === sz
                      ? { flex: 1, bgcolor: '#FFD700', color: '#000', fontWeight: 700, borderColor: '#FFD700', '&:hover': { bgcolor: '#FFC300' } }
                      : { flex: 1, borderColor: '#555', color: '#aaa', '&:hover': { borderColor: '#FFD700', color: '#FFD700' } }
                    }
                  >
                    {sz === 'small' ? 'S' : sz === 'medium' ? 'M' : 'L'}
                  </Button>
                ))}
              </ButtonGroup>
              <Typography variant="caption" sx={{ color: '#666', whiteSpace: 'nowrap' }}>Drag text on image</Typography>
            </Stack>
          </Stack>
        )}

        {/* Action buttons */}
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined" fullWidth
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderColor: '#FFD700', color: '#FFD700', '&:hover': { borderColor: '#FFC300', bgcolor: 'rgba(255,215,0,0.08)' } }}
            >
              Gallery
            </Button>
            <Button
              variant="outlined" fullWidth
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
            variant="contained" fullWidth size="large"
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
