import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import logo from '../../assets/seed.svg';

const LoginPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 간단한 유효성 검사 (길이 체크)
  const isEmailValid = email.length > 0;
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  // 3. 로그인 버튼 로직 
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // TODO: 나중에 여기에 백엔드 API 연결 (axios.post...)
    console.log('로그인 정보:', { email });
    
    // 일단 무조건 홈으로 이동시킴 (테스트용)
    navigate('/home'); 
  };

  // 4. 구글 로그인 버튼 로직
  const handleGoogleLogin = () => {
      alert('구글 로그인 기능은 백엔드 연결 후 구현됩니다!');
  };

  const getInputClass = (isValid: boolean) => {
    const baseClass =
      'w-full rounded-lg border px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-colors';
    if (isValid) {
      return `${baseClass} border-primary-600 bg-primary-50 focus:border-primary-600`;
    }
    return `${baseClass} border-gray-200 focus:border-primary-600`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-24">
      {/* 1. 로고 및 타이틀 영역 */}
      <div className="mb-12 flex items-center justify-center">
        <img src={logo} alt="donakawa logo" className="w-8" />
        <h1 className="font-['Galmuri11'] text-[27px] font-bold text-primary-600 pt-2">onakawa</h1>
      </div>

      {/* 2. 로그인 폼 영역 */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {/* 이메일 입력 */}
        <div>
          <input
            type="email"
            placeholder="이메일"
            aria-label="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={getInputClass(isEmailValid)}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            aria-label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${getInputClass(isPasswordValid)} pr-12`}
          />
          {/* 6. 눈 모양 아이콘 토글 */}
          <button
            type="button"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
              isPasswordValid ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {showPassword ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        </div>

        {/* 2. 아이디/비밀번호 찾기 (기능 없음, 링크만 존재) */}
        <div className="flex justify-end">
          <button type="button" className="text-xs text-gray-400 hover:underline">
            아이디/ 비밀번호 찾기
          </button>
        </div>

        {/* 3. 로그인 버튼 */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`mt-4 w-full rounded-lg py-3.5 font-bold text-white transition-colors ${
            isFormValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
          }`}
        >
          로그인
        </button>
      </form>

      {/* 3. 소셜 로그인 및 회원가입 */}
      <div className="mt-8 w-full max-w-sm space-y-4">
        {/* 4. 구글 로그인 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3.5 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <FcGoogle size={20} />
          구글 로그인
        </button>

        {/* 5. 회원가입 링크 */}
        <div className="text-center">
          <Link to="/signup" className="text-sm font-medium text-primary-brown-300 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;