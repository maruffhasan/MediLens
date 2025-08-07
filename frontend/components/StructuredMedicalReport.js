import React from 'react'
import { motion } from 'framer-motion'

const MedicalReportDisplay = ({ analysisData }) => {
  if (!analysisData) return null

  const {
    diseases = [],
    investigations = [],
    medications = [],
    symptoms = [],
    patientInfo = {},
    vitalSigns = {},
    summary = '',
    warnings = [],
    healthEducation = '',
    followUpPlan = '',
    emergencyInstructions = '',
    confidenceScore = 'Unknown'
  } = analysisData

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Confidence Score */}
      <motion.div 
        className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-2">📋 প্রেসক্রিপশন বিশ্লেষণ রিপোর্ট</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">বিশ্লেষণের নির্ভুলতা:</span>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="font-semibold">{confidenceScore}</span>
          </div>
        </div>
      </motion.div>

      {/* Patient Information */}
      {Object.keys(patientInfo).length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            👤 রোগীর তথ্য
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientInfo.name && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">নাম:</span>
                <p className="font-medium">{patientInfo.name}</p>
              </div>
            )}
            {patientInfo.age && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">বয়স:</span>
                <p className="font-medium">{patientInfo.age}</p>
              </div>
            )}
            {patientInfo.gender && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">লিঙ্গ:</span>
                <p className="font-medium">{patientInfo.gender}</p>
              </div>
            )}
            {patientInfo.weight && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">ওজন:</span>
                <p className="font-medium">{patientInfo.weight}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Diseases/Conditions */}
      {diseases.length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏥 রোগ নির্ণয়
          </h3>
          <div className="space-y-4">
            {diseases.map((disease, index) => (
              <div key={index} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{disease.bangla || disease.condition}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    disease.confidence === 'high' ? 'bg-green-100 text-green-800' :
                    disease.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {disease.confidence === 'high' ? 'উচ্চ নিশ্চিততা' :
                     disease.confidence === 'medium' ? 'মাঝারি নিশ্চিততা' : 'কম নিশ্চিততা'}
                  </span>
                </div>
                {disease.description && (
                  <p className="text-gray-700 text-sm">{disease.description}</p>
                )}
                {disease.reasoning && (
                  <p className="text-gray-600 text-xs mt-2">কারণ: {disease.reasoning}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Required Tests */}
      {investigations.length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🧪 প্রয়োজনীয় পরীক্ষা
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investigations.map((test, index) => (
              <div key={index} className="border border-blue-200 bg-blue-50 p-4 rounded">
                <h4 className="font-semibold text-blue-800">{test.bangla || test.test}</h4>
                {test.result && (
                  <p className="text-sm text-gray-700 mt-1">ফলাফল: {test.result}</p>
                )}
                {test.normalRange && (
                  <p className="text-xs text-gray-600 mt-1">স্বাভাবিক মাত্রা: {test.normalRange}</p>
                )}
                {test.interpretation && (
                  <p className="text-sm text-blue-700 mt-2">{test.interpretation}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Medications */}
      {medications.length > 0 && (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💊 নির্ধারিত ওষুধসমূহ
          </h3>
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="border border-green-200 bg-green-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-green-800">
                    {med.bangla || med.name}
                    {med.strength && <span className="text-sm ml-2">({med.strength})</span>}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    med.confidence === 'high' ? 'bg-green-100 text-green-800' :
                    med.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {med.confidence === 'high' ? 'নিশ্চিত' :
                     med.confidence === 'medium' ? 'সম্ভাব্য' : 'অনিশ্চিত'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {med.frequency && (
                    <div>
                      <span className="text-gray-600">সেবনবিধি:</span>
                      <p className="font-medium">{med.frequency}</p>
                    </div>
                  )}
                  {med.timing && (
                    <div>
                      <span className="text-gray-600">সময়:</span>
                      <p className="font-medium">{med.timing}</p>
                    </div>
                  )}
                  {med.duration && (
                    <div>
                      <span className="text-gray-600">মেয়াদ:</span>
                      <p className="font-medium">{med.duration}</p>
                    </div>
                  )}
                  {med.purpose && (
                    <div>
                      <span className="text-gray-600">কাজ:</span>
                      <p className="font-medium">{med.purpose}</p>
                    </div>
                  )}
                </div>
                
                {med.instructions && (
                  <div className="mt-3 p-3 bg-blue-100 rounded">
                    <span className="text-blue-800 font-medium">বিশেষ নির্দেশনা:</span>
                    <p className="text-blue-700 text-sm mt-1">{med.instructions}</p>
                  </div>
                )}
                
                {med.sideEffects && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded">
                    <span className="text-yellow-800 font-medium">পার্শ্বপ্রতিক্রিয়া:</span>
                    <p className="text-yellow-700 text-sm mt-1">{med.sideEffects}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {summary && (
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📝 সারসংক্ষেপ
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{summary}</p>
          </div>
        </motion.div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-lg p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
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

      {/* Emergency Instructions */}
      {emergencyInstructions && (
        <motion.div 
          className="bg-orange-50 border border-orange-200 rounded-lg p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            🚨 জরুরি নির্দেশনা
          </h3>
          <p className="text-orange-700 whitespace-pre-line">{emergencyInstructions}</p>
        </motion.div>
      )}

      {/* Health Education */}
      {healthEducation && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            📚 স্বাস্থ্য শিক্ষা
          </h3>
          <p className="text-blue-700 whitespace-pre-line">{healthEducation}</p>
        </motion.div>
      )}

      {/* Follow-up Plan */}
      {followUpPlan && (
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            📅 ফলো-আপ পরিকল্পনা
          </h3>
          <p className="text-green-700 whitespace-pre-line">{followUpPlan}</p>
        </motion.div>
      )}
    </div>
  )
}

export default MedicalReportDisplay
