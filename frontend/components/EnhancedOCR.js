import React, { useState, useRef, useCallback } from 'react'
import Tesseract from 'tesseract.js'
import { motion } from 'framer-motion'

const EnhancedOCR = ({ onTextExtracted, onProgress }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const workerRef = useRef(null)

  // Enhanced OCR with preprocessing
  const processImage = useCallback(async (file) => {
    setIsProcessing(true)
    setProgress(0)

    try {
      // Create canvas for image preprocessing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = URL.createObjectURL(file)
      })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Apply image enhancements
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Increase contrast and brightness
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        data[i] = Math.min(255, data[i] * 1.2)     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.2) // Green  
        data[i + 2] = Math.min(255, data[i + 2] * 1.2) // Blue
      }

      ctx.putImageData(imageData, 0, 0)
      
      // Convert canvas to blob
      const enhancedBlob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/png', 0.95)
      )

      // Perform OCR with multiple languages
      const result = await Tesseract.recognize(
        enhancedBlob,
        'eng+ben', // English + Bengali
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progressPercent = Math.round(m.progress * 100)
              setProgress(progressPercent)
              onProgress?.(progressPercent)
            }
          },
          psm: Tesseract.PSM.AUTO,
          oem: Tesseract.OEM.LSTM_ONLY,
        }
      )

      // Enhanced text cleanup
      let extractedText = result.data.text
      
      // Medical text corrections
      extractedText = extractedText
        .replace(/rng/gi, 'mg')
        .replace(/n19/gi, 'mg')
        .replace(/l(\d)/g, '1$1')
        .replace(/O(\d)/g, '0$1')
        .replace(/Co\s+([a-zA-Z])/g, 'Co-$1')
        .replace(/\s+/g, ' ')
        .trim()

      onTextExtracted(extractedText)
      
    } catch (error) {
      console.error('OCR Error:', error)
      throw new Error('OCR প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }, [onTextExtracted, onProgress])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      await processImage(files[0])
    }
  }, [processImage])

  const handleFileSelect = useCallback(async (e) => {
    const files = e.target.files
    if (files && files[0]) {
      await processImage(files[0])
    }
  }, [processImage])

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
            <div>
              <p className="text-lg font-medium">প্রেসক্রিপশন পড়া হচ্ছে...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}% সম্পন্ন</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">
                প্রেসক্রিপশনের ছবি আপলোড করুন
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                অথবা ড্র্যাগ করে এনে ছেড়ে দিন
              </p>
              <p className="text-xs text-gray-400 mt-2">
                সমর্থিত ফরম্যাট: JPG, PNG, WEBP
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default EnhancedOCR
