import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMe } from '@/apis/auth';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completeSocialLogin = async () => {
      try {
        // 1. URL에서 에러가 있는지 확인
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        // 실패 케이스 처리
        if (error || success === 'false') {
          throw new Error('Social Login Failed');
        }

        // 2. 쿠키(토큰)가 잘 들어왔는지 '내 정보 조회'로 확인
        await getMe();

        // 3. 성공하면 홈으로 이동
        navigate('/home', { replace: true });
      } catch (error) {
        console.error('소셜 로그인 실패:', error instanceof Error ? error.message : 'Unknown error');
        alert('로그인에 실패했습니다. 다시 시도해 주세요.');
        navigate('/login', { replace: true });
      }
    };

    completeSocialLogin();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-gray-700">로그인 중입니다...</h2>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
