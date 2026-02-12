import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import logo from '../../assets/seed.svg';
import { login } from '../../apis/auth';
import { AxiosError } from 'axios';

// 백엔드 에러 응답 타입 정의 (API 명세서 기준)
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

  // 에러 메시지 상태 관리
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 유효성 검사
  const isEmailValid = email.length > 0;
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  // 3. 로그인 핸들러: 에러 코드 분기 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 요청 전 에러 초기화
    setEmailError('');
    setPasswordError('');

    if (!isFormValid) return;

    try {
      // 1. API 호출
      await login({ email, password });

      // 2. 홈으로 이동
      navigate('/home');
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('로그인 실패:', err.response?.data?.error?.reason ?? err.message);

      // 백엔드 에러 코드 추출
      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      //  에러 코드에 따른 메시지 매핑
      if (errorCode === 'U001') {
        // U001: 존재하지 않는 계정
        setEmailError('존재하지 않는 계정입니다.');
      } else if (errorCode === 'U002') {
        // U002: 비밀번호 불일치 (또는 소셜 로그인 계정)
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        // 그 외 에러 (서버 오류 등)
        alert(errorReason || '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 4. 구글 로그인 버튼 로직
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
  };

  // 5. 카카오 로그인 버튼 로직 (기존 주소 사용)
  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/kakao/login`;
  };

  const getInputWrapperClass = (isValid: boolean, hasError: boolean) => {
    const baseClass =
      'flex items-center w-full h-12 rounded-lg border px-4 transition-all bg-white';

    if (hasError) return `${baseClass} border-red-500 bg-red-50 focus-within:border-red-500`;
    if (isValid) return `${baseClass} border-primary-600 bg-primary-50 ring-1 ring-primary-600`;
    return `${baseClass} border-gray-200 focus-within:border-primary-600`;
  };

  const inputInternalClass = 'flex-1 w-full h-full bg-transparent outline-none text-sm placeholder:text-gray-400 min-w-0 appearance-none m-0 p-0 text-gray-900';

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
          {/* Wrapper 적용 */}
          <div className={getInputWrapperClass(isEmailValid, !!emailError)}>
            <input
              type="email"
              placeholder="이메일"
              aria-label="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={inputInternalClass}
            />
          </div>
          {/* 🔥 이메일 에러 메시지 */}
          {emailError && <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">{emailError}</p>}
        </div>

        {/* 비밀번호 입력 */}
        <div>
          {/* 🔥 [구조 변경] relative/absolute 제거하고 flex container로 변경 */}
          <div className={getInputWrapperClass(isPasswordValid, !!passwordError)}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              className={inputInternalClass}
            />
            {/* 버튼을 입력창 옆에 나란히 배치 */}
            <button
              type="button"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors ${
                isPasswordValid ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
            </button>
          </div>
          {/* 비밀번호 에러 메시지 */}
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
        {/* 4. 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-medium transition-colors hover:bg-gray-50">
          <FcGoogle size={20} />
          구글 로그인
        </button>

        {/*  카카오 로그인 */}
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