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

        // 2. 내 정보 조회
        const user = await getMe();

        // 3. 목표(goal)가 비어있으면 설정 페이지로 보냄!
        // (주의: 백엔드가 목표 없을 때 null을 주는지, 빈 문자열 ""을 주는지 확인 필요)
        if (!user.goal || user.goal.trim() === '') {
          navigate('/social/goal', { replace: true });
        } else {
          // 목표가 이미 있으면 홈으로
          navigate('/home', { replace: true });
        }
        
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
        <h2 className="mb-4 text-xl font-bold text-gray-700">로그인 정보를 확인 중입니다...</h2>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
