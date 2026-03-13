import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-orange-500 hover:text-orange-400 font-bold text-sm uppercase tracking-widest">← Back to PopTheHood</a>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated March 11, 2026</p>

        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">These Terms of Service govern your use of PopTheHood ("we", "us", or "our"), an AI-powered car diagnostic web application available at <a href="https://popthehood.app" className="text-orange-500">popthehood.app</a>. By using PopTheHood, you agree to these terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. AI Diagnostic Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed">PopTheHood provides AI-generated suggestions based on information you provide. These suggestions are for informational purposes only and are <strong>not a substitute for professional mechanical advice</strong>. Always consult a certified mechanic for safety-critical repairs. We are not liable for any damage, injury, or loss resulting from reliance on our AI diagnostic output.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed">You must be at least 13 years of age to use PopTheHood. By using this service you confirm that you meet this requirement.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
          <p className="text-gray-700 leading-relaxed">You may create an account to save your diagnostic history. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You may delete your account at any time by contacting us.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
          <p className="text-gray-700 leading-relaxed mb-2">You agree not to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to reverse engineer or exploit our systems</li>
            <li>Submit false, misleading, or harmful content</li>
            <li>Use automated scripts to abuse our API</li>
            <li>Attempt to circumvent our rate limiting or security measures</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Google Maps Platform</h2>
          <p className="text-gray-700 leading-relaxed">Our service uses Google Maps Platform APIs to help locate nearby mechanics and towing services. By using these features, you agree to be bound by <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-orange-500">Google's Terms of Service</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">All content, branding, and technology associated with PopTheHood is our property. You may not copy, reproduce, or distribute any part of our service without written permission.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">PopTheHood is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our service. Our total liability to you shall not exceed $100.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">We may update these Terms of Service at any time. Continued use of PopTheHood after changes constitutes your acceptance of the new terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">If you have questions about these Terms, contact us at <a href="mailto:devorea723@gmail.com" className="text-orange-500">devorea723@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;