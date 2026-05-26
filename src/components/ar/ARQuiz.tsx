import React, { useState, useEffect, useRef } from 'react';
import type { QuizQuestion, Language, PageType } from '../../types';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ARQuizProps {
  pageType: PageType;
  language: Language;
  onSpeak: (text: string) => void;
  onClose: () => void;
}

const quizDatabase: Record<PageType, Record<Language, QuizQuestion[]>> = {
  heart: {
    en: [
      {
        question: "Which main blood vessel pumps oxygenated blood from the heart to the rest of the body?",
        options: ["Vena Cava", "Pulmonary Artery", "Aorta", "Left Ventricle"],
        answerIndex: 2,
        explanation: "The Aorta is the largest artery in the body and pumps oxygen-rich blood to all organs!"
      },
      {
        question: "How many chambers does the human heart have?",
        options: ["2 Chambers", "3 Chambers", "4 Chambers", "5 Chambers"],
        answerIndex: 2,
        explanation: "The human heart has 4 chambers: two upper atria and two lower ventricles."
      },
      {
        question: "What is the primary function of the heart valves?",
        options: ["To pump blood faster", "To prevent backflow of blood", "To clean the blood", "To produce oxygen"],
        answerIndex: 1,
        explanation: "Valves act as one-way gates, keeping blood flowing in the correct forward direction."
      }
    ],
    hi: [
      {
        question: "कौन सी मुख्य रक्त वाहिका हृदय से ऑक्सीजन युक्त रक्त को शरीर के बाकी हिस्सों में पंप करती है?",
        options: ["महाशिरा (Vena Cava)", "फुफ्फुस धमनी (Pulmonary Artery)", "महाधमनी (Aorta)", "बायां निलय (Left Ventricle)"],
        answerIndex: 2,
        explanation: "महाधमनी (Aorta) शरीर की सबसे बड़ी धमनी है और यह ऑक्सीजन से भरपूर रक्त को सभी अंगों में पंप करती है!"
      },
      {
        question: "मानव हृदय में कितने कक्ष (Chambers) होते हैं?",
        options: ["2 कक्ष", "3 कक्ष", "4 कक्ष", "5 कक्ष"],
        answerIndex: 2,
        explanation: "मानव हृदय में 4 कक्ष होते हैं: दो ऊपरी अलिंद (Atria) और दो निचले निलय (Ventriles)।"
      },
      {
        question: "हृदय के वाल्व (Valves) का मुख्य कार्य क्या है?",
        options: ["रक्त को तेजी से पंप करना", "रक्त के उल्टे बहाव को रोकना", "रक्त को साफ करना", "ऑक्सीजन का उत्पादन करना"],
        answerIndex: 1,
        explanation: "वाल्व एकतरफा गेट के रूप में कार्य करते हैं, जिससे रक्त सही दिशा में आगे बहता रहता है।"
      }
    ],
    gu: [
      {
        question: "કઈ મુખ્ય રક્તવાહિની હૃદયમાંથી ઓક્સિજનયુક્ત લોહીને શરીરના બાકીના ભાગોમાં પંપ કરે છે?",
        options: ["મહાશિરા (Vena Cava)", "ફેફસાની ધમની (Pulmonary Artery)", "મહાધમની (Aorta)", "ડાબું ક્ષેપક (Left Ventricle)"],
        answerIndex: 2,
        explanation: "મહાધમની (Aorta) શરીરની સૌથી મોટી ધમની છે અને તે ઓક્સિજનયુક્ત લોહીને બધા અંગોમાં પંપ કરે છે!"
      },
      {
        question: "માનવ હૃદયમાં કેટલા ખાના (Chambers) હોય છે?",
        options: ["2 ખાના", "3 ખાના", "4 ખાના", "5 ખાના"],
        answerIndex: 2,
        explanation: "માનવ હૃદયમાં 4 ખાના હોય છે: બે ઉપરના કર્ણક (Atria) અને બે નીચેના ક્ષેપક (Ventricles)."
      },
      {
        question: "હૃદયના વાલ્વ (Valves) નું મુખ્ય કાર્ય શું છે?",
        options: ["લોહીને ઝડપથી પંપ કરવું", "લોહીને પાછું વહેતું અટકાવવું", "લોહીને સાફ કરવું", "ઓક્સિજન ઉત્પન્ન કરવું"],
        answerIndex: 1,
        explanation: "વાલ્વ એકતરફી દરવાજા તરીકે કામ કરે છે, જે લોહીને માત્ર સાચી દિશામાં જ આગળ વહેવા દે છે."
      }
    ]
  },
  water_cycle: {
    en: [
      {
        question: "What is the process called when solar heat turns liquid water into vapor rising into the air?",
        options: ["Condensation", "Evaporation", "Precipitation", "Transpiration"],
        answerIndex: 1,
        explanation: "Evaporation happens when the sun heats up water in lakes/oceans, converting it to vapor gas."
      },
      {
        question: "Which phase forms clouds when water vapor cools down high in the atmosphere?",
        options: ["Sublimation", "Collection", "Precipitation", "Condensation"],
        answerIndex: 3,
        explanation: "Condensation occurs as vapor cools and clusters back into tiny liquid water droplets forming clouds."
      },
      {
        question: "Rain, snow, sleet, or hail falling from clouds back to earth is known as...",
        options: ["Precipitation", "Evaporation", "Runoff", "Infiltration"],
        answerIndex: 0,
        explanation: "Precipitation is any form of water falling back to the surface of the Earth from the sky."
      }
    ],
    hi: [
      {
        question: "जब सूर्य की गर्मी तरल पानी को वाष्प में बदलकर हवा में उठाती है, तो उस प्रक्रिया को क्या कहते हैं?",
        options: ["संघनन (Condensation)", "वाष्पीकरण (Evaporation)", "वर्षण (Precipitation)", "वाष्पोत्सर्जन (Transpiration)"],
        answerIndex: 1,
        explanation: "वाष्पीकरण तब होता है जब सूरज झीलों/महासागरों के पानी को गर्म करता है, जिससे वह भाप में बदल जाता है।"
      },
      {
        question: "जब पानी की भाप वायुमंडल में ऊपर ठंडी हो जाती है, तो कौन सा चरण बादलों का निर्माण करता है?",
        options: ["ऊर्ध्वपातन (Sublimation)", "संग्रह (Collection)", "वर्षण (Precipitation)", "संघनन (Condensation)"],
        answerIndex: 3,
        explanation: "संघनन तब होता है जब भाप ठंडी होकर वापस पानी की छोटी बूंदों में बदल जाती है, जिससे बादल बनते हैं।"
      },
      {
        question: "बादलों से बारिश या बर्फ के रूप में वापस पृथ्वी पर पानी गिरने को क्या कहा जाता है?",
        options: ["वर्षण (Precipitation)", "वाष्पीकरण", "अपवाह (Runoff)", "अंतःस्यंदन (Infiltration)"],
        answerIndex: 0,
        explanation: "वर्षण (Precipitation) आसमान से पृथ्वी की सतह पर वापस गिरने वाले पानी का कोई भी रूप है।"
      }
    ],
    gu: [
      {
        question: "જ્યારે સૂર્યની ગરમી પ્રવાહી પાણીને વરાળમાં ફેરવી હવામાં ઊંચે ચઢાવે છે, ત્યારે તે પ્રક્રિયાને શું કહેવાય?",
        options: ["ઘનીભવન (Condensation)", "બાષ્પીભવન (Evaporation)", "વરસાદ (Precipitation)", "બાષ્પોત્સર્જન (Transpiration)"],
        answerIndex: 1,
        explanation: "બાષ્પીભવન ત્યારે થાય છે જ્યારે સૂર્ય તળાવો/મહાસાગરોમાં પાણીને ગરમ કરે છે, તેને વરાળ ગેસમાં રૂપાંતરિત કરે છે."
      },
      {
        question: "જ્યારે પાણીની વરાળ વાતાવરણમાં ઊંચે ઠંડી થાય ત્યારે કયા તબક્કામાં વાદળો બને છે?",
        options: ["ઉર્ધ્વપાતન (Sublimation)", "સંગ્રહ (Collection)", "વરસાદ (Precipitation)", "ઘનીભવન (Condensation)"],
        answerIndex: 3,
        explanation: "ઘનીભવન ત્યારે થાય છે જ્યારે વરાળ ઠંડી પડે છે અને ફરીથી પાણીના નાના ટીપાં બને છે જે વાદળો રચે છે."
      },
      {
        question: "વાદળોમાંથી વરસાદ કે બરફ સ્વરૂપે પૃથ્વી પર પાણી પાછું પડે તેને શું કહેવાય?",
        options: ["વરસાદ (Precipitation)", "બાષ્પીભવન", "વહેણ (Runoff)", "ગળણ (Infiltration)"],
        answerIndex: 0,
        explanation: "આકાશમાંથી પૃથ્વીની સપાટી પર પાછા પડતા પાણીના કોઈપણ સ્વરૂપને વરસાદ (Precipitation) કહેવામાં આવે છે."
      }
    ]
  },
  math: {
    en: [
      {
        question: "In the equation 2x + 4 = 10, what is the first step to isolate the variable x?",
        options: ["Divide by 2 on both sides", "Subtract 4 from both sides", "Add 10 to both sides", "Multiply by 4 on both sides"],
        answerIndex: 1,
        explanation: "Subtracting 4 from both sides simplifies the equation to 2x = 6."
      },
      {
        question: "After simplifying 2x = 6, what is the final value of x?",
        options: ["x = 2", "x = 3", "x = 4", "x = 12"],
        answerIndex: 1,
        explanation: "Divide both sides by 2: 6 divided by 2 equals 3. So, x = 3."
      },
      {
        question: "If we substitute x = 3 back into 2x + 4, what do we get?",
        options: ["8", "10", "12", "14"],
        answerIndex: 1,
        explanation: "2*(3) + 4 = 6 + 4 = 10. The equation balances perfectly!"
      }
    ],
    hi: [
      {
        question: "समीकरण 2x + 4 = 10 में, चर x को अलग करने के लिए पहला कदम क्या है?",
        options: ["दोनों तरफ 2 से भाग देना", "दोनों तरफ से 4 घटाना", "दोनों तरफ 10 जोड़ना", "दोनों तरफ 4 से गुणा करना"],
        answerIndex: 1,
        explanation: "दोनों तरफ से 4 घटाने पर समीकरण सरल होकर 2x = 6 हो जाता है।"
      },
      {
        question: "2x = 6 को सरल करने के बाद, x का अंतिम मान क्या है?",
        options: ["x = 2", "x = 3", "x = 4", "x = 12"],
        answerIndex: 1,
        explanation: "दोनों तरफ 2 से भाग दें: 6 भाग 2 बराबर 3 होता है। इसलिए, x = 3।"
      },
      {
        question: "यदि हम x = 3 को वापस 2x + 4 में प्रतिस्थापित करें, तो हमें क्या मिलेगा?",
        options: ["8", "10", "12", "14"],
        answerIndex: 1,
        explanation: "2*(3) + 4 = 6 + 4 = 10. समीकरण पूरी तरह से संतुलित है!"
      }
    ],
    gu: [
      {
        question: "સમીકરણ 2x + 4 = 10 માં, ચલ x ને અલગ કરવા માટે પ્રથમ પગલું શું છે?",
        options: ["બંને બાજુ 2 વડે ભાગવું", "બંને બાજુથી 4 બાદ કરવું", "બંને બાજુ 10 ઉમેરવું", "બંને બાજુ 4 વડે ગુણવું"],
        answerIndex: 1,
        explanation: "બંને બાજુથી 4 બાદ કરવાથી સમીકરણ સરળ થઈને 2x = 6 બને છે."
      },
      {
        question: "2x = 6 ને સરળ કર્યા પછી, x ની અંતિમ કિંમત શું છે?",
        options: ["x = 2", "x = 3", "x = 4", "x = 12"],
        answerIndex: 1,
        explanation: "બંને બાજુ 2 વડે ભાગો: 6 ભાગ્યા 2 બરાબર 3 થાય. તેથી, x = 3."
      },
      {
        question: "જો આપણે x = 3 ને 2x + 4 માં ફરીથી મૂકીએ, તો આપણને શું મળે?",
        options: ["8", "10", "12", "14"],
        answerIndex: 1,
        explanation: "2*(3) + 4 = 6 + 4 = 10. સમીકરણ સંપૂર્ણપણે સંતુલિત થાય છે!"
      }
    ]
  },
  history: {
    en: [
      {
        question: "Who won the first Battle of Panipat in 1526?",
        options: ["Ibrahim Lodi", "Babur", "Humayun", "Hem Chandra"],
        answerIndex: 1,
        explanation: "Babur, the founder of the Mughal Empire, won the Battle of Panipat using advanced artillery tactics."
      },
      {
        question: "What military tactic did Babur use to win against Ibrahim Lodi's massive army?",
        options: ["Chariot Charges", "Tulughma and Araba (Artillery carriage flank)", "Elephant Siege", "Naval blockade"],
        answerIndex: 1,
        explanation: "Babur utilized the Tulughma tactic (flanking strategy) and Araba (chained carts with cannons) to encircle Lodi's forces."
      },
      {
        question: "The First Battle of Panipat marked the beginning of which dynasty in India?",
        options: ["Lodi Dynasty", "Gupta Dynasty", "Mughal Empire", "Maratha Empire"],
        answerIndex: 2,
        explanation: "This historic victory marked the overthrow of the Delhi Sultanate and established the Mughal Empire."
      }
    ],
    hi: [
      {
        question: "1526 में पानीपत की पहली लड़ाई किसने जीती थी?",
        options: ["इब्राहिम लोदी", "बाबर", "हुमायूँ", "हेम चंद्र"],
        answerIndex: 1,
        explanation: "मुगल साम्राज्य के संस्थापक बाबर ने उन्नत तोपखाने की रणनीति का उपयोग करके पानीपत की लड़ाई जीती थी।"
      },
      {
        question: "बाबर ने इब्राहिम लोदी की विशाल सेना के खिलाफ जीतने के लिए किस सैन्य रणनीति का उपयोग किया था?",
        options: ["रथ हमला", "तुलुगमा और अराबा (तोपगाड़ी घेरा)", "हाथी घेराबंदी", "नौसैनिक नाकेबंदी"],
        answerIndex: 1,
        explanation: "बाबर ने लोदी की सेना को घेरने के लिए तुलुगमा रणनीति (फ्लैंकिंग) और अराबा (तोपों से बंधी गाड़ियों) का उपयोग किया।"
      },
      {
        question: "पानीपत की पहली लड़ाई ने भारत में किस साम्राज्य की शुरुआत की?",
        options: ["लोदी राजवंश", "गुप्त राजवंश", "मुगल साम्राज्य", "मराठा साम्राज्य"],
        answerIndex: 2,
        explanation: "इस ऐतिहासिक जीत ने दिल्ली सल्तनत को समाप्त कर भारत में मुगल साम्राज्य की नींव रखी।"
      }
    ],
    gu: [
      {
        question: "1526 માં પાણિપતનું પ્રથમ યુદ્ધ કોણે જીત્યું હતું?",
        options: ["ઇબ્રાહિમ લોદી", "બાબર", "હુમાયુ", "હેમચંદ્ર"],
        answerIndex: 1,
        explanation: "મુઘલ સામ્રાજ્યના સ્થાપક બાબરે અદ્યતન તોપખાના યુક્તિઓનો ઉપયોગ કરીને પાણિપતનું યુદ્ધ જીત્યું્યું હતું."
      },
      {
        question: "બાબરે ઇબ્રાહિમ લોદીના વિશાળ લશ્કર સામે જીતવા માટે કઈ સૈન્ય યુક્તિનો ઉપયોગ કર્યો હતો?",
        options: ["રથ હુમલા", "તુલુઘમા અને અરાબા (તોપમાળ ગોઠવણી)", "હાથી ઘેરાબંધી", "નૌકા નાકાબંધી"],
        answerIndex: 1,
        explanation: "બાબરે લોદીના લશ્કરને ઘેરવા માટે તુલુઘમા યુક્તિ (બાજુથી ઘેરો) અને અરાબા (સાંકળોથી બાંધેલી તોપગાડીઓ) નો ઉપયોગ કર્યો હતો."
      },
      {
        question: "પાણિપતના પ્રથમ યુદ્ધે ભારતમાં કયા સામ્રાજ્યની શરૂઆત કરી?",
        options: ["લોદી રાજવંશ", "ગુપ્ત રાજવંશ", "મુઘલ સામ્રાજ્ય", "મરાઠા સામ્રાજ્ય"],
        answerIndex: 2,
        explanation: "આ ઐતિહાસિક વિજયે દિલ્હી સલ્તનતનો અંત આણીને ભારતમાં મુઘલ સામ્રાજ્યની સ્થાપના કરી હતી."
      }
    ]
  },
  physics: {
    en: [
      {
        question: "When white light passes through a prism, it separates into different colors. What is this process called?",
        options: ["Reflection", "Dispersion", "Diffraction", "Absorption"],
        answerIndex: 1,
        explanation: "Dispersion is the process where white light splits into its constituent colors because different wavelengths refract at slightly different angles."
      },
      {
        question: "Which color of light bends the most when passing through a prism?",
        options: ["Red", "Yellow", "Green", "Violet"],
        answerIndex: 3,
        explanation: "Violet light has the shortest wavelength and therefore bends (refracts) the most when passing through the prism."
      },
      {
        question: "In optics, what term describes the bending of a light ray as it passes from one medium to another?",
        options: ["Refraction", "Reflection", "Scattering", "Interference"],
        answerIndex: 0,
        explanation: "Refraction is the bending of light caused by a change in its speed as it moves from one medium (like air) into another (like glass)."
      }
    ],
    hi: [
      {
        question: "जब सफेद प्रकाश एक प्रिज्म से होकर गुजरता है, तो यह विभिन्न रंगों में अलग हो जाता है। इस प्रक्रिया को क्या कहा जाता है?",
        options: ["परावर्तन (Reflection)", "विक्षेपण (Dispersion)", "विवर्तन (Diffraction)", "अवशोषण (Absorption)"],
        answerIndex: 1,
        explanation: "विक्षेपण (Dispersion) वह प्रक्रिया है जहां सफेद प्रकाश अपने घटक रंगों में विभाजित हो जाता है क्योंकि अलग-अलग तरंग दैर्ध्य थोड़े अलग कोणों पर अपवर्तित होते हैं।"
      },
      {
        question: "प्रिज्म से गुजरते समय प्रकाश का कौन सा रंग सबसे ज्यादा झुकता है?",
        options: ["लाल", "पीला", "हरा", "बैंगनी"],
        answerIndex: 3,
        explanation: "बैंगनी प्रकाश की तरंग दैर्ध्य सबसे छोटी होती है और इसलिए प्रिज्म से गुजरते समय यह सबसे अधिक झुकता (अपवर्तित) होता है।"
      },
      {
        question: "प्रकाशिकी में, एक माध्यम से दूसरे माध्यम में जाने पर प्रकाश किरण के झुकने का वर्णन करने के लिए किस शब्द का उपयोग किया जाता है?",
        options: ["अपवर्तन (Refraction)", "परावर्तन (Reflection)", "प्रकीर्णन (Scattering)", "व्यतिकरण (Interference)"],
        answerIndex: 0,
        explanation: "अपवर्तन (Refraction) प्रकाश का झुकना है जो एक माध्यम (जैसे हवा) से दूसरे माध्यम (जैसे कांच) में जाने पर इसकी गति में बदलाव के कारण होता है।"
      }
    ],
    gu: [
      {
        question: "જ્યારે સફેદ પ્રકાશ પ્રિઝમમાંથી પસાર થાય છે, ત્યારે તે વિવિધ રંગોમાં અલગ પડે છે. આ પ્રક્રિયાને શું કહેવાય છે?",
        options: ["પરાવર્તન (Reflection)", "વિક્ષેપન (Dispersion)", "વિવર્તન (Diffraction)", "શોષણ (Absorption)"],
        answerIndex: 1,
        explanation: "વિક્ષેપન (Dispersion) એ પ્રક્રિયા છે જ્યાં સફેદ પ્રકાશ તેના ઘટક રંગોમાં વિભાજિત થાય છે કારણ કે જુદી જુદી તરંગલંબાઇ થોડી અલગ ખૂણાઓ પર વક્રીભવન પામે છે."
      },
      {
        question: "પ્રિઝમમાંથી પસાર થતી વખતે કયો રંગ સૌથી વધુ વળે છે?",
        options: ["લાલ", "પીળો", "લીલો", "જાંબલી"],
        answerIndex: 3,
        explanation: "જાંબલી પ્રકાશની તરંગલંબાઇ સૌથી ટૂંકી હોય છે અને તેથી પ્રિઝમમાંથી પસાર થતી વખતે તે સૌથી વધુ વળે (વક્રીભવન) છે."
      },
      {
        question: "ઓપ્ટિક્સમાં, એક માધ્યમથી બીજા માધ્યમમાં પસાર થતી વખતે પ્રકાશના કિરણના વળાંકનું વર્ણન કરવા માટે કયો શબ્દ વપરાય છે?",
        options: ["વક્રીભવન (Refraction)", "પરાવર્તન (Reflection)", "વિખેરી નાખવું (Scattering)", "દખલગીરી (Interference)"],
        answerIndex: 0,
        explanation: "વક્રીભવન (Refraction) એ પ્રકાશનું વળાંક છે જે એક માધ્યમ (જેમ કે હવા) થી બીજા માધ્યમ (જેમ કે કાચ) માં જાય ત્યારે તેની ગતિમાં ફેરફારને કારણે થાય છે."
      }
    ]
  },
  unknown: {
    en: [],
    hi: [],
    gu: []
  }
};

export const ARQuiz: React.FC<ARQuizProps> = ({ pageType, language, onSpeak, onClose }) => {
  const { incrementQuizzes } = useAuth();
  const questions = quizDatabase[pageType]?.[language] || [];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // If no questions (unknown type), don't render anything
  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIdx];

  // Confetti Particle Engine
  useEffect(() => {
    if (!quizFinished || score < questions.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: any[] = [];
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    // Populate particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        type: Math.random() > 0.4 ? 'circle' : Math.random() > 0.5 ? 'star' : 'triangle'
      });
    }

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawTriangle = (x: number, y: number, r: number, color: string, tilt: number) => {
      ctx.beginPath();
      ctx.moveTo(x + tilt, y);
      ctx.lineTo(x + r + tilt, y + r * 1.5);
      ctx.lineTo(x - r + tilt, y + r * 1.5);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2.5;
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 12;

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
          p.tilt = Math.random() * 10 - 5;
        }

        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x + p.tilt, p.y, p.r, 0, Math.PI * 2, true);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'star') {
          drawStar(p.x + p.tilt, p.y, 5, p.r * 1.6, p.r * 0.7, p.color);
        } else {
          drawTriangle(p.x, p.y, p.r, p.color, p.tilt);
        }
      });

      animationId = requestAnimationFrame(update);
    };

    update();

    // Multilingual Congrats audio speech
    const congratText = {
      en: "Awesome! You scored a perfect three out of three! You are a brilliant scientist!",
      hi: "बहुत बढ़िया! आपने तीन में से तीन अंक प्राप्त किए! आप एक बहुत ही बुद्धिमान छात्र हैं!",
      gu: "અદ્ભુત! તમે ત્રણમાંથી ત્રણ પૂરા માર્ક્સ મેળવ્યા છે! તમે ખૂબ જ તેજસ્વી વિદ્યાર્થી છો!"
    };
    onSpeak(congratText[language]);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [quizFinished, score]);

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const correct = idx === currentQuestion.answerIndex;
    if (correct) {
      setScore(prev => prev + 1);
      const successReplies = {
        en: `Correct! ${currentQuestion.explanation}`,
        hi: `सही उत्तर! ${currentQuestion.explanation}`,
        gu: `સાચો જવાબ! ${currentQuestion.explanation}`
      };
      onSpeak(successReplies[language]);
    } else {
      const failReplies = {
        en: `Oops! That's incorrect. ${currentQuestion.explanation}`,
        hi: `ओह! यह गलत है। ${currentQuestion.explanation}`,
        gu: `અરેરે! આ ખોટું છે। ${currentQuestion.explanation}`
      };
      onSpeak(failReplies[language]);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      incrementQuizzes();
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const playAudioQuestion = () => {
    onSpeak(`${currentQuestion.question}. Option one: ${currentQuestion.options[0]}. Option two: ${currentQuestion.options[1]}. Option three: ${currentQuestion.options[2]}. Option four: ${currentQuestion.options[3]}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', zIndex: 90 }}>
      {/* Confetti Canvas */}
      {quizFinished && score === questions.length && (
        <canvas ref={canvasRef} className="confetti-canvas" />
      )}

      <div className="glass-card float-panel" style={{
        padding: '22px',
        border: '1px solid rgba(99,102,241,0.22)',
        background: 'linear-gradient(135deg, rgba(7,14,28,0.95) 0%, rgba(99,102,241,0.06) 100%)',
        position: 'relative',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px', paddingBottom: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '11px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award style={{ color: 'var(--gold)' }} size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: '#fff', lineHeight: 1.1 }}>
                Knowledge Quiz
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                Test what you've learned
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Score badge */}
            {!quizFinished && (
              <div style={{
                fontSize: '11px', fontWeight: '800',
                padding: '4px 12px', borderRadius: '999px',
                background: 'rgba(245,158,11,0.10)',
                color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.25)',
              }}>
                {score}/{questions.length} ✓
              </div>
            )}
            <div style={{
              fontSize: '11px', fontWeight: '700',
              padding: '4px 12px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {!quizFinished ? `${currentIdx + 1} / ${questions.length}` : '✓ Done'}
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        {!quizFinished && (
          <div className="progress-track" style={{ marginBottom: '18px' }}>
            <div className="progress-fill" style={{
              width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--indigo), var(--saffron))',
            }} />
          </div>
        )}

        {/* ── FINISHED SCREEN ── */}
        {quizFinished ? (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <div style={{
              fontSize: score === questions.length ? '64px' : '52px',
              marginBottom: '12px',
              animation: 'scaleIn 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '💪'}
            </div>

            <h4 style={{
              fontSize: '22px', fontFamily: 'var(--font-heading)', fontWeight: '900',
              marginBottom: '6px',
              background: score === questions.length
                ? 'linear-gradient(135deg, #fde68a, #f59e0b)'
                : 'linear-gradient(135deg, #fff, #cbd5e1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {score === questions.length ? 'Perfect Score! 🌟' : score >= questions.length / 2 ? 'Great Effort!' : 'Keep Studying!'}
            </h4>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', lineHeight: 1.5 }}>
              You scored{' '}
              <strong style={{
                color: score === questions.length ? 'var(--gold)' : '#fff',
                fontSize: '20px',
              }}>
                {score}
              </strong>
              {' '}out of <strong style={{ color: '#fff' }}>{questions.length}</strong>
            </p>

            {/* XP reward */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(255,107,43,0.12)',
              border: '1px solid rgba(255,107,43,0.25)',
              color: 'var(--saffron)', fontSize: '13px', fontWeight: '700',
              marginBottom: '24px',
            }}>
              ⚡ +{score * 15} XP earned!
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleReset} className="glass-btn ghost" style={{ padding: '9px 20px' }}>
                <RotateCcw size={14} /> Retry
              </button>
              <button onClick={onClose} className="glass-btn primary" style={{ padding: '9px 22px' }}>
                Back to Lesson
              </button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE QUIZ ── */
          <div>
            {/* Question */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{
                minWidth: '28px', height: '28px', borderRadius: '9px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--indigo-light)', fontSize: '13px', fontWeight: '800',
                flexShrink: 0, marginTop: '2px',
              }}>
                {currentIdx + 1}
              </div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', lineHeight: '1.55', flex: 1 }}>
                {currentQuestion.question}
              </p>
              <button
                onClick={playAudioQuestion}
                className="glass-btn ghost"
                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
                title="Listen to question"
              >
                <Volume2 size={13} />
              </button>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {currentQuestion.options.map((opt, idx) => {
                const isCorrect  = isAnswered && idx === currentQuestion.answerIndex;
                const isWrong    = isAnswered && selectedOpt === idx && idx !== currentQuestion.answerIndex;
                const isDimmed   = isAnswered && !isCorrect && !isWrong;

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(idx)}
                    style={{
                      width: '100%', padding: '11px 16px',
                      borderRadius: '12px',
                      border: isCorrect
                        ? '1px solid var(--emerald)'
                        : isWrong
                        ? '1px solid var(--rose)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isCorrect
                        ? 'rgba(16,185,129,0.12)'
                        : isWrong
                        ? 'rgba(244,63,94,0.12)'
                        : 'rgba(255,255,255,0.03)',
                      color: isCorrect ? '#fff' : isWrong ? '#fff' : 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      textAlign: 'left', fontSize: '14px', fontWeight: isCorrect ? '700' : '500',
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s ease',
                      opacity: isDimmed ? 0.45 : 1,
                      boxShadow: isCorrect
                        ? '0 0 14px rgba(16,185,129,0.25)'
                        : isWrong
                        ? '0 0 14px rgba(244,63,94,0.2)'
                        : 'none',
                      animation: isWrong ? 'wiggle 0.35s ease' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isAnswered) {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isAnswered) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }
                    }}
                  >
                    <span>{opt}</span>
                    {isCorrect && <CheckCircle2 size={16} style={{ color: 'var(--emerald)', flexShrink: 0 }} />}
                    {isWrong   && <XCircle size={16} style={{ color: 'var(--rose)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '14px 16px',
                animation: 'fadeInUp 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold)', marginBottom: '5px' }}>
                  💡 Explanation
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="glass-btn primary"
                  style={{ marginTop: '12px', float: 'right', padding: '8px 20px', borderRadius: '999px', fontSize: '13px' }}
                >
                  {currentIdx + 1 === questions.length ? 'Finish Quiz 🏆' : 'Next Question'}
                  <ArrowRight size={13} />
                </button>
                <div style={{ clear: 'both' }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
