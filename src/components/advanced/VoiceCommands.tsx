
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoiceCommandsProps {
  onCommand: (command: string, params?: any) => void;
  isEnabled?: boolean;
}

interface Recognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => Recognition;
    SpeechRecognition: new () => Recognition;
  }
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onCommand, isEnabled = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice command patterns
  const commandPatterns = {
    balance: /(?:check|show|what(?:'s| is))\s+(?:my\s+)?balance/i,
    send: /send\s+(?:money\s+)?(?:to\s+)?(.+)/i,
    withdraw: /withdraw\s+(\d+)/i,
    deposit: /deposit\s+(\d+)/i,
    bills: /(?:pay\s+)?bills?|show\s+bills?/i,
    loans: /(?:my\s+)?loans?|show\s+loans?/i,
    help: /help|commands?|what\s+can\s+(?:i|you)\s+do/i,
    logout: /(?:log\s+out|sign\s+out|exit)/i,
    transactions: /(?:show\s+)?(?:my\s+)?transactions?|transaction\s+history/i,
    settings: /settings?|preferences?/i
  };

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptResult = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptResult;
          } else {
            interimTranscript += transcriptResult;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.trim());
        }
      };

      recognitionInstance.onerror = (event) => {
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processVoiceCommand = (command: string) => {
    setLastCommand(command);
    setError('');

    // Check each command pattern
    for (const [commandType, pattern] of Object.entries(commandPatterns)) {
      const match = command.match(pattern);
      if (match) {
        executeCommand(commandType, match);
        return;
      }
    }

    // If no pattern matches, show help
    speak("I didn't understand that command. Say 'help' to see available commands.");
    setError("Command not recognized. Try saying 'help' for available commands.");
  };

  const executeCommand = (commandType: string, match: RegExpMatchArray) => {
    let response = '';
    let params: any = {};

    switch (commandType) {
      case 'balance':
        response = 'Checking your account balance...';
        onCommand('BALANCE_INQUIRY');
        break;
      
      case 'send':
        const recipient = match[1]?.trim();
        if (recipient) {
          response = `Preparing to send money to ${recipient}...`;
          params = { recipient };
          onCommand('SEND_MONEY', params);
        } else {
          response = 'Please specify who you want to send money to.';
        }
        break;
      
      case 'withdraw':
        const withdrawAmount = parseInt(match[1]);
        if (withdrawAmount > 0) {
          response = `Preparing to withdraw ${withdrawAmount} shillings...`;
          params = { amount: withdrawAmount };
          onCommand('WITHDRAWAL', params);
        } else {
          response = 'Please specify a valid amount to withdraw.';
        }
        break;
      
      case 'deposit':
        const depositAmount = parseInt(match[1]);
        if (depositAmount > 0) {
          response = `Preparing to deposit ${depositAmount} shillings...`;
          params = { amount: depositAmount };
          onCommand('DEPOSIT', params);
        } else {
          response = 'Please specify a valid amount to deposit.';
        }
        break;
      
      case 'bills':
        response = 'Showing your bills...';
        onCommand('VIEW_BILLS');
        break;
      
      case 'loans':
        response = 'Showing your loan information...';
        onCommand('VIEW_LOANS');
        break;
      
      case 'transactions':
        response = 'Showing your transaction history...';
        onCommand('VIEW_TRANSACTIONS');
        break;
      
      case 'settings':
        response = 'Opening settings...';
        onCommand('VIEW_SETTINGS');
        break;
      
      case 'help':
        response = `Available voice commands: Check balance, Send money, Withdraw amount, Deposit amount, Show bills, Show loans, Show transactions, Settings, or Log out.`;
        break;
      
      case 'logout':
        response = 'Logging you out...';
        onCommand('LOGOUT');
        break;
      
      default:
        response = 'Command not recognized.';
    }

    if (response) {
      speak(response);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition || !isEnabled) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      setError('');
      recognition.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          Voice commands are not supported in this browser.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Panel */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={toggleListening}
                disabled={!isEnabled}
                className={`relative ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 border-red-500' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-md border-2 border-red-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="border-gray-600 hover:border-gray-500"
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Badge 
                  variant={isListening ? "default" : "secondary"} 
                  className={isListening ? "bg-red-600" : "bg-gray-600"}
                >
                  {isListening ? 'Listening...' : 'Voice Commands'}
                </Badge>
                
                {isSpeaking && (
                  <Badge className="bg-blue-600">
                    Speaking...
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak("Available commands: Check balance, Send money, Withdraw, Deposit, Show bills, Show loans, Show transactions, Settings, or Log out.")}
              className="text-gray-400 hover:text-white"
            >
              Help
            </Button>
          </div>

          {/* Live Transcript */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">You said:</span> "{transcript}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last Command */}
          {lastCommand && (
            <div className="mt-2 text-xs text-gray-500">
              Last command: "{lastCommand}"
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Command Examples */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-white mb-3">Voice Command Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
            <div>"Check my balance"</div>
            <div>"Send money to John"</div>
            <div>"Withdraw 5000"</div>
            <div>"Show my bills"</div>
            <div>"Show transactions"</div>
            <div>"Help"</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCommands;
