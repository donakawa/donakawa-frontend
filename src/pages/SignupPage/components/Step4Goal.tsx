import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { HiCheck } from 'react-icons/hi';
import { register, login } from '../../../api/auth';
import { AxiosError } from 'axios';

interface Props {
  formData: {
    email: string;
    password: string;
    nickname: string;
    goal: string;
  };
}

const RECOMMEND_KEYWORDS = [
  '여행 가기', '주식투자', '저축', '자기개발',
  '노트북 구매', '차량 구매', '부모님 선물'
];

const Step4Goal = ({ formData }: Props) => {
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(''); 
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null); 
  const [isCompleteScreen, setIsCompleteScreen] = useState(false); 

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

  // 1. [수정] '다음' 버튼 클릭 -> 회원가입 + 자동 로그인
  const handleNext = async () => {
    if (!selectedGoal) return;

    try {
      // 1) 보낼 데이터 합치기
      const finalData = {
        ...formData,
        goal: selectedGoal,
      };

      console.log('회원가입 요청 데이터:', finalData);

      // 2) 회원가입 API 호출
      await register(finalData);

      // 회원가입 성공 시 바로 로그인 API 호출 (토큰 받기)
      console.log('자동 로그인 시도...');
      const loginData = await login({ email: formData.email, password: formData.password });
      
      //  토큰 저장
      localStorage.setItem('accessToken', loginData.accessToken);
      if (loginData.refreshToken) {
        localStorage.setItem('refreshToken', loginData.refreshToken);
      }

      // 3) 완료 화면으로 전환
      setIsCompleteScreen(true);

    } catch (error) {
      const err = error as AxiosError;
      console.error('진행 실패:', err);
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 2. [수정] '건너뛰기' 클릭 -> 회원가입 + 자동 로그인
  const handleSkip = async () => {
    try {
      const finalData = {
        ...formData,
        goal: '목표 없음',
      };
      
      console.log('회원가입 요청(건너뛰기):', finalData);

      // 1) 회원가입 API 호출
      await register(finalData);

      //  회원가입 성공 시 바로 로그인 API 호출
      console.log('자동 로그인 시도...');
      const loginData = await login({ email: formData.email, password: formData.password });
      
      //  토큰 저장
      localStorage.setItem('accessToken', loginData.accessToken);
      if (loginData.refreshToken) {
        localStorage.setItem('refreshToken', loginData.refreshToken);
      }

      setIsCompleteScreen(true);

    } catch (error) {
      console.error('진행 실패:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  // 닫기(X) 버튼 클릭 -> 로그인 화면 이동
  const handleClose = () => {
    navigate('/login');
  };

  // 시작하기 버튼 클릭 -> 홈 화면(로그인 상태) 이동
  const handleStart = () => {
    navigate('/home'); 
  };

  // --- 화면 2: 가입 완료 화면 ---
  if (isCompleteScreen) {
    return (
      <div className="fixed inset-0 z-50 flex w-full flex-col items-center bg-white pt-4">
        <div className="flex w-full max-w-sm flex-col items-center animate-fade-in text-center pt-20 relative h-full">
            <button 
                onClick={handleClose} 
                className="absolute top-5 right-6 text-2xl text-gray-800 p-2"
                aria-label="닫기"
            >
                <IoClose />
            </button>

            <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
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
      </div>
    );
  }

  // --- 화면 1: 목표 설정 화면 ---
  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="mb-6 flex justify-between items-start">
        <div className="invisible"></div> 
        <button onClick={handleSkip} className="text-xs text-gray-400 underline">
            건너뛰기
        </button>
      </div>

      <div className="mb-8">
        <div className="text-xs text-gray-400 mb-1">
            선택한 목표를 얼마나 달성했는지 보여줘요. (선택)
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          소비 절약으로 이루고 싶은 목표가 있나요?<br />
          <span className="text-sm font-normal text-gray-500">(하나만 선택해 주세요.)</span>
        </h2>
      </div>

      <div className="space-y-6">
        
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
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300 px-1"
              />
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={inputVal.length === 0 || selectedGoal !== null}
            className={`rounded-xl px-4 text-sm font-bold text-white transition-colors shrink-0
              ${(inputVal.length > 0 && !selectedGoal) 
                ? 'bg-primary-brown-300 hover:bg-primary-brown-400' 
                : 'bg-gray-200' 
              }
            `}
          >
            확정
          </button>
        </div>

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