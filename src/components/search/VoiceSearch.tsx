import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import aiService from '@/lib/ai-service';
import { useLocation } from 'wouter';
import { PropertySearchParams } from '@shared/schema';
import { useTranslation } from 'react-i18next';

export default function VoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { t } = useTranslation('search');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);
  
  // Voice search mutation
  const voiceSearchMutation = useMutation({
    mutationFn: async (command: string) => {
      return await aiService.searchProperties(command);
    },
    onSuccess: (data) => {
      // Navigate to search results with the extracted parameters
      const queryParams = new URLSearchParams();
      
      // Add all valid search parameters to the URL
      Object.entries(data.parameters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      navigate(`/search?${queryParams.toString()}`);
      
      // Show success toast
      toast({
        title: t('search.voiceSearch.searchCompleted'),
        description: t('search.voiceSearch.foundProperties', { count: data.results.total }),
      });
    },
    onError: (error) => {
      toast({
        title: t('search.voiceSearch.failed'),
        description: error instanceof Error ? error.message : t('search.voiceSearch.failedDesc'),
        variant: 'destructive',
      });
    },
  });
  
  const handleVoiceCommand = async () => {
    if (!transcript.trim()) {
      toast({
        title: t('search.voiceSearch.noInput'),
        description: t('search.voiceSearch.speakClearly'),
        variant: 'destructive',
      });
      return;
    }
    
    setProcessingCommand(true);
    try {
      await voiceSearchMutation.mutateAsync(transcript);
    } finally {
      setProcessingCommand(false);
      resetTranscript();
    }
  };
  
  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };
  
  const stopListening = () => {
    SpeechRecognition.stopListening();
  };
  
  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('search.voiceSearch.title')}</CardTitle>
          <CardDescription>{t('search.voiceSearch.notAvailable')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {t('search.voiceSearch.notAvailableDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!isMicrophoneAvailable) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t('search.voiceSearch.title')}</CardTitle>
          <CardDescription>{t('search.voiceSearch.microphoneRequired')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {t('search.voiceSearch.microphoneRequiredDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{t('search.voiceSearch.title')}</span>
          {isListening && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        </CardTitle>
        <CardDescription>
          {isListening 
            ? t('search.voiceSearch.listening')
            : t('search.voiceSearch.clickToStart')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="min-h-[100px] p-4 border rounded-md bg-muted/50">
          {transcript ? transcript : 
            <span className="text-muted-foreground">
              {isListening ? t('search.voiceSearch.listeningStatus') : t('search.voiceSearch.voicePrompt')}
            </span>
          }
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>{t('search.voiceSearch.trySaying')}</p>
          <ul className="list-disc list-inside">
            <li>{t('search.voiceSearch.exampleCommands.apartments')}</li>
            <li>{t('search.voiceSearch.exampleCommands.houses')}</li>
            <li>{t('search.voiceSearch.exampleCommands.villas')}</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-between">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={processingCommand}
          className={`h-12 w-12 rounded-full ${isListening ? 'bg-red-600 text-white hover:bg-white hover:text-red-600' : 'bg-[#131313] text-white hover:bg-white hover:text-[#131313]'} transition-all`}
        >
          {isListening ? <MicOff /> : <Mic />}
        </Button>
        
        <Button
          onClick={handleVoiceCommand}
          disabled={!transcript || processingCommand || isListening}
          className="flex-1 bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
        >
          {processingCommand ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('search.voiceSearch.processing')}
            </>
          ) : (
            t('search.voiceSearch.searchProperties')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}