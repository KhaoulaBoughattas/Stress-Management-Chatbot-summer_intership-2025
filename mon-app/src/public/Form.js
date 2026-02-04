// src/public/Form.js
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import './form.css';

export default function STAIForm() {
  const [responses, setResponses] = useState(Array(20).fill(null));
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [avantApres, setAvantApres] = useState("avant");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { language = 'fr', darkMode = false } = location.state || {};

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const translate = (fr, en, ar) => {
    if (language === 'fr') return fr;
    if (language === 'en') return en;
    return ar;
  };

  // ---------- Récupération automatique des infos utilisateur ----------
  const loadUserInfo = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email); // ✅ email au lieu de uid
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserFirstName(data.firstName || "");
        setUserLastName(data.lastName || "");
        setUserName(
          data.name ||
          `${data.firstName || ""} ${data.lastName || ""}`.trim()
        );
      }
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    if (responses.includes(null)) {
      alert(translate(
        "Veuillez répondre à toutes les questions.",
        "Please answer all questions.",
        "يرجى الإجابة على جميع الأسئلة."
      ));
      return;
    }

    const total = responses.reduce((sum, val) => sum + val, 0);
    setScore(total);
    setSubmitted(true);

    try {
      await addDoc(collection(db, "stai_scores"), {
        responses,
        score: total,
        email: userEmail, // ✅ sauvegarder email
        userFirstName,
        userLastName,
        userName,
        avant_apres: avantApres,
        timestamp: serverTimestamp()
      });
      alert(translate("Vos réponses ont été enregistrées !", "Your answers have been saved!", "تم حفظ إجاباتك!"));
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert(translate("Erreur lors de l'enregistrement.", "Error saving data.", "حدث خطأ أثناء الحفظ."));
    }
  };

  const questions = [
    translate("Je me sens calme.", "I feel calm.", "أشعر بالهدوء."),
    translate("Je me sens tendu(e).", "I feel tense.", "أشعر بالتوتر."),
    translate("Je me sens excité(e).", "I feel excited.", "أشعر بالحماس."),
    translate("Je regrette certaines choses.", "I regret certain things.", "أشعر بالندم على بعض الأمور."),
    translate("Je suis en sécurité.", "I feel safe.", "أشعر بالأمان."),
    translate("Je me sens inquiet/inquiète.", "I feel worried.", "أشعر بالقلق."),
    translate("Je me sens satisfait(e).", "I feel satisfied.", "أشعر بالرضا."),
    translate("Je suis ennuyé(e).", "I feel bored.", "أشعر بالملل."),
    translate("Je me sens à l’aise.", "I feel comfortable.", "أشعر بالراحة."),
    translate("Je me sens nerveux(se).", "I feel nervous.", "أشعر بالتوتر."),
    translate("Je suis bien reposé(e).", "I feel well rested.", "أشعر أنني مرتاح."),
    translate("Je me sens préoccupé(e).", "I feel concerned.", "أشعر بالانشغال الذهني."),
    translate("Je me sens détendu(e).", "I feel relaxed.", "أشعر بالاسترخاء."),
    translate("Je me sens content(e).", "I feel happy.", "أشعر بالسعادة."),
    translate("Je me sens indécis(e).", "I feel indecisive.", "أشعر بعدم القدرة على اتخاذ القرار."),
    translate("Je me sens effrayé(e).", "I feel scared.", "أشعر بالخوف."),
    translate("Je me sens agréable.", "I feel pleasant.", "أشعر بالسرور."),
    translate("J’ai l’impression que je vais m’évanouir.", "I feel like I’m about to faint.", "أشعر أنني على وشك الإغماء."),
    translate("Je me sens confiant(e).", "I feel confident.", "أشعر بالثقة."),
    translate("Je me sens tendu(e) intérieurement.", "I feel inwardly tense.", "أشعر بتوتر داخلي.")
  ];

  const options = [
    { label: translate("Pas du tout", "Not at all", "ليس على الإطلاق"), value: 1 },
    { label: translate("Un peu", "A little", "قليلاً"), value: 2 },
    { label: translate("Moyennement", "Moderately", "إلى حد ما"), value: 3 },
    { label: translate("Tout à fait", "Very much", "تماماً"), value: 4 }
  ];

  return (
    <div className={`form-container ${language === 'ar' ? 'rtl' : ''}`}>
      <h1>{translate("Échelle STAI - Anxiété d'état", "STAI Scale - State Anxiety", "مقياس STAI - القلق الحالي")}</h1>
      <p>{translate("Indiquez à quel point chaque affirmation correspond à ce que vous ressentez maintenant.", "Indicate how much each statement applies to how you feel now.", "حدد مدى انطباق كل عبارة على شعورك الحالي.")}</p>

      <div className="user-info-display">
        <p>{translate("Nom complet :", "Full Name:", "الاسم الكامل:")} {userName}</p>
        <p>{translate("Email :", "Email:", "البريد الإلكتروني:")} {userEmail}</p>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="question-item">
          <p className="question-text">{index + 1}. {question}</p>
          <div className="grid grid-cols-4 gap-6">
            {options.map((option, i) => (
              <label key={i} className="option-label">
                <input
                  type="radio"
                  name={`q${index}`}
                  value={option.value}
                  checked={responses[index] === option.value}
                  onChange={() => handleChange(index, option.value)}
                  className="hidden"
                />
                <div className={`w-16 h-16 flex items-center justify-center rounded-full text-lg font-semibold ${responses[index] === option.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} transition`}>
                  {option.label[0]}
                </div>
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="avant-apres-selection">
        <label>{translate("répondez-vous avant ou après la consultation ?", "Are you answering before or after the consultation?", "هل تجيب قبل أم بعد الاستشارة؟")}</label>
        <select value={avantApres} onChange={(e) => setAvantApres(e.target.value)} className="select-input">
          <option value="avant">{translate("Avant", "Before", "قبل")}</option>
          <option value="apres">{translate("Après", "After", "بعد")}</option>
        </select>
      </div>

      <div className="flex justify-center mt-8">
        <button className="submit-button" onClick={handleSubmit} type="button">
          {translate("Soumettre", "Submit", "إرسال")}
        </button>
      </div>

      {submitted && (
        <div className="score-container">
          <p className="score-text">{translate("Score total", "Total score", "المجموع الكلي")} : {score} / 80</p>
          <p className={`score-${score < 40 ? 'low' : score > 60 ? 'high' : 'medium'}`}>
            {score < 40 && translate("Anxiété faible", "Low anxiety", "قلق منخفض")}
            {score >= 40 && score <= 60 && translate("Anxiété modérée", "Moderate anxiety", "قلق معتدل")}
            {score > 60 && translate("Anxiété élevée", "High anxiety", "قلق مرتفع")}
          </p>
        </div>
      )}

      <button onClick={() => navigate("/home")} className="go-home-button">
        {translate("Retour à l'Accueil", "Back to Home", "العودة إلى الصفحة الرئيسية")}
      </button>
    </div>
  );
}
