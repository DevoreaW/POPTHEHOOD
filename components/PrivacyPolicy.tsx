import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-orange-500 hover:text-orange-400 font-bold text-sm uppercase tracking-widest">← Back to PopTheHood</a>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated March 11, 2026</p>

        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">This Privacy Policy describes how PopTheHood ("we", "us", or "our") collects, uses, and shares information when you use our AI-powered car diagnostic web application at <a href="https://popthehood.app" className="text-orange-500">popthehood.app</a>. By using PopTheHood, you agree to the practices described in this policy.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-3">We collect information you provide directly when you create an account, including your name, email address, and username via our authentication provider Clerk. We may also collect information through Google Sign-In if you choose that option.</p>
          <p className="text-gray-700 leading-relaxed">We automatically collect device data, IP addresses, browser type, and usage information when you interact with our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-2">We use your information to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Provide and improve our AI diagnostic services</li>
            <li>Manage your account and authenticate you</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Protect the security of our services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-2">We share data with the following third-party services to operate PopTheHood:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li><strong>Google Cloud AI</strong> — powers our AI diagnostic engine</li>
            <li><strong>Clerk</strong> — handles user authentication</li>
            <li><strong>Vercel</strong> — hosts our web application</li>
            <li><strong>Upstash</strong> — manages rate limiting</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">We do not sell your personal information to third parties.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Diagnostic Data</h2>
          <p className="text-gray-700 leading-relaxed">When you submit vehicle symptoms or images for diagnosis, that content is sent to Google Cloud AI for processing. Please do not include sensitive personal information in your diagnostic descriptions.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Location Data</h2>
          <p className="text-gray-700 leading-relaxed">If you use our mechanic or towing finder feature, we request access to your device location. This data is used only in the moment to find nearby services and is not stored.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">We retain your personal information for as long as your account is active. You may delete your account at any time by contacting us at <a href="mailto:devorea723@gmail.com" className="text-orange-500">devorea723@gmail.com</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">You have the right to access, correct, or delete your personal information. California residents have additional rights under CCPA. To exercise your rights, contact us at <a href="mailto:devorea723@gmail.com" className="text-orange-500">devorea723@gmail.com</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">PopTheHood is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">If you have questions about this Privacy Policy, contact us at <a href="mailto:devorea723@gmail.com" className="text-orange-500">devorea723@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;