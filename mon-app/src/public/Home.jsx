import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const logo = '/images/Logo.png';

const Home = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [language, setLanguage] = useState('fr');
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    document.body.classList.toggle('dark-mode', darkMode);
    return () => unsubscribe();
  }, [darkMode]);

  const handleLoginRedirect = () => navigate('/login');
  const handleSignUpRedirect = () => navigate('/signup');

  const handleGetStarted = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  const handleEvaluationRedirect = () => {
    if (!user) {
      alert(language === 'ar'
        ? "يرجى تسجيل الدخول للوصول إلى هذه الميزة."
        : language === 'fr'
        ? "Veuillez vous connecter pour accéder à cette fonctionnalité."
        : "Please log in to access this feature."
      );
      return;
    }
  navigate('/eval', { state: { darkMode, language, email: user.email } });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const translate = (fr, en, ar) => {
    if (language === 'fr') return fr;
    if (language === 'en') return en;
    return ar;
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ✅ Fonction pour générer les initiales
  const getInitials = () => {
    if (!userData) return "?";
    const prenom = userData.prenom || "";
    const nom = userData.nom || "";
    return (
      (prenom.charAt(0) || "").toUpperCase() +
      (nom.charAt(0) || "").toUpperCase()
    );
  };

  return (
    <div className={`home-container ${language === 'ar' ? 'rtl' : ''}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="navbar-title">
            {translate("Mon Espace Bien-être", "My Wellness Space", "مساحتي للراحة النفسية")}
          </span>
        </div>

        <div className="navbar-center">
          <button onClick={() => scrollToSection('about')}>
            {translate("À propos", "About", "حول")}
          </button>
          <button onClick={() => scrollToSection('services')}>
            {translate("Services", "Services", "الخدمات")}
          </button>
          <button onClick={() => scrollToSection('testimonials')}>
            {translate("Témoignages", "Testimonials", "الشهادات")}
          </button>
          <button onClick={() => scrollToSection('contact')}>
            {translate("Contact", "Contact", "اتصل بنا")}
          </button>

          <select 
            className="language-selector" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              {/* ✅ Initiales dans un cercle */}
              <div 
                className="navbar-avatar" 
                onClick={() => setShowProfile(true)}
              >
                {getInitials()}
              </div>

              <button className="navbar-button" onClick={handleEvaluationRedirect}>
                {translate("Évaluer mon état", "Self Check-in", "تقييم حالتي")}
              </button>
              <button className="navbar-button" onClick={handleLogout}>
                {translate("Déconnexion", "Logout", "تسجيل الخروج")}
              </button>
            </>
          ) : (
            <>
              <button className="navbar-button" onClick={handleLoginRedirect}>
                {translate("Se connecter", "Sign In", "تسجيل الدخول")}
              </button>
              <button className="navbar-button" onClick={handleSignUpRedirect}>
                {translate("Créer un compte", "Sign Up", "إنشاء حساب")}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ✅ Fenêtre Profil */}
      {showProfile && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h3>{translate("Mon Profil", "My Profile", "ملفي الشخصي")}</h3>
            <button onClick={() => { setShowProfile(false); navigate('/profile'); }}>
              {translate("Paramètres", "Settings", "الإعدادات")}
            </button>
            <button onClick={() => { setShowProfile(false); navigate('/help'); }}>
              {translate("Aide", "Help", "مساعدة")}
            </button>
            <button className="close-btn" onClick={() => setShowProfile(false)}>
              {translate("Fermer", "Close", "إغلاق")}
            </button>
          </div>
        </div>
      )}
      {/* Welcome Section */}
      <section className="hero fade-in-up">
        <h1 className="hero-title">
          {translate(
            "Votre espace pour un esprit apaisé et équilibré.",
            "Your space for a calm and balanced mind.",
            "مساحتك من أجل عقل هادئ ومتوازن."
          )}
        </h1>
        <p>
          {translate(
            "Notre chatbot thérapeutique est là pour vous écouter, toujours prêt à vous accompagner.",
            "Our therapeutic chatbot is here to listen, always ready to support you.",
            "روبوتنا العلاجي هنا للاستماع إليك، دائمًا جاهز لدعمك."
          )}
        </p>
        <img src={logo} alt="Site Logo" className="logo-center" />

        {/* ✅ Utilisation de la nouvelle fonction */}
        <button className="get-started-btn" onClick={handleGetStarted}>
          {translate("Commencer", "Get Started", "ابدأ الآن")}
        </button>

        <p className="welcome-message">
          {user ? (
            <>
              {translate(
                "Bienvenue, nous sommes là pour vous aider,",
                "Welcome, we're here to support you,",
                "مرحبًا، نحن هنا لمساعدتك."
              )}
              <br />
              <strong>{user.email}</strong>
            </>
          ) : (
            translate(
              "Bienvenue ! Vous êtes en sécurité ici, nous sommes là pour vous.",
              "Welcome! You're safe here, we're here to support you.",
              "أهلاً بك! أنت بأمان هنا، نحن هنا لدعمك."
            )
          )}
        </p>
      </section>
{/* About Section */}
<section id="about" className="about-section">
  <div className="about-container">
    <div className="about-image">
      <img src="/images/img4.png" alt={translate("À propos de nous", "About Us", "معلومات عنا")} />
    </div>
    <div className="about-text">
      <h2 className="about-title">
        {translate("À propos de nous", "About Us", "معلومات عنا")}
      </h2>
      <p className="about-description">
        {translate(
          "Nous sommes une équipe multidisciplinaire dédiée à la promotion de la santé mentale. À travers notre plateforme, nous vous offrons un espace confidentiel, sécurisé et bienveillant pour vous exprimer librement, trouver du soutien et progresser vers un mieux-être.",
          "We are a multidisciplinary team dedicated to promoting mental health. Through our platform, we offer a confidential, secure, and supportive space for you to express yourself freely, find support, and progress toward well-being.",
          "نحن فريق متعدد التخصصات ملتزمون بتعزيز الصحة النفسية. من خلال منصتنا، نوفر لك مساحة آمنة وسرية وداعمة للتعبير عن نفسك بحرية، والحصول على الدعم، والتقدم نحو حياة أفضل."
        )}
      </p>
    </div>
  </div>
</section>

{/* Chat Info Section */}
<section id="chat-info" className="chat-info-section">
  <div className="chat-info-container">
    <div className="chat-info-text">
      <h2 className="chat-info-title">
        {translate(
          "Chat gratuit et sécurisé",
          "Free and Secure Chat",
          "دردشة مجانية وآمنة"
        )}
      </h2>
      <p className="chat-info-description">
        {translate(
          `Bienvenue sur PsyBot, votre plateforme de chat gratuite dédiée au soutien en santé mentale. 
          Notre espace vous permet de dialoguer librement, trouver du réconfort et créer des liens authentiques dans un environnement confidentiel et bienveillant.`,
          `Welcome to PsyBot, your free chat platform dedicated to mental health support. 
          Our space allows you to freely talk, find comfort, and build authentic connections in a confidential and supportive environment. `,
          `مرحبًا بكم في PsyBot، منصتكم المجانية للدردشة المخصصة لدعم الصحة النفسية.
          يتيح لكم هذا الفضاء التحدث بحرية، والعثور على الراحة، وبناء علاقات حقيقية في بيئة سرية وداعمة.`
        )}
      </p>

      <p className="chat-info-description">
        {translate(
          `Notre plateforme accueille toutes les personnes, sans discrimination, et encourage l'entraide et l'écoute active. 
          Que vous cherchiez un espace pour parler, ou pour simplement écouter, PsyBot est là pour vous accompagner.`,
          `Our platform welcomes everyone, without discrimination, and encourages mutual aid and active listening. 
          Whether you want a space to talk or just to listen, PsyBot is here to support you.`,
          `تستقبل منصتنا الجميع بدون تمييز، وتشجع على المساعدة المتبادلة والاستماع الفعال.
          سواء أردت مكانًا للتحدث أو فقط للاستماع، PsyBot هنا لدعمك.`
        )}
      </p>
    </div>

    <div className="chat-info-image">
      <img src="/images/img5.png" alt={translate("Image de la plateforme de chat", "Chat Platform Image", "صورة منصة الدردشة")} />
    </div>
  </div>
</section>


 {/* Services Section */} 

    <section id="services" className="section services-section">
  <h2>{translate("Nos Services", "Our Services", "خدماتنا")}</h2>
  <div className="services-grid">
    <div className="service-card" tabIndex={0}>
      <h3>{translate("Évaluation de l'état émotionnel", "Emotional State Assessment", "تقييم الحالة العاطفية")}</h3>
      <div className="eval-image">
      <img src="/images/eval.png" alt="eval" />
    </div>
      <p>{translate(
        "Une analyse personnalisée pour mieux comprendre et suivre votre état émotionnel.",
        "Personalized analysis to better understand and track your emotional state.",
        "تحليل شخصي لفهم ومتابعة حالتك العاطفية بشكل أفضل."
      )}</p>
    </div>

    <div className="service-card" tabIndex={0}>
      <h3>{translate("Chatbot thérapeutique 24/7", "24/7 Therapy Chatbot", "روبوت علاجي متاح 24/7")}</h3>
      <div className="vintequatre-image">
      <img src="/images/247.png" alt="24/7" />
    </div>
      <p>{translate(
        "Un assistant virtuel intelligent disponible à tout moment pour vous écouter et vous guider.",
        "An intelligent virtual assistant available anytime to listen and guide you.",
        "مساعد افتراضي ذكي متاح في أي وقت للاستماع إليك وإرشادك."
      )}</p>
    </div>

    <div className="service-card" tabIndex={0}>
      <h3>{translate("Ressources de méditation", "Meditation Resources", "موارد التأمل")}</h3>
      <div className="meditation-image">
      <img src="/images/meditation.png" alt="meditation" />
    </div>
      <p>{translate(
        "Des guides et exercices pour vous aider à pratiquer la pleine conscience et la détente.",
        "Guides and exercises to help you practice mindfulness and relaxation.",
        "أدلة وتمارين لمساعدتك على ممارسة اليقظة والاسترخاء."
      )}</p>
    </div>
  </div>
</section>


   {/* Testimonials Section */}
<section id="testimonials" className="section testimonials-section">
 <h2 className="section-title">
    {translate("Témoignages", "Testimonials", "آراء المستخدمين")}
  </h2>

  <div className="testimonial-container">
    {/* Testimonial 1 */}
    <div className="testimonial-card">
      <img src="/images/user2.png" alt="User 1" className="testimonial-photo" />
      <blockquote className="testimonial-text">
        “{translate(
          "J’ai retrouvé la paix intérieure grâce à ce chatbot. C’est comme parler à un ami qui ne juge jamais.",
          "I found inner peace thanks to this chatbot. It's like talking to a friend who never judges.",
          "وجدت راحة داخلية بفضل هذا الروبوت. كأنني أتحدث إلى صديق لا يحكم عليّ أبدًا."
        )}”
      </blockquote>
      <p className="testimonial-name">
        - {translate("Yasmine, 24 ans", "Yasmine, 24 years old", "ياسمين، 24 سنة")}
      </p>
      <div className="stars">★★★★★</div>
    </div>

    {/* Testimonial 2 */}
    <div className="testimonial-card">
      <img src="/images/user1.png" alt="User 2" className="testimonial-photo" />
      <blockquote className="testimonial-text">
        “{translate(
          "Pendant une période de stress intense, ce chatbot a été ma bouée de sauvetage. Simple, humain et rassurant.",
          "During a period of intense stress, this chatbot was my lifeline. Simple, human, and reassuring.",
          "خلال فترة توتر شديدة، كان هذا الروبوت طوق النجاة بالنسبة لي. بسيط، إنساني ومطمئن."
        )}”
      </blockquote>
      <p className="testimonial-name">
        - {translate("Ahmed, jeune professionnel", "Ahmed, young professional", "أحمد، شاب عامل")}
      </p>
      <div className="stars">★★★★☆</div>
    </div>
  </div>
</section>

{/* Contact Section */}
<section
  id="contact"
  className="section contact-section"
  style={{ background: "linear-gradient(to bottom, #e3f2fd, #ffffff)", padding: "4rem 2rem" }}
>
  <h2 className="text-3xl font-bold text-center mb-10">
    {translate("Contactez-nous", "Contact Us", "اتصل بنا")}
  </h2>

  <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
    {/* Left Side Text */}
    <div className="md:w-1/2 space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        {translate("Nous sommes là pour vous", "We’re here for you", "نحن هنا من أجلك")}
      </h3>
      <p className="text-gray-700 leading-relaxed text-justify">
        {translate(
          "Nous sommes là pour répondre à vos questions et vous accompagner. N'hésitez pas à nous écrire, et nous vous répondrons dans les plus brefs délais.",
          "We’re here to answer your questions and support you. Feel free to reach out and we’ll get back to you as soon as possible.",
          "نحن هنا للإجابة على أسئلتك ومساعدتك. لا تتردد في مراسلتنا، وسنرد عليك في أقرب وقت ممكن."
        )}
      </p>
      <p className="text-sm text-gray-500">{translate("Disponible 24/7", "Available 24/7", "متاح 24/7")}</p>
      <div className="contactus-image">
      <img src="/images/img6.png" alt="contactus" />
    </div>
    </div>

    {/* Right Side Form */}
    <form className="md:w-1/2 bg-white shadow-xl rounded-xl p-8 space-y-6 w-full" onSubmit={e => e.preventDefault()}>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder={translate("Nom", "Last Name", "اللقب")}
          className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          placeholder={translate("Prénom", "First Name", "الاسم")}
          className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <input
        type="tel"
        placeholder={translate("Téléphone", "Phone", "الهاتف")}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="email"
        placeholder={translate("Email", "Email", "البريد الإلكتروني")}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <textarea
        placeholder={translate("Votre message...", "Your message...", "رسالتك...")}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[120px]"
        required
      ></textarea>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
      >
        {translate("Envoyer", "Send", "إرسال")}
      </button>
    </form>
  </div>
</section>

      {/* Footer */}
<footer className="footer" role="contentinfo" aria-label={translate("Pied de page", "Footer", "تذييل الصفحة")}>
  <p className="footer-copy">
    © {new Date().getFullYear()} BsyBot. {translate("Tous droits réservés.", "All rights reserved.", "جميع الحقوق محفوظة.")}
  </p>
</footer>

    </div>
  );
};

export default Home;
