import React, { useState } from 'react';
import logo from '../../assets/Aminorlogo.png';
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
        setLoading(true);

        try {
            // 1. Supabase orqali kirishga urinish
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(), // Probellarni olib tashlaydi
                password: password,
            });

            // 2. Agar Supabase xato qaytarsa
            if (error) {
                // Xatoni aniqroq ko'rsatish
                if (error.message === "Invalid login credentials") {
                    throw new Error("Email yoki parol noto'g'ri!");
                } else if (error.message === "Email not confirmed") {
                    throw new Error("Email tasdiqlanmagan! Supabase-dan 'Confirm email'ni o'chiring.");
                } else {
                    throw error;
                }
            }

            // 3. Muvaffaqiyatli kirish
            if (data.session) {
                toast.success("Xush kelibsiz!");
                navigate('/home');
            }

        } catch (error) {
            console.error("Login xatosi:", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='loginPage'>
            <Paper elevation={10} className="login-card">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <Typography variant="subtitle2" className="brand-tagline">
                        Sifatli va halol mahsulotlar
                    </Typography>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
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
                            mt: 3, py: 1.5, fontWeight: 'bold',
                            bgcolor: '#9f2728',
                            '&:hover': { bgcolor: '#751313' }
                        }}
                    >
                        {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default Login;