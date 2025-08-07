import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini AI with environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const ENHANCED_MEDICAL_PROMPT = `You are an expert medical AI assistant specializing in Bengali medical communication and prescription analysis. 
When analyzing medical documents or OCR text from prescriptions, ALWAYS respond with a valid JSON object in this exact structure:

{
  "রোগীর_তথ্য": {
    "শিরোনাম": "রোগীর বিবরণ",
    "নাম": "রোগীর নাম (যদি পাওয়া যায়)",
    "বয়স": "রোগীর বয়স (যদি পাওয়া যায়)",
    "লিঙ্গ": "রোগীর লিঙ্গ (যদি পাওয়া যায়)",
    "তারিখ": "প্রেসক্রিপশনের তারিখ",
    "ডাক্তারের_নাম": "চিকিৎসকের নাম",
    "হাসপাতাল": "হাসপাতাল/ক্লিনিকের নাম"
  },
  "রোগ_নির্ণয়": {
    "শিরোনাম": "রোগ নির্ণয় ও লক্ষণ",
    "প্রধান_রোগ": [
      {
        "রোগের_নাম": "রোগের নাম",
        "বাংলা_নাম": "বাংলায় রোগের নাম",
        "ব্যাখ্যা": "রোগ সম্পর্কে বিস্তারিত ব্যাখ্যা",
        "গুরুত্ব": "high/medium/low"
      }
    ],
    "লক্ষণসমূহ": [
      {
        "লক্ষণ": "লক্ষণের নাম",
        "বিবরণ": "লক্ষণের বিস্তারিত বিবরণ"
      }
    ]
  },
  "ওষুধের_তালিকা": [
    {
      "ওষুধের_নাম": "ওষুধের নাম",
      "জেনেরিক_নাম": "জেনেরিক নাম",
      "শক্তি": "ওষুধের শক্তি (mg/ml)",
      "সেবনবিধি": "সেবনের নিয়ম (1+1+1, BD, TDS ইত্যাদি)",
      "সময়": "খাবারের আগে/পরে",
      "কতদিন": "কত দিন সেবন করতে হবে",
      "কাজ": "এই ওষুধ কি কাজে ব্যবহৃত হয়",
      "পার্শ্বপ্রতিক্রিয়া": "সম্ভাব্য পার্শ্বপ্রতিক্রিয়া",
      "সতর্কতা": "বিশেষ সতর্কতা (যদি থাকে)"
    }
  ],
  "পরীক্ষা_নিরীক্ষা": [
    {
      "পরীক্ষার_নাম": "পরীক্ষার নাম",
      "বাংলা_নাম": "বাংলায় পরীক্ষার নাম", 
      "কেন_করতে_হবে": "এই পরীক্ষা কেন প্রয়োজন",
      "প্রস্তুতি": "পরীক্ষার আগে কি করতে হবে",
      "খরচ": "আনুমানিক খরচ (যদি জানা থাকে)"
    }
  ],
  "চিকিৎসা_পরামর্শ": {
    "জীবনযাত্রা": [
      "জীবনযাত্রায় পরিবর্তনের পরামর্শ"
    ],
    "খাদ্যাভ্যাস": [
      "খাদ্য সংক্রান্ত পরামর্শ"
    ],
    "সতর্কতা": [
      "বিশেষ সতর্কতা"
    ],
    "ফলোআপ": "পরবর্তী ভিজিটের তারিখ বা নির্দেশনা"
  },
  "জরুরি_তথ্য": [
    {
      "তথ্য": "গুরুত্বপূর্ণ তথ্য",
      "কারণ": "কেন এটি গুরুত্বপূর্ণ",
      "করণীয়": "এই ক্ষেত্রে কি করতে হবে"
    }
  ],
  "চিকিৎসা_পরিভাষা": [
    {
      "ইংরেজি_শব্দ": "ইংরেজি মেডিকেল টার্ম",
      "বাংলা_অর্থ": "বাংলায় অর্থ",
      "ব্যাখ্যা": "বিস্তারিত ব্যাখ্যা"
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Extract information from OCR text even if it's garbled or unclear
2. If information is missing, use "তথ্য পাওয়া যায়নি" or provide general guidance
3. Focus on patient safety - always recommend consulting doctor for unclear prescriptions
4. Provide comprehensive Bengali explanations for all medical terms
5. Include dosage, timing, and safety information for all medications
6. ALWAYS return valid JSON format - no additional text outside JSON
7. Be thorough in analysis but concise in explanations`;

export async function POST(request) {
  try {
    const { text, imageData } = await request.json()

    if (!text && !imageData) {
      return NextResponse.json({ error: 'No text or image provided' }, { status: 400 })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-002'
    })

    let analysisPrompt = ENHANCED_MEDICAL_PROMPT + `\n\nAnalyze this medical text/prescription: "${text}"`

    // If image data is provided, include it in the analysis
    if (imageData) {
      analysisPrompt += `\n\nImage data is also provided for additional context.`
    }

    const result = await model.generateContent(analysisPrompt)
    const response = await result.response
    const analysisText = response.text()

    // Parse JSON response
    let analysis
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/```json\s*(.*?)\s*```/s) || 
                       analysisText.match(/\{[\s\S]*\}/) ||
                       [null, analysisText]
      
      if (jsonMatch && jsonMatch[1]) {
        analysis = JSON.parse(jsonMatch[1])
      } else {
        // Try parsing the entire response as JSON
        analysis = JSON.parse(analysisText)
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // Fallback response
      analysis = {
        "রোগীর_তথ্য": {
          "শিরোনাম": "প্রেসক্রিপশন বিশ্লেষণে সমস্যা",
          "নাম": "তথ্য পাওয়া যায়নি",
          "বয়স": "তথ্য পাওয়া যায়নি",
          "তারিখ": "তথ্য পাওয়া যায়নি"
        },
        "রোগ_নির্ণয়": {
          "শিরোনাম": "রোগ নির্ণয়",
          "প্রধান_রোগ": [{
            "রোগের_নাম": "স্পষ্ট নয়",
            "বাংলা_নাম": "প্রেসক্রিপশন থেকে রোগ নির্ণয় করা যায়নি",
            "ব্যাখ্যা": "প্রেসক্রিপশনের টেক্সট স্পষ্ট নয়। দয়া করে চিকিৎসকের সাথে পরামর্শ করুন।",
            "গুরুত্ব": "high"
          }]
        },
        "ওষুধের_তালিকা": [],
        "পরীক্ষা_নিরীক্ষা": [],
        "চিকিৎসা_পরামর্শ": {
          "সতর্কতা": [
            "এই প্রেসক্রিপশন স্পষ্ট নয়",
            "মূল প্রেসক্রিপশন নিয়ে চিকিৎসকের কাছে যান",
            "নিজে নিজে ওষুধ সেবন করবেন না"
          ]
        },
        "জরুরি_তথ্য": [{
          "তথ্য": "প্রেসক্রিপশন বিশ্লেষণ করা যায়নি",
          "কারণ": "OCR টেক্সট স্পষ্ট নয় বা ক্ষতিগ্রস্ত",
          "করণীয়": "চিকিৎসকের সাথে সরাসরি যোগাযোগ করুন"
        }]
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      rawResponse: analysisText
    })

  } catch (error) {
    console.error('Medical analysis error:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message
    }, { status: 500 })
  }
}
