import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini AI with environment variable (server-side only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { text, analysisType, documentType } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Enhanced medical analysis prompt for MediLens Advanced System
    const prompt = `
    You are MediLens AI - Bangladesh's most advanced medical prescription analysis system. You are trained on 500,000+ medical documents and specialize in Bengali medical terminology with state-of-the-art OCR text correction.
    
    DOCUMENT TYPE: ${documentType || 'prescription'}
    TEXT TO ANALYZE:
    "${text}"

    ADVANCED MEDICAL INTELLIGENCE FRAMEWORK:

    🏥 **DISEASES/CONDITIONS ANALYSIS** (রোগ নির্ণয়):
       - Detect all medical conditions, diseases, and diagnoses
       - Recognize abbreviated forms (DM=Diabetes, HTN=Hypertension, IHD=Ischemic Heart Disease)
       - Cross-reference symptoms with likely conditions
       - Provide detailed Bengali explanations with severity assessment
       - Include ICD-10 codes where applicable

    🧪 **LABORATORY & INVESTIGATIONS** (পরীক্ষা-নিরীক্ষা):
       - Extract all lab tests (CBC, RBS, HbA1c, lipid profile, TSH, etc.)
       - Identify imaging studies (X-ray, USG, CT, MRI, ECG, Echo)
       - Parse test results with normal/abnormal interpretation
       - Recommend follow-up investigations based on findings
       - Provide Bengali explanations for each test

    💊 **ADVANCED MEDICATION ANALYSIS** (ওষুধ বিশ্লেষণ):
       - Smart OCR correction for garbled medicine names
       - Brand name → Generic name mapping for Bangladesh market
       - Dosage strength extraction with unit standardization
       - Frequency parsing (1+0+1, BD, TDS, PRN, SOS patterns)
       - Drug interaction checking and safety warnings
       - Purpose, mechanism, and side effects in Bengali
       - Cost-effective alternatives suggestion

    🔬 **CLINICAL CORRELATION ENGINE**:
       - Match medications to diagnosed conditions
       - Identify missing treatments for diagnosed conditions
       - Detect polypharmacy risks and contraindications
       - Assess treatment completeness and appropriateness
       - Generate differential diagnosis from medication patterns

    📊 **COMPREHENSIVE HEALTH ASSESSMENT**:
       - Vital signs analysis and trends
       - Risk stratification for chronic diseases
       - Lifestyle modification recommendations
       - Emergency red flags identification
       - Long-term health monitoring plan

    RESPONSE FORMAT (Structured JSON):
    {
      "documentInfo": {
        "type": "${documentType || 'prescription'}",
        "analysisTimestamp": "${new Date().toISOString()}",
        "textQuality": "excellent/good/fair/poor",
        "ocrConfidence": "percentage 0-100%",
        "languageDetected": "bengali/english/mixed"
      },
      
      "clinicalSummary": {
        "primaryDiagnosis": "Main condition identified",
        "secondaryDiagnoses": ["Additional conditions"],
        "clinicalPicture": "Overall health status assessment in Bengali",
        "prognosisOutlook": "Expected outcome and recovery timeline"
      },
      
      "diseases": [
        {
          "condition": "Medical condition name",
          "bangla": "রোগের বাংলা নাম",
          "icd10Code": "ICD-10 code if applicable",
          "severity": "mild/moderate/severe/critical",
          "confidence": "high/medium/low",
          "description": "Detailed explanation in Bengali",
          "riskFactors": ["Contributing factors"],
          "complications": ["Potential complications"],
          "prognosis": "Expected outcome"
        }
      ],
      
      "investigations": [
        {
          "test": "Investigation name",
          "bangla": "পরীক্ষার বাংলা নাম",
          "category": "blood/urine/imaging/cardiac/other",
          "result": "Test result if mentioned",
          "normalRange": "Reference range",
          "interpretation": "Clinical significance",
          "urgency": "routine/urgent/stat",
          "cost": "Approximate cost in BDT",
          "preparation": "Pre-test preparation needed"
        }
      ],
      
      "medications": [
        {
          "prescribedName": "Name as written in prescription",
          "correctedName": "OCR-corrected name",
          "genericName": "Generic/scientific name",
          "brandName": "Common brand name in Bangladesh",
          "bangla": "ওষুধের বাংলা নাম",
          "strength": "Dosage strength with units",
          "formulation": "tablet/capsule/syrup/injection",
          "frequency": "How often to take",
          "timing": "AC/PC/HS/empty stomach",
          "duration": "Treatment duration",
          "totalQuantity": "Total amount needed",
          "purpose": "What this treats (Bengali)",
          "mechanism": "How it works (Bengali)",
          "sideEffects": "Common side effects (Bengali)",
          "contraindications": "When not to use (Bengali)",
          "interactions": "Drug interactions to avoid",
          "instructions": "Special instructions (Bengali)",
          "alternatives": "Cheaper generic alternatives",
          "importance": "critical/important/supportive",
          "confidence": "high/medium/low"
        }
      ],
      
      "symptoms": [
        {
          "symptom": "Symptom mentioned",
          "bangla": "উপসর্গের বাংলা",
          "severity": "mild/moderate/severe",
          "duration": "How long present",
          "frequency": "How often occurs",
          "associatedCondition": "Which disease causes this"
        }
      ],
      
      "patientProfile": {
        "name": "Patient name if found",
        "age": "Age with category (child/adult/elderly)",
        "gender": "Male/Female",
        "weight": "Weight if mentioned",
        "height": "Height if mentioned", 
        "bmi": "BMI calculation if possible",
        "allergies": "Known allergies",
        "chronicConditions": "Long-term diseases",
        "riskCategory": "low/moderate/high risk patient"
      },
      
      "vitalSigns": {
        "bloodPressure": "Systolic/Diastolic with interpretation",
        "pulse": "Heart rate with rhythm",
        "temperature": "Body temperature",
        "respiratoryRate": "Breathing rate",
        "oxygenSaturation": "SpO2 level",
        "bloodSugar": "Glucose levels"
      },
      
      "comprehensiveReport": "Complete medical analysis in Bengali covering:\n1. স্বাস্থ্য অবস্থার সারসংক্ষেপ\n2. নির্ণীত রোগসমূহ\n3. প্রয়োজনীয় পরীক্ষা-নিরীক্ষা\n4. ওষুধের বিস্তারিত তালিকা\n5. জীবনযাত্রার পরামর্শ\n6. খাদ্যাভ্যাস নির্দেশনা\n7. ব্যায়াম ও শারীরিক কার্যকলাপ\n8. মানসিক স্বাস্থ্য সহায়তা\n9. ফলো-আপ পরিকল্পনা\n10. জরুরি অবস্থার লক্ষণ",
      
      "treatmentPlan": {
        "immediate": "Immediate treatment priorities",
        "shortTerm": "1-4 weeks treatment plan",
        "longTerm": "Long-term management strategy",
        "goals": "Treatment objectives",
        "monitoring": "What to track and when"
      },
      
      "safetyAlerts": [
        "Critical drug interactions",
        "Overdose warnings", 
        "Emergency symptoms to watch for",
        "When to stop medication immediately"
      ],
      
      "healthEducation": "Detailed patient education in Bengali about:\n- Disease understanding\n- Treatment importance\n- Lifestyle modifications\n- Prevention strategies\n- Self-monitoring techniques",
      
      "followUpProtocol": {
        "nextVisit": "When to see doctor again",
        "testSchedule": "When to repeat investigations",
        "emergencyContacts": "When to seek immediate help",
        "monitoringParameters": "What to track at home"
      },
      
      "emergencyGuidance": "Critical warning signs requiring immediate medical attention (Bengali)",
      
      "costAnalysis": {
        "medicationCost": "Estimated monthly medicine cost",
        "testCost": "Investigation costs",
        "genericAlternatives": "Money-saving options",
        "totalTreatmentCost": "Overall treatment expense"
      },
      
      "qualityMetrics": {
        "analysisCompleteness": "percentage",
        "clinicalAccuracy": "confidence score", 
        "ocrReliability": "text recognition quality",
        "recommendationStrength": "evidence level"
      }
    }

    CRITICAL INTELLIGENCE FEATURES:
    - Advanced OCR error correction for Bengali medical terms
    - Drug interaction checking with severity levels
    - Cost-effective treatment alternatives
    - Emergency symptom recognition
    - Chronic disease management protocols
    - Patient education in simple Bengali
    - Follow-up scheduling optimization
    - Risk stratification algorithms
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // Try to parse JSON response
    let analysis
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const rawAnalysis = JSON.parse(jsonMatch[0])
        
        // Transform the response to match our display format
        analysis = {
          textQuality: rawAnalysis.textQuality || 'unknown',
          confidenceScore: rawAnalysis.confidenceScore || 'Unknown',
          diseases: rawAnalysis.diseases || [],
          medications: rawAnalysis.medications || [],
          investigations: rawAnalysis.investigations || [],
          symptoms: rawAnalysis.symptoms || [],
          patientInfo: rawAnalysis.patientInfo || {},
          vitalSigns: rawAnalysis.vitalSigns || {},
          summary: rawAnalysis.comprehensiveSummary || 'প্রেসক্রিপশন বিশ্লেষণ সম্পূর্ণ করা যায়নি।',
          warnings: rawAnalysis.warnings || ['চিকিৎসকের পরামর্শ অনুযায়ী ওষুধ সেবন করুন'],
          healthEducation: rawAnalysis.healthEducation || '',
          followUpPlan: rawAnalysis.followUpPlan || '',
          emergencyInstructions: rawAnalysis.emergencyInstructions || '',
          originalTextAnalysis: rawAnalysis.originalTextAnalysis || '',
          analysisSource: 'gemini-enhanced-v2'
        }
      } else {
        // Fallback: create structured response from text
        analysis = {
          textQuality: 'poor',
          summary: analysisText || 'প্রেসক্রিপশন বিশ্লেষণে সমস্যা হয়েছে।',
          medications: [],
          diagnosis: [],
          symptoms: [],
          investigations: [],
          patientInfo: {},
          vitalSigns: {},
          warnings: ['এই প্রেসক্রিপশনটি স্পষ্ট নয়। দয়া করে চিকিৎসকের সাথে পরামর্শ করুন।'],
          analysisSource: 'gemini-fallback'
        }
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Enhanced fallback response for garbled text
      analysis = {
        textQuality: 'very poor',
        summary: `প্রেসক্রিপশন বিশ্লেষণ:\n\nএই প্রেসক্রিপশনের টেক্সট স্পষ্ট নয় বা ক্ষতিগ্রস্ত। সম্ভাব্য কারণ:\n• ছবির গুণমান খারাপ\n• হাতের লেখা অস্পষ্ট\n• স্ক্যান/ফটোকপির সমস্যা\n\n🚨 গুরুত্বপূর্ণ নির্দেশনা:\n• এই প্রেসক্রিপশন অনুযায়ী ওষুধ খাবেন না\n• মূল প্রেসক্রিপশন নিয়ে চিকিৎসকের কাছে যান\n• স্পষ্ট ছবি তুলে আবার চেষ্টা করুন\n\n💡 উন্নত ফলাফলের জন্য:\n• উজ্জ্বল আলোতে ছবি তুলুন\n• ক্যামেরা সোজা রাখুন\n• প্রেসক্রিপশনটি সমতল রাখুন`,
        medications: [],
        diagnosis: [],
        symptoms: [],
        investigations: [],
        patientInfo: {},
        vitalSigns: {},
        warnings: [
          'এই প্রেসক্রিপশনের টেক্সট পড়া যাচ্ছে না',
          'মূল প্রেসক্রিপশন নিয়ে চিকিৎসকের কাছে যান',
          'স্পষ্ট ছবি তুলে আবার চেষ্টা করুন'
        ],
        analysisSource: 'error-fallback'
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      rawResponse: analysisText
    })

  } catch (error) {
    console.error('Gemini analysis error:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message
    }, { status: 500 })
  }
}
