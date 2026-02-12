import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { AxiosError } from 'axios';

import logo from '../../assets/seed.svg';
import { login } from '../../apis/auth';

interface ErrorResponse {
  error: {
    errorCode: string;
    reason: string;
  };
}

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isEmailValid = email.length > 0;
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const getInputClass = (isValid: boolean, hasError: boolean) => {
    const baseClass =
      'w-full rounded-lg border px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-colors';

    // 1순위: 에러 있음 (빨간색)
    if (hasError) {
      return `${baseClass} border-red-500 bg-red-50 focus:border-red-500`;
    }
    // 2순위: 유효함 (초록색)
    if (isValid) {
      return `${baseClass} border-primary-600 bg-primary-50 focus:border-primary-600`;
    }
    // 3순위: 기본 (회색)
    return `${baseClass} border-gray-200 focus:border-primary-600`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 요청 전 에러 초기화
    setEmailError('');
    setPasswordError('');

    if (!isFormValid) return;

    try {
      await login({ email, password });
      navigate('/home');
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('로그인 실패:', err.response?.data?.error?.reason ?? err.message);

      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      if (errorCode === 'U001') {
        setEmailError('존재하지 않는 계정입니다.');
      } else if (errorCode === 'U002') {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        alert(errorReason || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 구글 로그인
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
  };

  // 카카오 로그인
  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/kakao/login`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-24">
      {/* 1. 로고 */}
      <div className="mb-12 flex items-center justify-center">
        <img src={logo} alt="donakawa logo" className="w-8" />
        <h1 className="font-['Galmuri11'] text-[27px] font-bold text-primary-600 pt-2">onakawa</h1>
      </div>

      {/* 2. 로그인 폼 */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {/* 이메일 입력 */}
        <div>
          <input
            type="email"
            placeholder="이메일"
            aria-label="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            className={`${getInputClass(isEmailValid, !!emailError)} text-gray-900`}
            autoComplete="email"
            inputMode="email"
          />
          {emailError && <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">{emailError}</p>}
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              aria-label="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              className={`${getInputClass(isPasswordValid, !!passwordError)} pr-12 text-gray-900`}
              autoComplete="current-password"
            />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((v) => !v)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                isPasswordValid ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
              {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
            </button>
          </div>

          {passwordError && <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">{passwordError}</p>}
        </div>

        {/* 비밀번호 재설정 */}
        <div className="flex justify-end">
          <Link to="/find-password" className="text-xs text-gray-400 hover:underline">
            비밀번호 재설정
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`mt-4 w-full rounded-lg py-3.5 font-bold text-white transition-colors ${
            isFormValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
          }`}>
          로그인
        </button>
      </form>

      {/* 3. 소셜 로그인 및 회원가입 */}
      <div className="mt-8 w-full max-w-sm space-y-4">
        {/* 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-medium transition-colors hover:bg-gray-50">
          <FcGoogle size={20} />
          구글 로그인
        </button>

        {/* 카카오 로그인 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-medium text-black transition-colors hover:bg-gray-50">
          <RiKakaoTalkFill size={20} />
          카카오 로그인
        </button>

        {/* 회원가입 링크 */}
        <div className="pt-2 text-center">
          <Link to="/signup" className="text-sm font-medium text-primary-brown-300 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
