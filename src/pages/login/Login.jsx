import React, { useState } from 'react';
import logo from '../../assets/image.png';
import {
    Box, TextField, Button, Typography, Paper,
    InputAdornment, IconButton
} from '@mui/material';

import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Visibility, VisibilityOff, Email } from '@mui/icons-material';
import { toast } from 'react-toastify';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });   

            if (error) {
                if (error.message === "Invalid login credentials") {
                    throw new Error("Login yoki Parol xato!");
                }
                if (error.message === "Email not confirmed") {
                    throw new Error("Email tasdiqlanmagan!");
                }
                throw error;
            }

            // Session yozilishini kutamiz (browserga qarab kechikishi mumkin)
            let session = null;

            for (let i = 0; i < 6; i++) {
                const { data } = await supabase.auth.getSession();
                session = data.session;
                if (session) break;
                await new Promise(res => setTimeout(res, 250));
            }

            if (!session) {
                throw new Error("Session saqlanmadi. Qaytadan urinib ko‘ring.");
            }

            toast.success("Muvaffaqiyatli kirildi!");
            navigate('/home');

        } catch (error) {
            console.error("Login xatosi:", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-width'>
        <div className='loginPage'>
            <Paper elevation={10} className="login-card">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <Typography variant="subtitle2" className="brand-tagline">
                        Sifatli va halol mahsulotlar
                    </Typography>
                </div>

                <form className="login-form" onSubmit={handleLogin} autoComplete="off">
                    <Typography variant="h5" className="form-title">Kirish</Typography>

                    <Box className="input-group" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            type={showPassword ? "text" : "password"}
                            label="Parol"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            fontWeight: 'bold',
                            bgcolor: '#9f2728',
                            '&:hover': { bgcolor: '#751313' }
                        }}
                    >
                        {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
                    </Button>
                </form>
            </Paper>
        </div>
        </div>
    );
};

export default Login;
