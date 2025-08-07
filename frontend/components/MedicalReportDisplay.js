import React, { useState, useEffect } from 'react';
import { AlertCircle, Heart, Stethoscope, FileText, Info, Pill, TestTube, Shield, Clock, UserCheck } from 'lucide-react';

const MedicalReportDisplay = ({ reportData, fileName = "Medical Report" }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [reportData]);

  if (!reportData) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">কোন রিপোর্ট ডেটা পাওয়া যায়নি</p>
      </div>
    );
  }

  const {
    রোগীর_তথ্য,
    রোগ_নির্ণয়,
    ওষুধের_তালিকা,
    পরীক্ষা_নিরীক্ষা,
    চিকিৎসা_পরামর্শ,
    জরুরি_তথ্য,
    চিকিৎসা_পরিভাষা
  } = reportData;

  return (
    <div className={`container mx-auto p-4 md:p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-green-50 transition-all duration-1000 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 মেডিকেল রিপোর্ট বিশ্লেষণ</h1>
        <p className="text-gray-600">AI ভিত্তিক প্রেসক্রিপশন বিশ্লেষণ - {fileName}</p>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {রোগীর_তথ্য?.শিরোনাম || "রোগীর তথ্য"}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p><span className="font-semibold text-blue-600">নাম:</span> {রোগীর_তথ্য?.নাম || "তথ্য পাওয়া যায়নি"}</p>
              <p><span className="font-semibold text-blue-600">বয়স:</span> {রোগীর_তথ্য?.বয়স || "তথ্য পাওয়া যায়নি"}</p>
              <p><span className="font-semibold text-blue-600">লিঙ্গ:</span> {রোগীর_তথ্য?.লিঙ্গ || "তথ্য পাওয়া যায়নি"}</p>
            </div>
            <div className="space-y-3">
              <p><span className="font-semibold text-blue-600">তারিখ:</span> {রোগীর_তথ্য?.তারিখ || "তথ্য পাওয়া যায়নি"}</p>
              <p><span className="font-semibold text-blue-600">ডাক্তার:</span> {রোগীর_তথ্য?.ডাক্তারের_নাম || "তথ্য পাওয়া যায়নি"}</p>
              <p><span className="font-semibold text-blue-600">হাসপাতাল:</span> {রোগীর_তথ্য?.হাসপাতাল || "তথ্য পাওয়া যায়নি"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Diagnosis */}
      <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {রোগ_নির্ণয়?.শিরোনাম || "রোগ নির্ণয়"}
            </h2>
          </div>
        </div>
        <div className="p-6">
          {রোগ_নির্ণয়?.প্রধান_রোগ?.length > 0 ? (
            <div className="space-y-4">
              {রোগ_নির্ণয়.প্রধান_রোগ.map((disease, index) => (
                <div key={index} className={`p-4 rounded-lg ${disease.গুরুত্ব === 'high' ? 'bg-red-50 border border-red-200' : disease.গুরুত্ব === 'medium' ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{disease.রোগের_নাম}</h3>
                      <p className="text-blue-600 text-sm mb-2">{disease.বাংলা_নাম}</p>
                      <p className="text-gray-600 text-sm">{disease.ব্যাখ্যা}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      disease.গুরুত্ব === 'high' ? 'bg-red-100 text-red-800' : 
                      disease.গুরুত্ব === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {disease.গুরুত্ব === 'high' ? 'উচ্চ' : disease.গুরুত্ব === 'medium' ? 'মাঝারি' : 'কম'} গুরুত্ব
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">রোগ নির্ণয়ের তথ্য পাওয়া যায়নি</p>
          )}

          {রোগ_নির্ণয়?.লক্ষণসমূহ?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">লক্ষণসমূহ:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {রোগ_নির্ণয়.লক্ষণসমূহ.map((symptom, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-700">{symptom.লক্ষণ}</p>
                    <p className="text-sm text-gray-600 mt-1">{symptom.বিবরণ}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medications */}
      <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4">
          <div className="flex items-center gap-3">
            <Pill className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">ওষুধের তালিকা</h2>
          </div>
        </div>
        <div className="p-6">
          {ওষুধের_তালিকা?.length > 0 ? (
            <div className="space-y-4">
              {ওষুধের_তালিকা.map((medicine, index) => (
                <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-green-800 text-lg">{medicine.ওষুধের_নাম}</h3>
                      <p className="text-green-600 text-sm mb-2">{medicine.জেনেরিক_নাম}</p>
                      <p className="text-gray-700"><span className="font-semibold">শক্তি:</span> {medicine.শক্তি}</p>
                      <p className="text-gray-700"><span className="font-semibold">কাজ:</span> {medicine.কাজ}</p>
                    </div>
                    <div>
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-semibold text-gray-800 mb-2">🕐 সেবনবিধি:</h4>
                        <p className="text-sm"><span className="font-medium">নিয়ম:</span> {medicine.সেবনবিধি}</p>
                        <p className="text-sm"><span className="font-medium">সময়:</span> {medicine.সময়}</p>
                        <p className="text-sm"><span className="font-medium">কতদিন:</span> {medicine.কতদিন}</p>
                      </div>
                    </div>
                  </div>
                  
                  {medicine.পার্শ্বপ্রতিক্রিয়া && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm"><span className="font-semibold text-yellow-800">⚠️ পার্শ্বপ্রতিক্রিয়া:</span> {medicine.পার্শ্বপ্রতিক্রিয়া}</p>
                    </div>
                  )}
                  
                  {medicine.সতর্কতা && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm"><span className="font-semibold text-red-800">🛡️ সতর্কতা:</span> {medicine.সতর্কতা}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">ওষুধের তথ্য পাওয়া যায়নি</p>
          )}
        </div>
      </div>

      {/* Medical Tests */}
      {পরীক্ষা_নিরীক্ষা?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
            <div className="flex items-center gap-3">
              <TestTube className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">পরীক্ষা নিরীক্ষা</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {পরীক্ষা_নিরীক্ষা.map((test, index) => (
                <div key={index} className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h3 className="font-bold text-purple-800">{test.পরীক্ষার_নাম}</h3>
                  <p className="text-purple-600 text-sm mb-2">{test.বাংলা_নাম}</p>
                  <p className="text-gray-700 text-sm mb-2">{test.কেন_করতে_হবে}</p>
                  {test.প্রস্তুতি && (
                    <p className="text-sm"><span className="font-semibold text-purple-700">প্রস্তুতি:</span> {test.প্রস্তুতি}</p>
                  )}
                  {test.খরচ && (
                    <p className="text-sm"><span className="font-semibold text-purple-700">আনুমানিক খরচ:</span> {test.খরচ}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medical Advice */}
      {চিকিৎসা_পরামর্শ && (
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">চিকিৎসা পরামর্শ</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {চিকিৎসা_পরামর্শ.জীবনযাত্রা?.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">🏃‍♂️ জীবনযাত্রা:</h4>
                <ul className="space-y-1">
                  {চিকিৎসা_পরামর্শ.জীবনযাত্রা.map((advice, index) => (
                    <li key={index} className="text-sm text-gray-700">• {advice}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {চিকিৎসা_পরামর্শ.খাদ্যাভ্যাস?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🍎 খাদ্যাভ্যাস:</h4>
                <ul className="space-y-1">
                  {চিকিৎসা_পরামর্শ.খাদ্যাভ্যাস.map((advice, index) => (
                    <li key={index} className="text-sm text-gray-700">• {advice}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {চিকিৎসা_পরামর্শ.সতর্কতা?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ সতর্কতা:</h4>
                <ul className="space-y-1">
                  {চিকিৎসা_পরামর্শ.সতর্কতা.map((warning, index) => (
                    <li key={index} className="text-sm text-gray-700">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {চিকিৎসা_পরামর্শ.ফলোআপ && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📅 ফলোআপ:</h4>
                <p className="text-sm text-gray-700">{চিকিৎসা_পরামর্শ.ফলোআপ}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Information */}
      {জরুরি_তথ্য?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">🚨 জরুরি তথ্য</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {জরুরি_তথ্য.map((info, index) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">{info.তথ্য}</h4>
                  <p className="text-red-700 text-sm mb-2"><span className="font-semibold">কারণ:</span> {info.কারণ}</p>
                  <div className="p-3 bg-red-100 rounded border border-red-300">
                    <p className="text-sm font-semibold text-red-900">🆘 করণীয়: {info.করণীয়}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Medical Terms */}
      {চিকিৎসা_পরিভাষা?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">📚 চিকিৎসা পরিভাষা</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {চিকিৎসা_পরিভাষা.map((term, index) => (
                <div key={index} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-bold text-indigo-800">{term.ইংরেজি_শব্দ}</h4>
                  <p className="text-indigo-600 font-medium mb-1">{term.বাংলা_অর্থ}</p>
                  <p className="text-gray-700 text-sm">{term.ব্যাখ্যা}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          ⚕️ এই বিশ্লেষণ তথ্যমূলক উদ্দেশ্যে প্রদান করা হয়েছে। চিকিৎসার জন্য অভিজ্ঞ ডাক্তারের পরামর্শ নিন।
        </p>
        <p className="text-xs text-gray-400 mt-2">
          MediLens AI Medical Analysis System | Powered by Gemini AI
        </p>
      </div>
    </div>
  );
};

export default MedicalReportDisplay;
