import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { HiCheck } from 'react-icons/hi';

const RECOMMEND_KEYWORDS = [
  '여행 가기', '주식투자', '저축', '자기개발',
  '노트북 구매', '차량 구매', '부모님 선물'
];

const Step4Goal = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [inputVal, setInputVal] = useState(''); // 입력창 값
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null); // 확정된 목표
  const [isCompleteScreen, setIsCompleteScreen] = useState(false); // 가입 완료 화면 표시 여부

  // 목표 확정 처리
  const handleConfirm = () => {
    const trimmed = inputVal.trim();
    if (trimmed.length > 0) {
      setSelectedGoal(trimmed);
      setInputVal(''); // 입력창 비우기
    }
  };

  // 키워드 클릭 처리
  const handleKeywordClick = (keyword: string) => {
    setSelectedGoal(keyword);
    setInputVal('');
  };

  // 목표 삭제 (X 버튼)
  const handleRemoveGoal = () => {
    setSelectedGoal(null);
  };

  // '다음' 버튼 클릭 (완료 화면으로 이동)
  const handleNext = () => {
    setIsCompleteScreen(true);
  };

  // '건너뛰기' 클릭
  const handleSkip = () => {
    setIsCompleteScreen(true);
  };

  // 최종 '도나카와 시작하기' 버튼 (메인 or 로그인 이동)
  const handleStart = () => {
    navigate('/login');
  };

  // --- 화면 2: 가입 완료 화면 ---
  if (isCompleteScreen) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center animate-fade-in text-center pt-20">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            {/* 체크 아이콘 */}
            <div className="z-10 text-7xl text-black">
                <HiCheck /> 
            </div>
        </div>
        
        <h2 className="mb-20 text-xl font-bold text-gray-900">
          회원가입이 완료되었습니다.
        </h2>

        <button
          onClick={handleStart}
          className="w-full rounded-xl bg-primary-600 py-4 text-sm font-bold text-white hover:bg-primary-500 transition-colors"
        >
          도나카와 시작하기
        </button>
      </div>
    );
  }

  // --- 화면 1: 목표 설정 화면 ---
  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* 상단 건너뛰기 버튼 */}
      <div className="mb-6 flex justify-between items-start">
        <div className="invisible"></div> {/* 공간 차지용 */}
        <button onClick={handleSkip} className="text-xs text-gray-400 underline">
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
        
        {/* 1. 입력창 영역 */}
        <div className="flex gap-2 h-[54px]"> {/* 높이 고정으로 레이아웃 흔들림 방지 */}
          <div className={`relative flex-1 rounded-xl border px-3 transition-all flex items-center
             ${selectedGoal ? 'border-primary-600 bg-white' : 'border-gray-200'}`}
          >
            {selectedGoal ? (
              // 목표가 선택되었을 때 (캡슐 모양 스타일 적용)
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
              // 입력 중일 때
              <input
                type="text"
                maxLength={10}
                placeholder="목표를 입력하세요...(10자 이내)"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300 px-1"
              />
            )}
          </div>

          {/* 확정 버튼 */}
          <button
            onClick={handleConfirm}
            disabled={inputVal.length === 0 || selectedGoal !== null}
            className={`rounded-xl px-4 text-sm font-bold text-white transition-colors shrink-0
              ${(inputVal.length > 0 && !selectedGoal) 
                ? 'bg-primary-brown-300 hover:bg-primary-brown-400' // 입력 중일 때 활성 (갈색)
                : 'bg-gray-200' 
              }
            `}
          >
            확정
          </button>
        </div>

        {/* 2. 추천 키워드 영역 */}
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

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!selectedGoal}
        className={`mt-20 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
          selectedGoal ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
        }`}
      >
        다음
      </button>
    </div>
  );
};

export default Step4Goal;