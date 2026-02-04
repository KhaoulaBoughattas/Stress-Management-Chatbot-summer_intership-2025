// src/public/MedecinPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Medecin.css';

const logo = '/images/Logo.png';

const MedecinPage = () => {
  const [language, setLanguage] = useState('fr');

  // États pour formulaire
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const translate = (fr, en, ar) => {
    if (language === 'fr') return fr;
    if (language === 'en') return en;
    return ar;
  };

  // Gestion envoi mail
  const handleSubmit = (e) => {
    e.preventDefault();

    const mailto = `mailto:boughattaskhawla@gmail.com` +
                   `?subject=${encodeURIComponent('Demande de contact')}` +
                   `&body=${encodeURIComponent(
                     `Nom: ${lastName}\nPrénom: ${firstName}\nEmail: ${email}\n\nMessage:\n${message}`
                   )}`;

    window.location.href = mailto;
  };

  return (
    <div className={`medecin-container ${language === 'ar' ? 'rtl' : ''}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="navbar-title">{translate("Espace Médecin", "Doctor's Space", "مساحة الطبيب")}</span>
        </div>
        <div className="navbar-center">
          <Link to="/dashboard" className="nav-link">{translate("Dashboard", "Dashboard", "لوحة التحكم")}</Link>
          <Link to="/historique" className="nav-link">{translate("Historique", "History", "السجل")}</Link>
          <Link to="/hopital" className="nav-link">{translate("Hôpital", "Hospital", "المستشفى")}</Link>
        </div>
        <div className="navbar-right">
          <select
            className="language-selector"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            aria-label={translate("Sélection de la langue", "Language selection", "اختيار اللغة")}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </nav>

      {/* Section Accueil Médecin */}
<section className="med-hero-section">
  <div className="med-hero-logo">
    <img
      src={logo}
      alt={translate("Logo de l'espace médecin", "Doctor space logo", "شعار مساحة الطبيب")}
      className="med-hero-image"
    />
  </div>
  <h1>{translate(
    "Bienvenue dans l'espace Médecin",
    "Welcome to the Doctor's Space",
    "مرحبًا بك في مساحة الطبيب"
  )}</h1>
  <p>{translate(
    "Votre tableau de bord personnalisé pour suivre vos patients, accéder aux historiques et gérer vos rendez-vous.",
    "Your personalized dashboard to track patients, access history, and manage appointments.",
    "لوحة التحكم الشخصية الخاصة بك لتتبع المرضى، الوصول إلى السجلات وإدارة المواعيد."
  )}</p>
</section>


      {/* Section Services Médecins */}
<section className="med-services-section">
  <h2>{translate("Services disponibles", "Available Services", "الخدمات المتاحة")}</h2>
  
  <div className="med-services-content">
    {/* Cards à gauche */}
    <div className="med-services-grid">
      <div className="med-service-card" tabIndex={0}>
        <h3>{translate("Dashboard complet", "Comprehensive Dashboard", "لوحة تحكم شاملة")}</h3>
        <p>{translate(
          "Visualisez toutes les données importantes de vos patients en un seul endroit.",
          "View all important patient data in one place.",
          "عرض جميع بيانات المرضى المهمة في مكان واحد."
        )}</p>
      </div>
      <div className="med-service-card" tabIndex={0}>
        <h3>{translate("Historique médical", "Medical History", "السجل الطبي")}</h3>
        <p>{translate(
          "Accédez rapidement aux résultats des tests stai_scores.",
          "Quickly access stai_scores test results.",
          "الوصول السريع إلى نتائج اختبارات stai_scores."
        )}</p>
      </div>
      <div className="med-service-card" tabIndex={0}>
        <h3>{translate("Gestion des hôpitaux", "Hospital Management", "إدارة المستشفيات")}</h3>
        <p>{translate(
          "Consultez les conversations des patients pour réaliser vos analyses.",
          "View patient conversations to perform your analysis.",
          "اطلع على محادثات المرضى لإجراء تحليلاتك."
        )}</p>
      </div>
    </div>

    {/* Image à droite */}
    <div className="med-service-img">
      <img
        src="/images/img.png"
        alt={translate("Illustration des services", "Services illustration", "رسم توضيحي للخدمات")}
        className="med-services-illustration"
      />
    </div>
  </div>
</section>


      {/* Section Informations complémentaires Médecin */}
<section className="med-info-section">
  <h2>{translate("Pourquoi choisir notre plateforme ?", "Why choose our platform?", "لماذا تختار منصتنا؟")}</h2>
  <p className="med-info-subtitle">
    {translate(
      "Un environnement fiable, ergonomique et pensé pour les professionnels de santé.",
      "A reliable, ergonomic environment designed for healthcare professionals.",
      "بيئة موثوقة وسهلة الاستخدام مصممة لمقدمي الرعاية الصحية."
    )}
  </p>

  <div className="med-info-content">
    {/* Image à gauche */}
    <div className="med-info-img">
      <img
        src="/images/img8.png"
        alt={translate("Sécurité", "Security", "الأمان")}
        className="med-info-image"
      />
    </div>

    {/* Texte + avantages */}
    <div className="med-info-text">
      <p>
        {translate(
          "Notre espace médecin est conçu pour faciliter votre travail au quotidien, vous fournir des outils performants et garantir la sécurité des données de vos patients.",
          "Our doctor space is designed to make your daily work easier, provide you with powerful tools, and ensure patient data security.",
          "تم تصميم مساحة الطبيب الخاصة بنا لتسهيل عملك اليومي، وتزويدك بأدوات قوية، وضمان أمان بيانات مرضاك."
        )}
      </p>

      <div className="med-info-features">
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <h3>{translate("Sécurité renforcée", "Enhanced Security", "أمان معزز")}</h3>
          <p>{translate("Protection maximale des données médicales.", "Maximum protection of medical data.", "حماية قصوى للبيانات الطبية.")}</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <h3>{translate("Performance", "Performance", "الأداء")}</h3>
          <p>{translate("Accès rapide et fluide aux informations.", "Fast and smooth access to information.", "وصول سريع وسلس إلى المعلومات.")}</p>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🌍</span>
          <h3>{translate("Accessibilité", "Accessibility", "إمكانية الوصول")}</h3>
          <p>{translate("Disponible partout et sur tout appareil.", "Available anywhere and on any device.", "متاح في كل مكان وعلى أي جهاز.")}</p>
        </div>
      </div>

    </div>
  </div>
</section>


     {/* Section Contact */}
<section className="med-contact-section">
  <h2 className="med-title">
    {translate("Contactez-nous", "Contact Us", "تواصل معنا")}
  </h2>

  <div className="med-contact-content">
    {/* Partie gauche : texte + image */}
    <div className="med-contact-info">
      <h3>{translate("Nous sommes là pour vous", "We are here for you", "نحن هنا من أجلك")}</h3>
      <p>{translate(
          "Une question ? Un problème technique ? Notre équipe est à votre écoute.",
          "Any questions? Technical issues? Our team is here for you.",
          "هل لديك أسئلة؟ مشاكل تقنية؟ فريقنا هنا لمساعدتك."
        )}</p>
      <img
        src="/images/img9.png"
        alt={translate("Support illustration", "Support illustration", "رسم توضيحي للدعم")}
        className="med-contact-image"
      />
    </div>

    {/* Formulaire */}
    <form className="med-contact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={translate("Nom", "Last Name", "اللقب")}
        className="med-input-field"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder={translate("Prénom", "First Name", "الاسم")}
        className="med-input-field"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder={translate("Email", "Email", "البريد الإلكتروني")}
        className="med-input-field"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder={translate("Votre message...", "Your message...", "رسالتك...")}
        className="med-input-field med-textarea-field"
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
      ></textarea>
      <button type="submit" className="med-submit-button">
        {translate("Envoyer", "Send", "إرسال")}
      </button>
    </form>
  </div>
</section>

      {/* Footer */}
      <footer className="footer" role="contentinfo" aria-label={translate("Pied de page", "Footer", "تذييل الصفحة")}>
        <p>© {new Date().getFullYear()} BsyBot. {translate("Tous droits réservés.", "All rights reserved.", "جميع الحقوق محفوظة.")}</p>
      </footer>
    </div>
  );
};

export default MedecinPage;
