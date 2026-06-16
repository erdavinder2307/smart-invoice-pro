import React from 'react';
import { Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import DemoLanding from '../pages/DemoLanding';
import Login from './Auth/Login';
import Signup from '../pages/Signup';
import { isDemoHost } from '../utils/demoMode';

export const RootPage = () => (isDemoHost() ? <DemoLanding /> : <Home />);

export const DemoAwareLogin = () =>
  isDemoHost() ? <Navigate to="/" replace /> : <Login />;

export const DemoAwareSignup = () =>
  isDemoHost() ? <Navigate to="/" replace /> : <Signup />;
