import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import logo from '../../assets/seed.svg';
import { login } from '../../api/auth';
import { AxiosError } from 'axios'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 구글 로그인 후 돌아왔을 때 토큰 처리 로직 
  useEffect(() => {
    // 1. 주소창의 쿼리 파라미터(?accessToken=...)를 가져옴
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    // 2. 토큰이 있다면 로그인 처리
    if (accessToken) {
      console.log('구글 로그인 성공! 토큰:', accessToken);
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // 3. 홈으로 이동 (replace: true는 뒤로가기 했을 때 로그인 페이지로 다시 안 오게 함)
      navigate('/home', { replace: true });
    }
  }, [location, navigate]);

  // 간단한 유효성 검사 (길이 체크)
  const isEmailValid = email.length > 0;
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  // 3. 로그인 버튼 로직 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      // 1. API 호출
      const data = await login({ email, password });
      
      console.log('로그인 성공!', data);

      // 2. 토큰 저장 (보통 로컬 스토리지에 저장)
      // 백엔드에서 주는 이름(accessToken 등)에 맞춰서 저장하세요.
      localStorage.setItem('accessToken', data.accessToken); 

      // 3. 홈으로 이동
      navigate('/home'); 

    } catch (error) {
      const err = error as AxiosError;
      console.error('로그인 실패:', err);
      
      // 4. 에러 처리 (alert 등)
      // 백엔드 에러 메시지 구조에 따라 다를 수 있음 (err.response?.data.message 등)
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  // 4. 구글 로그인 버튼 로직
  const handleGoogleLogin = () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google-login`;
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