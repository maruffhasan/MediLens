'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const messagesEndRef = useRef(null)
  const { currentUser, getToken } = useAuth()
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentUser) {
      initializeChat()
    }
  }, [currentUser])

  const initializeChat = async () => {
    try {
      setLoading(true)
      await loadChatHistory()
      
      // Start with welcome message if no chat history
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome-' + Date.now(),
          type: 'bot',
          content: 'আসসালামু আলাইকুম! আমি MediLens এর AI সহায়ক। আপনার স্বাস্থ্য, প্রেসক্রিপশন বা মেডিক্যাল প্রশ্ন করুন। আমি বাংলায় বিস্তারিত উত্তর দিতে পারি। 🏥💊',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatHistory = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/user/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chats = await response.json()
        setChatHistory(chats)
        
        // If there are existing chats, load the most recent one
        if (chats.length > 0) {
          const latestChat = chats[0]
          setSelectedChatId(latestChat.id)
          await loadChatMessages(latestChat.id)
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const loadChatMessages = async (chatId) => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const chatData = await response.json()
        const formattedMessages = chatData.messages?.map(msg => ({
          id: msg.id,
          type: msg.chatRole === 'USER' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt)
        })) || []
        
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'নতুন চ্যাট - ' + new Date().toLocaleDateString('bn-BD')
        }),
      })

      if (response.ok) {
        const newChat = await response.json()
        setSelectedChatId(newChat.id)
        setMessages([{
          id: 'welcome-' + Date.now(),
          type: 'bot',
          content: 'নতুন চ্যাট শুরু হয়েছে। আপনার স্বাস্থ্য বিষয়ক যেকোনো প্রশ্ন করুন! 🩺',
          timestamp: new Date()
        }])
        await loadChatHistory()
        return newChat.id
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
    return null
  }

  const sendMessageToBackend = async (message, chatId) => {
    try {
      const token = getToken()
      
      // First try the enhanced medical AI
      const medicalAIResponse = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        })
      })

      if (medicalAIResponse.ok) {
        const aiResult = await medicalAIResponse.json()
        if (aiResult.success && aiResult.analysis) {
          // Format the structured analysis as readable text
          const analysis = aiResult.analysis
          let formattedResponse = `🩺 **মেডিকেল বিশ্লেষণ:**\n\n`
          
          // Patient Info
          if (analysis.রোগীর_তথ্য) {
            formattedResponse += `👤 **রোগীর তথ্য:**\n${analysis.রোগীর_তথ্য.শিরোনাম || 'তথ্য পাওয়া যায়নি'}\n\n`
          }
          
          // Diagnosis
          if (analysis.রোগ_নির্ণয়?.প্রধান_রোগ?.length > 0) {
            formattedResponse += `🔍 **রোগ নির্ণয়:**\n`
            analysis.রোগ_নির্ণয়.প্রধান_রোগ.forEach((disease, index) => {
              formattedResponse += `${index + 1}. ${disease.রোগের_নাম} (${disease.বাংলা_নাম})\n   ${disease.ব্যাখ্যা}\n\n`
            })
          }
          
          // Medications
          if (analysis.ওষুধের_তালিকা?.length > 0) {
            formattedResponse += `💊 **ওষুধের তালিকা:**\n`
            analysis.ওষুধের_তালিকা.forEach((medicine, index) => {
              formattedResponse += `${index + 1}. **${medicine.ওষুধের_নাম}**\n`
              formattedResponse += `   📋 সেবনবিধি: ${medicine.সেবনবিধি} (${medicine.সময়})\n`
              formattedResponse += `   🎯 কাজ: ${medicine.কাজ}\n`
              if (medicine.সতর্কতা) {
                formattedResponse += `   ⚠️ সতর্কতা: ${medicine.সতর্কতা}\n`
              }
              formattedResponse += `\n`
            })
          }
          
          // Medical Advice
          if (analysis.চিকিৎসা_পরামর্শ) {
            formattedResponse += `📋 **চিকিৎসা পরামর্শ:**\n`
            if (analysis.চিকিৎসা_পরামর্শ.সতর্কতা?.length > 0) {
              formattedResponse += `⚠️ **সতর্কতা:**\n`
              analysis.চিকিৎসা_পরামর্শ.সতর্কতা.forEach(warning => {
                formattedResponse += `• ${warning}\n`
              })
            }
            formattedResponse += `\n`
          }
          
          // Emergency Info
          if (analysis.জরুরি_তথ্য?.length > 0) {
            formattedResponse += `🚨 **জরুরি তথ্য:**\n`
            analysis.জরুরি_তথ্য.forEach(info => {
              formattedResponse += `• ${info.তথ্য}\n  করণীয়: ${info.করণীয়}\n\n`
            })
          }
          
          formattedResponse += `\n💡 **দ্রষ্টব্য:** এই বিশ্লেষণ তথ্যমূলক উদ্দেশ্যে। চিকিৎসার জন্য অভিজ্ঞ ডাক্তারের পরামর্শ নিন।`
          
          // Save to backend chat history
          try {
            const messageData = {
              content: message,
              role: 'USER'
            }
            
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/chat/${chatId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(messageData),
            })
          } catch (backendError) {
            console.log('Backend chat save failed, continuing with AI response')
          }
          
          return formattedResponse
        }
      }
      
      // Fallback to local enhanced response
      return getEnhancedLocalResponse(message)
      
    } catch (error) {
      console.error('Error sending message:', error)
      return getEnhancedLocalResponse(message)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      let currentChatId = selectedChatId
      
      // Create new chat if none exists
      if (!currentChatId) {
        currentChatId = await createNewChat()
      }

      // Send message to backend and get AI response
      const botResponseContent = await sendMessageToBackend(currentMessage, currentChatId)
      
      const botResponse = {
        id: 'bot-' + Date.now(),
        type: 'bot',
        content: botResponseContent,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      
      // Refresh chat history to show updated conversation
      await loadChatHistory()
      
    } catch (error) {
      console.error('Error handling message:', error)
      
      // Fallback to local response
      const fallbackResponse = {
        id: 'bot-' + Date.now(),
        type: 'bot',
        content: 'দুঃখিত, আমি এখন সংযোগে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন। জরুরি অবস্থায় দ্রুত ডাক্তারের পরামর্শ নিন।',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const getEnhancedLocalResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Emergency detection
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
      'বুকে ব্যথা', 'শ্বাস নিতে কষ্ট', 'অজ্ঞান', 'রক্তক্ষরণ', 'heart attack', 'stroke'
    ]
    
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return `🚨 **জরুরি অবস্থা সনাক্ত করা হয়েছে!**

অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান বা জরুরি সেবায় কল করুন:
📞 ৯৯৯ (জাতীয় জরুরি সেবা)
📞 ১৬২৬৩ (ঢাকা মেডিকেল কলেজ)

🏥 **তাৎক্ষণিক করণীয়:**
• রোগীকে আরামদায়ক অবস্থানে রাখুন
• শ্বাস-প্রশ্বাসের দিকে নজর রাখুন  
• জ্ঞান হারালে পাশে শুইয়ে দিন
• কোনো ওষুধ না দিয়ে দ্রুত হাসপাতালে নিন

⚠️ **বিলম্ব করবেন না - জীবন ঝুঁকিতে থাকতে পারে!**`
    }
    
    // Enhanced medical responses
    if (lowerMessage.includes('fever') || lowerMessage.includes('জ্বর')) {
      return `🌡️ **জ্বরের সম্পূর্ণ চিকিৎসা:**

**তাৎক্ষণিক চিকিৎসা:**
• প্যারাসিটামল ৫০০ মিগ্রা - প্রতি ৬-৮ ঘন্টায় (সর্বোচ্চ দিনে ৪ বার)
• ইবুপ্রোফেন ৪০০ মিগ্রা - যদি প্যারাসিটামল কাজ না করে
• প্রচুর পানি, ডাবের পানি, স্যালাইন খান (দিনে ৩-৪ লিটার)

**ঘরোয়া চিকিৎসা:**
• কুসুম গরম পানিতে গোসল করুন
• হালকা সুতির কাপড় পরুন
• ঘর ঠান্ডা রাখুন, ফ্যান চালান
• বিশ্রাম নিন, কাজকর্ম বন্ধ রাখুন

**খাবার:**
• তরল খাবার বেশি খান
• ফলের রস, স্যুপ, খিচুড়ি
• মসলাদার ও ভাজাপোড়া এড়িয়ে চলুন

🚨 **ডাক্তার দেখান যদি:**
• জ্বর ১০৩°F (৩৯.৪°C) এর বেশি হয়
• ৩ দিনের বেশি স্থায়ী হয়
• শ্বাস কষ্ট, বুকে ব্যথা বা তীব্র মাথাব্যথা হয়
• বমি বা ডায়রিয়া সঙ্গে থাকে`
    }
    
    if (lowerMessage.includes('pressure') || lowerMessage.includes('রক্তচাপ') || lowerMessage.includes('hypertension')) {
      return `🩺 **উচ্চ রক্তচাপ সম্পূর্ণ ব্যবস্থাপনা:**

**ওষুধ ব্যবস্থাপনা:**
• নিয়মিত ওষুধ খান - কখনো বন্ধ করবেন না
• প্রতিদিন একই সময়ে খান
• ওষুধ শেষ হওয়ার আগেই নতুন নিন

**খাদ্য নিয়ন্ত্রণ:**
• লবণ কঠোরভাবে কমান (দিনে ৫ গ্রামের কম)
• প্রক্রিয়াজাত খাবার এড়িয়ে চলুন
• কলা, কমলা, পেঁপে, শাকসবজি বেশি খান
• মাছ, ডাল, বাদাম খান

**জীবনযাত্রা:**
• প্রতিদিন ৩০-৪৫ মিনিট দ্রুত হাঁটুন
• ওজন নিয়ন্ত্রণে রাখুন
• ধূমপান ও মদ্যপান সম্পূর্ণ ছাড়ুন
• মানসিক চাপ কমান - যোগব্যায়াম/মেডিটেশন

**নিয়মিত পরীক্ষা:**
• সপ্তাহে ২-৩ বার BP মাপুন
• মাসে ১ বার ডাক্তার দেখান
• বছরে ২ বার ECG ও রক্ত পরীক্ষা

📊 **লক্ষ্য:** ১৩০/৮০ mmHg এর নিচে রাখুন`
    }
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('ডায়াবেটিস') || lowerMessage.includes('sugar')) {
      return `🍎 **ডায়াবেটিস সম্পূর্ণ ব্যবস্থাপনা:**

**ওষুধ ব্যবস্থাপনা:**
• মেটফরমিন - খাবারের সাথে বা পরে খান
• ইনসুলিন - নির্ধারিত সময়ে নিন
• কখনো ওষুধ বাদ দেবেন না

**খাদ্য পরিকল্পনা:**
• চিনি, মিষ্টি, কোমল পানীয় সম্পূর্ণ বন্ধ
• ভাত কম, রুটি বেশি খান
• শাকসবজি, সালাদ প্রতি বেলায়
• ছোট প্লেটে খান, ধীরে ধীরে চিবিয়ে খান

**নিয়মিত ব্যায়াম:**
• প্রতিদিন ৪৫ মিনিট হাঁটুন
• খাবারের ৩০ মিনিট পর হাঁটুন
• সাইক্লিং, সাঁতার করতে পারেন

**নিয়মিত পরীক্ষা:**
• মাসে ২ বার রক্তের গ্লুকোজ
• ৩ মাসে ১ বার HbA1c (৭% এর নিচে)
• বছরে ২ বার চোখ ও কিডনি চেকআপ

🎯 **লক্ষ্য:** খালি পেটে ৫.৬-৭.০ mmol/L`
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('মাথাব্যথা')) {
      return `🧠 **মাথাব্যথার সম্পূর্ণ চিকিৎসা:**

**তাৎক্ষণিক চিকিৎসা:**
• প্যারাসিটামল ৫০০ মিগ্রা - ৬ ঘন্টা পর পর
• অন্ধকার ঘরে শুয়ে থাকুন
• মাথায় ঠান্ডা পানির পট্টি দিন
• ঘাড় ও কাঁধ মালিশ করুন

**কারণ অনুযায়ী চিকিৎসা:**
• **টেনশনের মাথাব্যথা:** রিলাক্সেশন, গভীর শ্বাস
• **মাইগ্রেইন:** অন্ধকার ঘরে বিশ্রাম, সুমাট্রিপটান
• **সাইনাসের মাথাব্যথা:** গরম পানির ভাপ নিন

**প্রতিরোধ:**
• পর্যাপ্ত পানি পান করুন (দিনে ৮-১০ গ্লাস)
• নিয়মিত খাবার খান, খালি পেটে থাকবেন না
• ৭-৮ ঘন্টা ঘুমান
• চোখের পাওয়ার চেক করান

🚨 **তাৎক্ষণিক ডাক্তার দেখান:**
• হঠাৎ তীব্র মাথাব্যথা
• জ্বর ও ঘাড় শক্ত হওয়া
• দৃষ্টি ঝাপসা বা কথা জড়িয়ে যাওয়া`
    }

    if (lowerMessage.includes('cough') || lowerMessage.includes('কাশি')) {
      return `😷 **কাশির সম্পূর্ণ চিকিৎসা:**

**ঘরোয়া চিকিৎসা:**
• মধু ১ চামচ + আদার রস ১ চামচ - দিনে ৩ বার
• কুসুম গরম পানিতে লবণ দিয়ে গড়গড়া
• তুলসী পাতার রস + মধু
• আদা-লেবু-মধুর চা

**ওষুধ:**
• শুকনো কাশি: ডেক্সট্রোমেথরফেন সিরাপ
• কফযুক্ত কাশি: ব্রোমহেক্সিন সিরাপ
• অ্যালার্জিক কাশি: সেটিরিজিন ১০ মিগ্রা

**জীবনযাত্রা:**
• প্রচুর তরল পান করুন
• ধূমপান ও ধুলাবালি এড়িয়ে চলুন
• হিউমিডিফায়ার ব্যবহার করুন
• মাথা উঁচু করে ঘুমান

🚨 **ডাক্তার দেখান যদি:**
• ২ সপ্তাহের বেশি কাশি
• কফের সাথে রক্ত
• শ্বাস কষ্ট বা বুকে ব্যথা
• জ্বর ও ওজন কমে যাওয়া`
    }

    if (lowerMessage.includes('stomach') || lowerMessage.includes('পেট') || lowerMessage.includes('acidity')) {
      return `🍽️ **পেটের সমস্যার সম্পূর্ণ সমাধান:**

**গ্যাস্ট্রিক/এসিডিটি:**
• ওমিপ্রাজল ২০ মিগ্রা - খালি পেটে সকালে
• র‍্যানিটিডিন ১৫০ মিগ্রা - রাতে খাবারের পর
• এন্টাসিড - খাবারের ১ ঘন্টা পর

**খাদ্যাভ্যাস:**
• অল্প অল্প করে ঘন ঘন খান (দিনে ৫-৬ বার)
• তেল-মসলা, ভাজাপোড়া এড়িয়ে চলুন
• চা-কফি সীমিত করুন
• রাতে খাওয়ার ২-৩ ঘন্টা পর ঘুমান

**উপকারী খাবার:**
• দই, কলা, সিদ্ধ চাল
• ওটস, বার্লি, সবুজ শাকসবজি
• ক্যামোমাইল চা, পুদিনা পাতা

**জীবনযাত্রা:**
• নিয়মিত ব্যায়াম করুন
• মানসিক চাপ কমান
• ধূমপান ও মদ্যপান ছাড়ুন

🚨 **জরুরি ডাক্তার দেখান:**
• তীব্র পেট ব্যথা
• বমিতে রক্ত বা কালো রং
• মলের সাথে রক্ত
• হঠাৎ ওজন কমে যাওয়া`
    }

    // Enhanced prescription help
    if (lowerMessage.includes('prescription') || lowerMessage.includes('প্রেসক্রিপশন') || lowerMessage.includes('medicine')) {
      return `💊 **প্রেসক্রিপশন সাহায্য:**

**MediLens এ প্রেসক্রিপশন বিশ্লেষণ:**
📱 Upload বাটনে গিয়ে প্রেসক্রিপশনের ছবি আপলোড করুন
🔍 AI স্বয়ংক্রিয়ভাবে বিশ্লেষণ করে দেবে:

**যা পাবেন:**
• ✅ রোগ নির্ণয় (Disease Diagnosis)
• 🧪 প্রয়োজনীয় পরীক্ষা (Required Tests)  
• 💊 ওষুধের তালিকা ও নির্দেশনা (Medicine List & Instructions)
• ⚠️ পার্শ্বপ্রতিক্রিয়া (Side Effects)
• 📋 স্বাস্থ্য পরামর্শ (Health Advice)

**ওষুধ সেবনের নিয়ম:**
• AC = খাবারের আগে (Before meal)
• PC = খাবারের পর (After meal)  
• HS = শোয়ার সময় (At bedtime)
• OD = দিনে ১ বার, BD = দিনে ২ বার
• TDS = দিনে ৩ বার, QID = দিনে ৪ বার

🔗 **এখনই ব্যবহার করুন:** Upload পেজে যান এবং প্রেসক্রিপশন আপলোড করুন!`
    }
    
    // Default enhanced response
    return `🩺 **MediLens স্বাস্থ্য সহায়ক**

আপনার প্রশ্নটি আরো স্পষ্ট করে জানালে আমি আরো ভালো সাহায্য করতে পারব।

**� জনপ্রিয় প্রশ্নসমূহ:**
• "জ্বর হলে কি করব?" 
• "ডায়াবেটিস নিয়ন্ত্রণের উপায়?"
• "রক্তচাপ বেশি হলে কি খাব?"
• "মাথাব্যথার ওষুধ কি?"
• "পেট ব্যথার কারণ কি?"

**🚀 MediLens এর বিশেষ সুবিধা:**
• 📋 প্রেসক্রিপশন বিশ্লেষণ (AI Powered)
• 🩺 ভাইটাল সাইন মনিটরিং  
• 👨‍⚕️ ডাক্তারদের তালিকা
• 💬 ২৪/৭ স্বাস্থ্য পরামর্শ

**⚡ দ্রুত সেবা নিন:**
• Upload: প্রেসক্রিপশন বিশ্লেষণ
• Vitals: স্বাস্থ্য পরিমাপ  
• Doctors: ডাক্তার খুঁজুন

আপনার স্বাস্থ্যের যত্ন নিন, MediLens আপনার পাশে! 💚`
  }

  const quickQuestions = [
    'জ্বর হলে কি করব?',
    'রক্তচাপ বেশি হলে কি খাব?',
    'ডায়াবেটিস কন্ট্রোল করার উপায়?',
    'মাথাব্যথার ওষুধ কি?',
    'পেট ব্যথার কারণ কি?',
    'কাশির ঘরোয়া চিকিৎসা',
    'হার্টের সমস্যার লক্ষণ',
    'এসিডিটির সমাধান',
    'প্রেসক্রিপশন বুঝতে সাহায্য',
    'ওষুধের পার্শ্বপ্রতিক্রিয়া',
    'রক্ত পরীক্ষার রিপোর্ট',
    'জরুরি অবস্থায় কি করব?'
  ]

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to chat</h1>
          <a href="/auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading your chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto max-w-6xl h-screen flex">
        {/* Sidebar - Chat History */}
        <div className="w-1/4 bg-base-200 border-r">
          <div className="p-4 border-b">
            <button 
              onClick={createNewChat}
              className="btn btn-primary btn-sm w-full"
            >
              ➕ নতুন চ্যাট
            </button>
          </div>
          <div className="overflow-y-auto h-full">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b cursor-pointer hover:bg-base-300 ${
                  selectedChatId === chat.id ? 'bg-base-300' : ''
                }`}
                onClick={() => {
                  setSelectedChatId(chat.id)
                  loadChatMessages(chat.id)
                }}
              >
                <h4 className="text-sm font-medium truncate">
                  {chat.title || 'Chat ' + chat.id}
                </h4>
                <p className="text-xs text-base-content/60">
                  {new Date(chat.createdAt).toLocaleDateString('bn-BD')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div 
            className="bg-primary text-primary-content p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.back()} 
                className="btn btn-ghost btn-circle text-primary-content"
              >
                ← Back
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-bold">🤖 MediLens AI Assistant</h1>
                <p className="text-primary-content/80">আপনার স্বাস্থ্য বিষয়ক সহায়ক</p>
              </div>
              <div></div>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-base-100">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      {message.type === 'user' ? (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                          {currentUser?.firstName?.[0] || 'U'}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                          🤖
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-header">
                    {message.type === 'user' ? `${currentUser?.firstName || 'You'}` : 'MediLens AI'}
                    <time className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString('bn-BD')}
                    </time>
                  </div>
                  <div className={`chat-bubble ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'} whitespace-pre-line`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="chat chat-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-content">
                      🤖
                    </div>
                  </div>
                  <div className="chat-bubble chat-bubble-secondary">
                    <span className="loading loading-dots loading-sm"></span>
                    <span className="ml-2">চিন্তা করছি...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Questions */}
          <div className="p-4 bg-base-200 border-t">
            <p className="text-sm text-base-content/70 mb-2">দ্রুত প্রশ্ন:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="btn btn-xs btn-outline"
                  onClick={() => setInputMessage(question)}
                  disabled={isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-base-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="আপনার স্বাস্থ্য বিষয়ক প্রশ্ন লিখুন... (বাংলা বা ইংরেজিতে)"
                className="input input-bordered flex-1"
                disabled={isTyping}
              />
              <button
                type="submit"
                className={`btn btn-primary ${isTyping ? 'loading' : ''}`}
                disabled={!inputMessage.trim() || isTyping}
              >
                {isTyping ? 'পাঠাচ্ছি...' : '📤 Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
