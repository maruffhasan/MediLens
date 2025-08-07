'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Tesseract from 'tesseract.js'

// Enhanced Medical Report Component for MediLens Advanced Analysis
const AdvancedMedicalReport = ({ analysisData }) => {
  if (!analysisData) return null

  // Try to parse structured data from response
  let structuredData = {}
  try {
    // Look for JSON in the response
    const jsonMatch = analysisData.summary?.match(/\{[\s\S]*\}/) || 
                     analysisData.rawResponse?.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      structuredData = JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.log('No structured JSON found, using regular analysis')
  }

  const {
    diseases = analysisData.diseases || [],
    investigations = analysisData.investigations || [],
    medications = analysisData.medications || [],
    symptoms = analysisData.symptoms || [],
    patientInfo = analysisData.patientInfo || {},
    summary = analysisData.summary || '',
    warnings = analysisData.warnings || [],
    confidenceScore = analysisData.confidenceScore || 'Unknown'
  } = structuredData.diseases ? structuredData : analysisData

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          🏥 প্রেসক্রিপশন বিশ্লেষণ রিপোর্ট
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-90">বিশ্লেষণের নির্ভুলতা:</span>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="font-semibold">{confidenceScore}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Diseases & Symptoms */}
        <div className="space-y-6">
          {/* Diseases */}
          {diseases.length > 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🩺 রোগ নির্ণয়
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {diseases.map((disease, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                    <h4 className="font-semibold text-red-800 mb-1">
                      {disease.bangla || disease.condition}
                    </h4>
                    {disease.description && (
                      <p className="text-red-700 text-sm">{disease.description}</p>
                    )}
                    {disease.confidence && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                        disease.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        disease.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {disease.confidence === 'high' ? 'উচ্চ নিশ্চিততা' :
                         disease.confidence === 'medium' ? 'মাঝারি নিশ্চিততা' : 'কম নিশ্চিততা'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Symptoms */}
          {symptoms.length > 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🤒 উপসর্গসমূহ
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {symptoms.map((symptom, index) => (
                  <div key={index} className="bg-orange-50 p-3 rounded border-l-4 border-orange-300">
                    <span className="font-medium text-orange-800">
                      {symptom.bangla || symptom.symptom}
                    </span>
                    {symptom.severity && (
                      <span className="text-xs text-orange-600 ml-2">({symptom.severity})</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Column 2: Tests & Investigations */}
        <div className="space-y-6">
          {investigations.length > 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🧪 পরীক্ষা-নিরীক্ষা
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {investigations.map((test, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      {test.bangla || test.test}
                    </h4>
                    {test.result && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">ফলাফল:</span> {test.result}
                      </p>
                    )}
                    {test.normalRange && (
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">স্বাভাবিক মাত্রা:</span> {test.normalRange}
                      </p>
                    )}
                    {test.interpretation && (
                      <p className="text-sm text-blue-700 bg-blue-100 p-2 rounded mt-2">
                        {test.interpretation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Patient Info */}
          {Object.keys(patientInfo).length > 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  👤 রোগীর তথ্য
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-3">
                {patientInfo.name && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-600 block">নাম:</span>
                    <span className="font-medium">{patientInfo.name}</span>
                  </div>
                )}
                {patientInfo.age && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-600 block">বয়স:</span>
                    <span className="font-medium">{patientInfo.age}</span>
                  </div>
                )}
                {patientInfo.gender && (
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-600 block">লিঙ্গ:</span>
                    <span className="font-medium">{patientInfo.gender}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Column 3: Medications */}
        <div className="space-y-6">
          {medications.length > 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  💊 নির্ধারিত ওষুধসমূহ
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-800">
                        {med.bangla || med.name}
                      </h4>
                      {med.confidence && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          med.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          med.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {med.confidence === 'high' ? 'নিশ্চিত' :
                           med.confidence === 'medium' ? 'সম্ভাব্য' : 'অনিশ্চিত'}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {med.strength && (
                        <div className="flex">
                          <span className="text-gray-600 w-20">শক্তি:</span>
                          <span className="font-medium">{med.strength}</span>
                        </div>
                      )}
                      {med.frequency && (
                        <div className="flex">
                          <span className="text-gray-600 w-20">সেবনবিধি:</span>
                          <span className="font-medium">{med.frequency}</span>
                        </div>
                      )}
                      {med.timing && (
                        <div className="flex">
                          <span className="text-gray-600 w-20">সময়:</span>
                          <span className="font-medium">{med.timing}</span>
                        </div>
                      )}
                      {med.duration && (
                        <div className="flex">
                          <span className="text-gray-600 w-20">মেয়াদ:</span>
                          <span className="font-medium">{med.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {med.purpose && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                        <span className="font-medium text-blue-800">কাজ:</span>
                        <p className="text-blue-700 mt-1">{med.purpose}</p>
                      </div>
                    )}
                    
                    {med.sideEffects && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded text-sm">
                        <span className="font-medium text-yellow-800">পার্শ্বপ্রতিক্রিয়া:</span>
                        <p className="text-yellow-700 mt-1">{med.sideEffects}</p>
                      </div>
                    )}
                    
                    {med.instructions && (
                      <div className="mt-2 p-2 bg-purple-100 rounded text-sm">
                        <span className="font-medium text-purple-800">বিশেষ নির্দেশনা:</span>
                        <p className="text-purple-700 mt-1">{med.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📋 সামগ্রিক সারসংক্ষেপ
            </h3>
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{summary}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-xl p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            ⚠️ গুরুত্বপূর্ণ সতর্কতা
          </h3>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default function MediLensAdvancedUpload() {
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisStep, setAnalysisStep] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const { currentUser } = useAuth()
  const router = useRouter()

  // Enhanced OCR Processing
  const performOCR = async (file) => {
    setIsProcessing(true)
    setProgress(0)
    setError('')

    try {
      // Create image for preprocessing
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = URL.createObjectURL(file)
      })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Apply image enhancements for better OCR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Increase contrast and brightness
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.3)       // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.3) // Green  
        data[i + 2] = Math.min(255, data[i + 2] * 1.3) // Blue
      }

      ctx.putImageData(imageData, 0, 0)
      
      const enhancedBlob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/png', 0.95)
      )

      // Perform OCR with both English and Bengali
      const result = await Tesseract.recognize(
        enhancedBlob,
        'eng+ben',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const progressPercent = Math.round(m.progress * 100)
              setProgress(progressPercent)
            }
          },
          psm: Tesseract.PSM.AUTO,
          oem: Tesseract.OEM.LSTM_ONLY,
        }
      )

      // Enhanced text cleanup for medical terms
      let extractedText = result.data.text
        .replace(/rng/gi, 'mg')
        .replace(/n19/gi, 'mg')
        .replace(/l(\d)/g, '1$1')
        .replace(/O(\d)/g, '0$1')
        .replace(/Co\s+([a-zA-Z])/g, 'Co-$1')
        .replace(/\b(Tab|tab)\s+/g, 'Tablet ')
        .replace(/\b(Cap|cap)\s+/g, 'Capsule ')
        .replace(/\b(Syr|syr)\s+/g, 'Syrup ')
        .replace(/\s+/g, ' ')
        .trim()

      setExtractedText(extractedText)
      
      // Auto-analyze after extraction
      if (extractedText.trim()) {
        await analyzeWithAI(extractedText)
      }
      
    } catch (error) {
      console.error('OCR Error:', error)
      setError('OCR প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const analyzeWithAI = async (textToAnalyze) => {
    setIsAnalyzing(true)
    setError('')
    setAnalysisStep('🔍 প্রেসক্রিপশন বিশ্লেষণ শুরু হচ্ছে...')
    
    try {
      setAnalysisStep('🧠 AI দিয়ে মেডিকেল তথ্য বিশ্লেষণ করা হচ্ছে...')
      
      const response = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToAnalyze,
          analysisType: 'comprehensive'
        }),
      })

      if (!response.ok) {
        throw new Error('বিশ্লেষণে সমস্যা হয়েছে')
      }

      setAnalysisStep('📋 বিশ্লেষণ রিপোর্ট তৈরি করা হচ্ছে...')
      
      const result = await response.json()
      
      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis)
        setAnalysisStep('✅ বিশ্লেষণ সম্পন্ন!')
      } else {
        throw new Error(result.error || 'বিশ্লেষণে সমস্যা হয়েছে')
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error.message || 'বিশ্লেষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setAnalysisStep('')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      await performOCR(files[0])
    }
  }

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (files && files[0]) {
      await performOCR(files[0])
    }
  }

  const clearAnalysis = () => {
    setExtractedText('')
    setAnalysisResult(null)
    setError('')
    setAnalysisStep('')
    setProgress(0)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to upload prescriptions</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="btn btn-ghost btn-circle text-white hover:bg-white/20"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center gap-3 justify-center">
              🏥 MediLens - Advanced OCR Analysis
            </h1>
            <p className="text-white/90 mt-2">AI-Powered Medical Document Processing & Analysis</p>
          </div>
          <button 
            onClick={clearAnalysis}
            className="btn btn-ghost btn-circle text-white hover:bg-white/20"
            disabled={isProcessing || isAnalyzing}
          >
            🗑️
          </button>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          
          {/* Left Panel - Upload & Controls */}
          <motion.div 
            className="xl:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Upload Component */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📤 প্রেসক্রিপশন আপলোড
              </h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <motion.div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
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
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{progress}% সম্পন্ন</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📄</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-700">
                        প্রেসক্রিপশনের ছবি আপলোড করুন
                      </h3>
                      <p className="text-gray-500 mt-2">
                        অথবা ড্র্যাগ করে এনে ছেড়ে দিন
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        সমর্থিত ফরম্যাট: JPG, PNG, WEBP • সর্বোচ্চ ৫MB
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Extracted Text */}
            {extractedText && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  📝 উদ্ধারকৃত টেক্সট
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {extractedText}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => analyzeWithAI(extractedText)}
                    className="btn btn-primary btn-sm"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? '🔄 বিশ্লেষণ করা হচ্ছে...' : '🧠 পুনরায় বিশ্লেষণ'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText)
                      alert('টেক্সট কপি হয়েছে!')
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    📋 কপি
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="loading loading-spinner loading-md text-blue-600"></span>
                  <div>
                    <h3 className="font-semibold text-blue-800">প্রক্রিয়াকরণ চলছে...</h3>
                    <p className="text-blue-600 text-sm">{analysisStep}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">সমস্যা হয়েছে</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="btn btn-outline btn-error btn-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Panel - Analysis Results */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {analysisResult ? (
              <AdvancedMedicalReport analysisData={analysisResult} />
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center h-full flex flex-col justify-center">
                <div className="text-8xl mb-6">🔬</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  বিশ্লেষণের জন্য অপেক্ষা করছে
                </h3>
                <p className="text-gray-500 mb-8">
                  প্রেসক্রিপশনের ছবি আপলোড করুন এবং AI বিশ্লেষণ শুরু করুন
                </p>
                
                <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                    <div className="text-2xl mb-2">🏥</div>
                    <span className="text-red-600 font-medium text-sm">রোগ নির্ণয়</span>
                    <p className="text-red-700 text-xs mt-1">প্রেসক্রিপশন থেকে রোগের তথ্য</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-2xl mb-2">🧪</div>
                    <span className="text-blue-600 font-medium text-sm">পরীক্ষা</span>
                    <p className="text-blue-700 text-xs mt-1">প্রয়োজনীয় মেডিকেল টেস্ট</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <div className="text-2xl mb-2">💊</div>
                    <span className="text-green-600 font-medium text-sm">ওষুধ</span>
                    <p className="text-green-700 text-xs mt-1">ওষুধের তালিকা ও নির্দেশনা</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-2xl mb-2">📚</div>
                    <span className="text-purple-600 font-medium text-sm">শিক্ষা</span>
                    <p className="text-purple-700 text-xs mt-1">স্বাস্থ্য সচেতনতা</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div 
          className="mt-12 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border border-emerald-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            💡 সর্বোত্তম ফলাফলের জন্য পরামর্শ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 p-6 rounded-xl border border-white/50">
              <div className="text-3xl mb-3">📸</div>
              <span className="text-emerald-600 font-semibold block mb-2">ভালো ছবি</span>
              <p className="text-gray-700 text-sm">উজ্জ্বল আলোতে স্পষ্ট ছবি তুলুন এবং ছায়া এড়িয়ে চলুন</p>
            </div>
            <div className="bg-white/80 p-6 rounded-xl border border-white/50">
              <div className="text-3xl mb-3">📄</div>
              <span className="text-teal-600 font-semibold block mb-2">সমতল রাখুন</span>
              <p className="text-gray-700 text-sm">প্রেসক্রিপশন সমতল রেখে ছবি তুলুন, কোনো ভাঁজ না রেখে</p>
            </div>
            <div className="bg-white/80 p-6 rounded-xl border border-white/50">
              <div className="text-3xl mb-3">🔍</div>
              <span className="text-cyan-600 font-semibold block mb-2">সম্পূর্ণ ফ্রেম</span>
              <p className="text-gray-700 text-sm">পুরো প্রেসক্রিপশন ফ্রেমে রাখুন, কোনো অংশ বাদ না দিয়ে</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
