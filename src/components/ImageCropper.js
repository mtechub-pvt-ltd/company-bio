import React, { useState, useRef, useEffect } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material'
import CustomButton from './CustomButton'
import 'react-image-crop/dist/ReactCrop.css'
import './ImageCropper.css'
import { useTranslation } from 'react-i18next'

// This is to demonstate how to make aand center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ 
  selectedImage, 
  onCropComplete, 
  onClose 
}) {
  const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef(null)
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState(0)
  const { t } = useTranslation()
  // Set image source when selectedImage prop changes
  useEffect(() => {
    if (selectedImage) {
      setImgSrc(selectedImage)
    }
  }, [selectedImage])

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  //load src and convert to a File instance object
  //work for any type of src, not only image src.
  //return a promise that resolves with a File instance
  // function srcToFile(
  //   src,
  //   fileName,
  //   mimeType,
  // ) {
  //   return fetch(src)
  //     .then(function (res) {
  //       return res.arrayBuffer()
  //     })
  //     .then(function (buf) {
  //       return new File([buf], fileName, { type: mimeType })
  //     })
  // }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
        
        // Log for debugging
        console.log('Preview crop data:', {
          completedCrop,
          imageWidth: imgRef.current.width,
          imageHeight: imgRef.current.height,
          naturalWidth: imgRef.current.naturalWidth,
          naturalHeight: imgRef.current.naturalHeight,
          scale,
          rotate
        });
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      setAspect(16 / 9)
      setCrop(centerAspectCrop(width, height, 16 / 9))
    }
  }

  const handleCropComplete = () => {
    if (completedCrop && previewCanvasRef.current && onCropComplete) {
      // Convert canvas to blob and pass it directly
      previewCanvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-logo.jpg', { type: 'image/jpeg' });
          onCropComplete(file); // Pass the actual file instead of crop coordinates
        }
      }, 'image/jpeg', 0.9);
    }
  }

  const handleClose = () => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setScale(1)
    setRotate(0)
    setAspect(0)
    setImgSrc('')
    if (onClose) onClose()
  }

  return (
    <Dialog open={!!selectedImage} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('cropBusinessLogo')}</DialogTitle>
      <DialogContent>
        {imgSrc && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
            {/* Main Image Cropping Area */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                height: 400, 
                backgroundColor: '#f0f0f0',
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid #ddd'
              }}>
                <ReactCrop
                  style={{ width: '100%', height: 'auto' }}
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </Box>
              
              {/* Controls */}
              <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Scale:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={scale}
                    disabled={!imgSrc}
                    onChange={(e) => setScale(Number(e.target.value))}
                    style={{ 
                      flex: 1, 
                      margin: '0 8px',
                      height: '32px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      padding: '0 8px'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <button 
                    onClick={handleToggleAspectClick}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f9f9f9',
                      cursor: 'pointer'
                    }}
                  >
                    Toggle aspect {aspect ? 'off' : 'on'}
                  </button>
                </Box>
                
                <Box sx={{ fontSize: 12, color: '#666', textAlign: 'center', mb: 2 }}>
                  <strong>Instructions:</strong><br/>
                  • Drag the crop area to reposition<br/>
                  • Use scale input to adjust size<br/>
                  • The crop area will be your final image
                </Box>
              </Box>
            </Box>

            {/* Preview Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ 
                width: '100%', 
                maxWidth: 300, 
                height: 300, 
                border: '2px solid #ddd', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
                mb: 2
              }}>
                {completedCrop ? (
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: 14, marginBottom: 8 }}>{t('previewWillAppearHere')}</div>
                    <div style={{ fontSize: 12 }}>{t('adjustCropPreview')}</div>
                  </Box>
                )}
              </Box>
              
              {completedCrop && (
                <Box sx={{ textAlign: 'center', fontSize: 12, color: '#666' }}>
                  <div><strong>Cropped Size:</strong> {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px</div>
                  <div style={{ marginTop: 4 }}>{t('logoPreviewInfo')}</div>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <CustomButton
          label={t('cancel')}
          onClick={handleClose}
          size="small"
        />
        <CustomButton
          label={t('cropAndUpload')}
          onClick={handleCropComplete}
          size="small"
          disabled={!completedCrop}
          sx={{ 
            backgroundColor: '#007bff',
            color: 'white',
            '&:hover': {
              backgroundColor: '#0056b3',
            }
          }}
        />
      </DialogActions>
    </Dialog>
  )
}
