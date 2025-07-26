import { useAuth } from '@/hooks/use-auth';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPasswordMutation } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.invalidToken'));
    }
  }, [token, t]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!token) {
      setError(t('resetPassword.invalidToken'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordsDoNotMatch'));
      return;
    }
    
    if (newPassword.length < 8) {
      setError(t('resetPassword.passwordTooShort'));
      return;
    }
    
    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetPassword.error'));
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          {t('resetPassword.title')}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {t('resetPassword.success')}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label={t('resetPassword.newPassword')}
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={resetPasswordMutation.isPending || success}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('resetPassword.confirmPassword')}
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={resetPasswordMutation.isPending || success}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={resetPasswordMutation.isPending || success}
          >
            {resetPasswordMutation.isPending ? t('common.loading') : t('resetPassword.resetButton')}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/auth')}
            disabled={resetPasswordMutation.isPending}
          >
            {t('common.backToLogin')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 