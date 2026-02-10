import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMe } from '@/apis/LoginPage/auth'; // 아까 만든 내 정보 조회 API

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      try {
        // 1. URL에서 에러가 있는지 먼저 확인 (백엔드가 success=false 등을 보냈을 경우)
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (error || success === 'false') {
          throw new Error('Google Login Failed');
        }

        // 2. 토큰을 URL에서 꺼내는 게 아니라(X),
        //    쿠키가 잘 들어왔는지 내 정보 조회 API로 확인(O)
        await getMe();

        // 3. 성공하면 홈으로 이동 (뒤로가기 방지 replace: true)
        navigate('/home', { replace: true });
      } catch (error) {
        console.error('구글 로그인 실패:', error instanceof Error ? error.message : 'Unknown error');
        alert('구글 로그인에 실패했습니다. 다시 시도해 주세요.');
        navigate('/login', { replace: true });
      }
    };

    completeGoogleLogin();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-gray-700">로그인 중입니다...</h2>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
