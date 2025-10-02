import React from "react";

const RefundPage: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
    <div className="space-y-5 text-gray-300">
      <p>
        futbclub (Futbotclub) provides access to digital tools (including SBC solutions and planning
        utilities). We are committed to customer satisfaction and offer a fair refund policy.
      </p>

      <h2 className="text-xl font-semibold text-white">Refund Period</h2>
      <p>
        You may request a refund within 14 days of your purchase. We are committed to 
        providing a fair refund policy in accordance with consumer protection standards 
        and Paddle's requirements.
      </p>

      <h2 className="text-xl font-semibold text-white">Eligible Refunds</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Technical issues preventing access to the service</li>
        <li>Duplicate purchases</li>
        <li>Service not as described</li>
        <li>Extended service outages (more than 48 hours)</li>
        <li>Billing errors or unauthorized charges</li>
      </ul>

      <h2 className="text-xl font-semibold text-white">How to Request</h2>
      <p>
        To request a refund, contact <a className="text-blue-400" href="mailto:contact@futbot.club">contact@futbot.club</a> 
        within 14 days of purchase with your order information and reason for the refund request.
        Refunds will be processed within 1-5 business days to your original payment method.
      </p>

      <h2 className="text-xl font-semibold text-white">Non-Refundable Items</h2>
      <p>
        Due to the instant and intangible nature of digital services, refunds may not be available 
        for services that have been fully accessed or used extensively, except in cases outlined above.
      </p>
    </div>
  </div>
);

export default RefundPage;
