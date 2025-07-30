import React, { useState, useEffect } from 'react';
import { Heart, Loader2, AlertCircle, Globe, TestTube } from 'lucide-react';
import { pay, getPaymentStatus } from '@base-org/account';
import confetti from 'canvas-confetti';
import memeAudio from './assets/meme.mp3';
import './App.css'

export default function DonateToJoshua() {
  const [amount, setAmount] = useState('10.00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'completed' | 'failed' | null>(null);
  const [currentTxId, setCurrentTxId] = useState<string | null>(null);
  const [isTestnet, setIsTestnet] = useState(true);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const RECIPIENT_ADDRESS = '0xc707EF9aaD513Ff3E35033fA1863268f879f9Fa0';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const result = await pay({
        amount: amount,
        to: RECIPIENT_ADDRESS,
        testnet: isTestnet
      });

      // Handle the result based on the actual Base Pay SDK response structure
      const txId = (result as any).id || (result as any).transactionId || (result as any).hash;
      setCurrentTxId(txId);

      const { status } = await getPaymentStatus({ 
        id: txId, 
        testnet: isTestnet 
      });

      if (status === 'completed') {
        setPaymentStatus('completed');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    setPaymentStatus(null);
    setCurrentTxId(null);
    setHasPlayedAudio(false);
  };

  // Effect to play audio and confetti when payment completes
  useEffect(() => {
    if (paymentStatus === 'completed' && !hasPlayedAudio) {
      setHasPlayedAudio(true);
      
      // Play success audio
      const audio = new Audio(memeAudio);
      audio.volume = 0.5; // Set volume to 50%
      setCurrentAudio(audio);
      audio.play().catch((error) => {
        console.error('Audio play failed:', error);
      });
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [paymentStatus, hasPlayedAudio]);

  if (paymentStatus === 'completed') {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <img 
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3F1dnhqeWhmNThwNDJpaTF6aHo5cTBmenh2cmRxaTJ6NGJqNGQ4NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S43RIQ4OtWGKMTyU8q/giphy.gif"
            alt="Success celebration"
            className="w-90 h-60 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            ${amount} USDC sent to Joshua
          </p>
          {currentTxId && (
            <div className="bg-gray-100 rounded p-3 mb-4 text-xs">
              <strong>TX ID:</strong> {currentTxId}
            </div>
          )}
          <button
            onClick={resetPayment}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Make Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-8 max-w-4xl w-full">
        {/* Left side - Donation card */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full lg:w-1/2">
          <div className="text-center mb-6">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Donate to Joshua</h1>
            <p className="text-gray-600">Send USDC on Base Network</p>
          </div>

        {/* Network Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Network</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsTestnet(true)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                isTestnet 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testnet
            </button>
            <button
              onClick={() => setIsTestnet(false)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded text-sm font-medium transition-colors ${
                !isTestnet 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Mainnet
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="10.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['5.00', '10.00', '25.00', '50.00'].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount)}
              className={`py-2 px-3 text-sm rounded border transition-colors ${
                amount === quickAmount
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              ${quickAmount}
            </button>
          ))}
        </div>

        {/* Status Message */}
        {paymentStatus === 'processing' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin mr-2" />
            <span className="text-yellow-700">Processing payment...</span>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Payment failed. Please try again.</span>
          </div>
        )}

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Donate $${amount || '0.00'} USDC`
          )}
        </button>

          {/* Recipient Info */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Recipient: {RECIPIENT_ADDRESS.slice(0, 6)}...{RECIPIENT_ADDRESS.slice(-4)}</p>
            <p className="mt-1">
              {isTestnet ? '⚠️ Base Sepolia Testnet' : '🔒 Base Mainnet'}
            </p>
          </div>
        </div>

        {/* Vertical border - hidden on mobile */}
        <div className="hidden lg:block w-px bg-gray-300 self-stretch"></div>

        {/* Right side - Bio card */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full lg:w-1/2">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              J
            </div>
            <h2 className="text-2xl font-bold mb-2">Joshua</h2>
            <p className="text-gray-600">Developer & Creator</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">About Me</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                I'm a passionate developer who loves building innovative solutions and contributing to the tech community. Your support helps me continue creating amazing projects!
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-center">Connect With Me</h3>
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <a href="https://x.com/blockchain_Josh" className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 sm:p-3 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://github.com/Josh0007-sunday" className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 sm:p-3 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}