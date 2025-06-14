import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
} from "@heroui/react";
import { useAuth } from '../context/authContext';

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            // Redirect to home page after successful registration
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Sign Up</h1>
                    <p className="text-default-500">Create your account</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-4">
                        {error && (
                            <div className="text-red-500">{error}</div>
                        )}
                        <Input
                            name="username"
                            label="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <Input
                            name="password"
                            type="password"
                            label="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        <Input
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </CardBody>
                    <CardFooter className="flex justify-between">
                        <Button
                            color="danger"
                            variant="light"
                            onPress={() => navigate('/')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            isLoading={isLoading}
                        >
                            Sign Up
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
} 