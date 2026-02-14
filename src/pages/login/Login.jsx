import React, { useState } from 'react';
import logo from '../../assets/Aminorlogo.png';
import {
    Box, TextField, Button, Typography, Paper,
    InputAdornment, IconButton
} from '@mui/material';
import { Phone, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import './login.css';

const Login = () => {
    const [phone, setPhone] = useState('+998');
    const [password, setPassword] = useState('');
    // Ko'zcha holati uchun yangi state
    const [showPassword, setShowPassword] = useState(false);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (!value.startsWith('+998')) {
            setPhone('+998');
            return;
        }
        const cleanValue = value.replace(/[^\d+]/g, '');
        if (cleanValue.length <= 13) {
            setPhone(cleanValue);
        }
    };

    // Ko'zcha bosilganda holatni o'zgartirish
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleLogin = (e) => {
        e.preventDefault();

        if (phone.length !== 13) {
            toast.error("Telefon raqami noto'g'ri kiritilgan!");
            return;
        }

        if (!password) {
            toast.warning("Iltimos, parolni kiriting!");
            return;
        }

        if (phone === "+998979359707" && password === "12345") {
            sessionStorage.setItem("token", "true");
            toast.success("Xush kelibsiz!");

            setTimeout(() => {
                window.location.replace("/");
            }, 500);
        } else {
            toast.error("Telefon raqami yoki parol xato!");
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

                    <Box className="input-group">
                        <TextField
                            fullWidth
                            label="Telefon raqami"
                            variant="outlined"
                            value={phone}
                            onChange={handlePhoneChange}
                            sx={{
                                mb: 2,
                                '& label.Mui-focused': { color: 'var(--primary-color)' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Parol"
                            // showPassword holatiga qarab type o'zgaradi
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& label.Mui-focused': { color: 'var(--primary-color)' },
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: 'var(--primary-color)' },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                // O'ng tomondagi ko'zcha qismi
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
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
                        className="submit-btn"
                        sx={{ mt: 3, bgcolor: 'var(--primary-color)', '&:hover': { bgcolor: 'var(--primary-hover-color)' } }}
                    >
                        Kirish
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default Login;