import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { updateGoal } from '@/apis/auth';
import type { AxiosError } from 'axios';

// 백엔드 에러 응답 타입
interface ErrorResponse {
  error: {
    errorCode: string;
    reason: string;
  };
}

const RECOMMEND_KEYWORDS = [
  '여행 가기', '주식투자', '저축', '자기개발',
  '노트북 구매', '차량 구매', '부모님 선물'
];

const SocialGoalPage = () => {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [inputVal, setInputVal] = useState(''); 
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);

  // --- 이벤트 핸들러 ---
  const handleConfirm = () => {
    const trimmed = inputVal.trim();
    if (trimmed.length > 0) {
      setSelectedGoal(trimmed);
      setInputVal(''); 
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSelectedGoal(keyword);
    setInputVal('');
  };

  const handleRemoveGoal = () => {
    setSelectedGoal(null);
  };

  // '다음' (저장) 버튼 클릭
  const handleNext = async () => {
    if (!selectedGoal || isLoading) return;
    await submitGoal(selectedGoal);
  };

  // '건너뛰기' 클릭
  const handleSkip = async () => {
    if (isLoading) return;
    await submitGoal('목표 없음');
  };

  // 목표 저장 로직 (API 호출)
  const submitGoal = async (goal: string) => {
    setIsLoading(true);
    try {
      // 1. 목표 수정 API 호출
      await updateGoal(goal);
      
      // 2. 성공 시 홈으로 이동 (로그인 프로세스 완료)
      navigate('/home', { replace: true });
      
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      if (errorCode === 'U004') {
        alert('목표는 10자 이하만 가능합니다.');
      } else {
        alert(errorReason || '목표 설정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI 렌더링 ---
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-24">
      {/* 모바일 뷰 최적화 컨테이너 */}
      <div className="w-full max-w-sm animate-fade-in">
        
        {/* 상단: 건너뛰기 버튼 */}
        <div className="mb-6 flex justify-between items-start">
          <div className="invisible"></div> 
          <button 
            onClick={handleSkip} 
            disabled={isLoading}
            className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            건너뛰기
          </button>
        </div>

        {/* 타이틀 영역 */}
        <div className="mb-8">
          <div className="text-xs text-gray-400 mb-1">
            선택한 목표를 얼마나 달성했는지 보여줘요. (선택)
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            소비 절약으로 이루고 싶은 목표가 있나요?<br />
            <span className="text-sm font-normal text-gray-500">(하나만 선택해 주세요.)</span>
          </h2>
        </div>

        {/* 입력 및 선택 영역 */}
        <div className="space-y-6">
          
          {/* 입력창 + 확정 버튼 */}
          <div className="flex gap-2 h-[54px]">
            <div className={`relative flex-1 rounded-xl border px-3 transition-all flex items-center
              ${selectedGoal ? 'border-primary-600 bg-white' : 'border-gray-200'}`}
            >
              {selectedGoal ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-600 bg-white px-3 py-1.5">
                  <span className="text-sm font-bold text-gray-800 pt-0.5">{selectedGoal}</span>
                  <button
                    type="button"
                    aria-label="선택한 목표 삭제"
                    onClick={handleRemoveGoal}
                    className="text-gray-400 hover:text-gray-600 flex items-center"
                  >
                    <IoClose size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  maxLength={10}
                  placeholder="목표를 입력하세요...(10자 이내)"
                  aria-label="목표"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300 px-1"
                />
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={inputVal.trim().length === 0 || selectedGoal !== null}
              className={`rounded-xl px-4 text-sm font-bold text-white transition-colors shrink-0
                ${(inputVal.trim().length > 0 && !selectedGoal) 
                  ? 'bg-primary-brown-300 hover:bg-primary-brown-400' 
                  : 'bg-gray-200' 
                }
              `}
            >
              확정
            </button>
          </div>

          {/* 추천 키워드 */}
          <div>
            <p className="mb-3 text-xs text-gray-400">추천 키워드</p>
            <div className="flex flex-wrap gap-2">
              {RECOMMEND_KEYWORDS.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleKeywordClick(keyword)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors
                    ${selectedGoal === keyword
                      ? 'border-primary-600 bg-primary-600 text-white' 
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <button
          onClick={handleNext}
          disabled={!selectedGoal || isLoading}
          className={`mt-20 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
            selectedGoal ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
          }`}
        >
          {isLoading ? '저장 중...' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default SocialGoalPage;