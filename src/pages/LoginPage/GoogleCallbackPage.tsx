import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    
    // (혹시 URL에 토큰이 있다면 저장 - 쿠키 방식이면 없을 수도 있음)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }

    // 2. 성공했으면 홈으로 이동
    if (success === 'true' || accessToken) {
      // 쿠키가 세팅되었으므로 바로 홈으로 이동
      navigate('/home', { replace: true });
    } else {
      // 실패했으면 다시 로그인 페이지로
      alert('구글 로그인에 실패했습니다.');
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-700">로그인 처리 중...</h2>
        <p className="text-gray-500">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;