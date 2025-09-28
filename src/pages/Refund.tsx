import React from "react";

const RefundPage: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
    <div className="space-y-5 text-gray-300">
      <p>
        Futbotclub provides access to digital tools (including SBC solutions and planning
        utilities). Due to the instant and intangible nature of digital services, purchases are
        generally non-refundable once access is granted.
      </p>

      <h2 className="text-xl font-semibold text-white">Exceptions</h2>
      <p>
        We may consider refunds in limited cases, such as duplicate purchase or extended service
        outage that prevents reasonable use. Requests must be submitted within 7 days of purchase
        with relevant details.
      </p>

      <h2 className="text-xl font-semibold text-white">How to Request</h2>
      <p>
        To request a refund review, contact <a className="text-blue-400" href="mailto:info@futbot.club">info@futbot.club</a> with your order information and an explanation of the issue.
      </p>
    </div>
  </div>
);

export default RefundPage;
